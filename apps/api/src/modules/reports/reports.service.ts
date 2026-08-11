import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../trips/entities/trip.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { FuelEntry } from '../fuel/entities/fuel-entry.entity';
import { Vehicle } from '../fleet/entities/vehicle.entity';
import { MaintenanceRecord } from '../maintenance/entities/maintenance-record.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Trip) private tripRepo: Repository<Trip>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(FuelEntry) private fuelRepo: Repository<FuelEntry>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(MaintenanceRecord) private maintRepo: Repository<MaintenanceRecord>,
  ) {}

  async getDashboard(period = 'month', companyId: string) {
    // Total revenue from completed & delivered trips
    const revRaw = await this.tripRepo
      .createQueryBuilder('t')
      .select('SUM(t.freightAmount)', 'revenue')
      .addSelect('COUNT(t.id)', 'totalTrips')
      .addSelect('SUM(t.distanceKm)', 'totalKm')
      .where('t.companyId = :companyId', { companyId })
      .andWhere('t.status IN (:...statuses)', { statuses: ['completed', 'delivered', 'in_progress'] })
      .getRawOne();

    // Total general expenses
    const expRaw = await this.expenseRepo
      .createQueryBuilder('e')
      .select('SUM(e.amount)', 'expenses')
      .where('e.companyId = :companyId', { companyId })
      .getRawOne();

    // Total fuel cost & liters
    const fuelRaw = await this.fuelRepo
      .createQueryBuilder('f')
      .select('SUM(f.totalAmount)', 'fuelCost')
      .addSelect('SUM(f.fuelQuantityLiters)', 'totalLiters')
      .where('f.companyId = :companyId', { companyId })
      .getRawOne();

    // Maintenance costs
    const maintRaw = await this.maintRepo
      .createQueryBuilder('m')
      .select('SUM(m.cost)', 'maintCost')
      .where('m.companyId = :companyId', { companyId })
      .getRawOne();

    const revenue = parseFloat(revRaw?.revenue || 0);
    const generalExpenses = parseFloat(expRaw?.expenses || 0);
    const fuelCost = parseFloat(fuelRaw?.fuelCost || 0);
    const maintenanceCost = parseFloat(maintRaw?.maintCost || 0);
    const totalKm = parseFloat(revRaw?.totalKm || 0);
    const totalLiters = parseFloat(fuelRaw?.totalLiters || 0);

    const totalOperatingCosts = generalExpenses + fuelCost + maintenanceCost;
    const netProfit = revenue - totalOperatingCosts;
    const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const avgKmPerLiter = totalLiters > 0 ? totalKm / totalLiters : 0;
    const costPerKm = totalKm > 0 ? totalOperatingCosts / totalKm : 0;
    const revenuePerKm = totalKm > 0 ? revenue / totalKm : 0;

    return {
      revenue,
      expenses: generalExpenses,
      fuelCost,
      maintenanceCost,
      totalOperatingCosts,
      netProfit,
      marginPercent: Math.round(marginPercent * 10) / 10,
      totalTrips: parseInt(revRaw?.totalTrips || 0, 10),
      totalKm,
      avgKmPerLiter: Math.round(avgKmPerLiter * 100) / 100,
      costPerKm: Math.round(costPerKm * 100) / 100,
      revenuePerKm: Math.round(revenuePerKm * 100) / 100,
      period,
    };
  }

  async getProfitability(companyId: string) {
    const vehicles = await this.vehicleRepo.find({
      where: { companyId },
    });

    const results = await Promise.all(
      vehicles.map(async (v) => {
        const revRaw = await this.tripRepo
          .createQueryBuilder('t')
          .select('SUM(t.freightAmount)', 'revenue')
          .addSelect('COUNT(t.id)', 'tripCount')
          .addSelect('SUM(t.distanceKm)', 'km')
          .where('t.vehicleId = :vId', { vId: v.id })
          .andWhere('t.companyId = :cId', { cId: companyId })
          .getRawOne();

        const fuelRaw = await this.fuelRepo
          .createQueryBuilder('f')
          .select('SUM(f.totalAmount)', 'fuelCost')
          .addSelect('SUM(f.fuelQuantityLiters)', 'liters')
          .where('f.vehicleId = :vId', { vId: v.id })
          .andWhere('f.companyId = :cId', { cId: companyId })
          .getRawOne();

        const expRaw = await this.expenseRepo
          .createQueryBuilder('e')
          .select('SUM(e.amount)', 'expCost')
          .where('e.vehicleId = :vId', { vId: v.id })
          .andWhere('e.companyId = :cId', { cId: companyId })
          .getRawOne();

        const maintRaw = await this.maintRepo
          .createQueryBuilder('m')
          .select('SUM(m.cost)', 'maintCost')
          .where('m.vehicleId = :vId', { vId: v.id })
          .andWhere('m.companyId = :cId', { cId: companyId })
          .getRawOne();

        const revenue = parseFloat(revRaw?.revenue || 0);
        const fuelCost = parseFloat(fuelRaw?.fuelCost || 0);
        const expCost = parseFloat(expRaw?.expCost || 0);
        const maintCost = parseFloat(maintRaw?.maintCost || 0);
        const totalCost = fuelCost + expCost + maintCost;
        const profit = revenue - totalCost;
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        const totalKm = parseFloat(revRaw?.km || 0);
        const totalLiters = parseFloat(fuelRaw?.liters || 0);

        return {
          vehicleId: v.id,
          registrationNumber: v.registrationNumber,
          make: v.make,
          model: v.model,
          status: v.status,
          tripCount: parseInt(revRaw?.tripCount || 0, 10),
          totalKm,
          revenue,
          fuelCost,
          expenseCost: expCost,
          maintenanceCost: maintCost,
          totalCost,
          profit,
          marginPercent: Math.round(margin * 10) / 10,
          kmPerLiter: totalLiters > 0 ? Math.round((totalKm / totalLiters) * 10) / 10 : 0,
        };
      })
    );

    return results.sort((a, b) => b.profit - a.profit);
  }

  async getExpenseBreakdown(companyId: string) {
    const raw = await this.expenseRepo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('SUM(e.amount)', 'total')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.companyId = :companyId', { companyId })
      .groupBy('e.category')
      .getRawMany();

    const grandTotal = raw.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);

    return raw.map((r) => {
      const amount = parseFloat(r.total || 0);
      return {
        category: r.category,
        amount,
        count: parseInt(r.count, 10),
        percentage: grandTotal > 0 ? Math.round((amount / grandTotal) * 100) : 0,
      };
    });
  }
}
