/**
 * React Query hooks for all ERP modules.
 * All data fetching goes through these hooks — never call API functions directly in components.
 * This gives us: caching, deduplication, background refresh, optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  fleetApi, tripApi, driverApi, fuelApi,
  expenseApi, customerApi, billingApi, reportsApi,
} from '@api/index';
import { getErrorMessage } from '@api/client';

// ── Query Keys ─────────────────────────────────────────────────────────────
// Centralised so cache invalidation is consistent across all mutations
export const QK = {
  fleet: {
    all: ['fleet', 'vehicles'] as const,
    list: (params: any) => ['fleet', 'vehicles', 'list', params] as const,
    detail: (id: string) => ['fleet', 'vehicles', id] as const,
    documents: (id: string) => ['fleet', 'vehicles', id, 'documents'] as const,
    expiring: (days: number) => ['fleet', 'documents', 'expiring', days] as const,
    summary: ['fleet', 'summary'] as const,
  },
  drivers: {
    all: ['drivers'] as const,
    list: (params: any) => ['drivers', 'list', params] as const,
    detail: (id: string) => ['drivers', id] as const,
    available: ['drivers', 'available'] as const,
  },
  trips: {
    all: ['trips'] as const,
    list: (params: any) => ['trips', 'list', params] as const,
    detail: (id: string) => ['trips', id] as const,
    active: ['trips', 'active'] as const,
    summary: ['trips', 'summary'] as const,
  },
  fuel: {
    list: (params: any) => ['fuel', 'list', params] as const,
    analytics: (vehicleId?: string) => ['fuel', 'analytics', vehicleId] as const,
  },
  expenses: {
    list: (params: any) => ['expenses', 'list', params] as const,
    summary: ['expenses', 'summary'] as const,
  },
  customers: {
    list: (params: any) => ['customers', 'list', params] as const,
    detail: (id: string) => ['customers', id] as const,
    balance: (id: string) => ['customers', id, 'balance'] as const,
  },
  billing: {
    list: (params: any) => ['invoices', 'list', params] as const,
    detail: (id: string) => ['invoices', id] as const,
    outstanding: ['invoices', 'outstanding'] as const,
  },
  reports: {
    dashboard: (period: string) => ['reports', 'dashboard', period] as const,
    revenue: (params: any) => ['reports', 'revenue', params] as const,
    profitability: ['reports', 'profitability'] as const,
    expenseBreakdown: ['reports', 'expenseBreakdown'] as const,
  },
};

// ── FLEET HOOKS ────────────────────────────────────────────────────────────

export function useVehicles(params: any = {}) {
  return useQuery({
    queryKey: QK.fleet.list(params),
    queryFn: () => fleetApi.getVehicles(params),
    staleTime: 60_000,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: QK.fleet.detail(id),
    queryFn: () => fleetApi.getVehicle(id),
    enabled: !!id,
  });
}

export function useFleetSummary() {
  return useQuery({
    queryKey: QK.fleet.summary,
    queryFn: fleetApi.getFleetSummary,
    staleTime: 30_000,
    refetchInterval: 60_000, // auto-refresh every 1 min for dashboard
  });
}

export function useExpiringDocuments(days = 30) {
  return useQuery({
    queryKey: QK.fleet.expiring(days),
    queryFn: () => fleetApi.getExpiringDocuments(days),
    staleTime: 5 * 60_000,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fleetApi.createVehicle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.fleet.all });
      qc.invalidateQueries({ queryKey: QK.fleet.summary });
      toast.success('Vehicle created successfully');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateVehicle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fleetApi.updateVehicle(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.fleet.detail(id) });
      qc.invalidateQueries({ queryKey: QK.fleet.all });
      toast.success('Vehicle updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fleetApi.deleteVehicle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.fleet.all });
      qc.invalidateQueries({ queryKey: QK.fleet.summary });
      toast.success('Vehicle removed');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ── DRIVER HOOKS ───────────────────────────────────────────────────────────

export function useDrivers(params: any = {}) {
  return useQuery({
    queryKey: QK.drivers.list(params),
    queryFn: () => driverApi.getDrivers(params),
    staleTime: 60_000,
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: QK.drivers.detail(id),
    queryFn: () => driverApi.getDriver(id),
    enabled: !!id,
  });
}

export function useAvailableDrivers() {
  return useQuery({
    queryKey: QK.drivers.available,
    queryFn: driverApi.getAvailableDrivers,
    staleTime: 30_000,
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: driverApi.createDriver,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.drivers.all });
      toast.success('Driver added successfully');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateDriver(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => driverApi.updateDriver(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.drivers.detail(id) });
      qc.invalidateQueries({ queryKey: QK.drivers.all });
      toast.success('Driver updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => driverApi.deleteDriver(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.drivers.all });
      toast.success('Driver deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useAssignDriverVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driverId, vehicleId }: { driverId: string; vehicleId: string }) =>
      driverApi.assignVehicle(driverId, vehicleId),
    onSuccess: (_, { driverId }) => {
      qc.invalidateQueries({ queryKey: QK.drivers.detail(driverId) });
      qc.invalidateQueries({ queryKey: QK.drivers.all });
      qc.invalidateQueries({ queryKey: QK.fleet.all });
      toast.success('Vehicle assignment updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ── TRIP HOOKS ─────────────────────────────────────────────────────────────

export function useTrips(params: any = {}) {
  return useQuery({
    queryKey: QK.trips.list(params),
    queryFn: () => tripApi.getTrips(params),
    staleTime: 20_000, // trips change faster
    refetchInterval: 30_000,
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: QK.trips.detail(id),
    queryFn: () => tripApi.getTrip(id),
    enabled: !!id,
    staleTime: 10_000,
  });
}

export function useTripSummary() {
  return useQuery({
    queryKey: QK.trips.summary,
    queryFn: tripApi.getTripSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tripApi.createTrip,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.trips.all });
      toast.success('Trip created');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      tripApi.updateTrip(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.trips.detail(id) });
      qc.invalidateQueries({ queryKey: QK.trips.all });
      toast.success('Trip updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useStartTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, odometer }: { id: string; odometer?: number }) =>
      tripApi.startTrip(id, odometer),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.trips.detail(id) });
      qc.invalidateQueries({ queryKey: QK.trips.all });
      qc.invalidateQueries({ queryKey: QK.fleet.summary });
      toast.success('Trip started');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeliverTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripApi.deliverTrip(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: QK.trips.detail(id) });
      qc.invalidateQueries({ queryKey: QK.trips.all });
      qc.invalidateQueries({ queryKey: QK.fleet.summary });
      toast.success('Trip marked as delivered');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useCompleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, endOdometer }: { id: string; endOdometer?: number }) =>
      tripApi.completeTrip(id, endOdometer),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.trips.detail(id) });
      qc.invalidateQueries({ queryKey: QK.trips.all });
      qc.invalidateQueries({ queryKey: QK.fleet.summary });
      toast.success('Trip completed');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripApi.deleteTrip(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.trips.all });
      qc.invalidateQueries({ queryKey: QK.fleet.summary });
      toast.success('Trip deleted');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useUploadDeliveryProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      tripApi.uploadDeliveryProof(id, file),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QK.trips.detail(id) });
      toast.success('Delivery proof uploaded');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ── DASHBOARD / REPORTS ────────────────────────────────────────────────────

export function useDashboard(period = 'month') {
  return useQuery({
    queryKey: QK.reports.dashboard(period),
    queryFn: () => reportsApi.getDashboard(period),
    staleTime: 30_000,
    refetchInterval: 2 * 60_000, // refresh every 2 min
  });
}

export function useVehicleProfitability() {
  return useQuery({
    queryKey: QK.reports.profitability,
    queryFn: () => reportsApi.getProfitability(),
    staleTime: 60_000,
  });
}

export function useExpenseBreakdown() {
  return useQuery({
    queryKey: QK.reports.expenseBreakdown,
    queryFn: () => reportsApi.getExpenseBreakdown(),
    staleTime: 60_000,
  });
}

// ── CUSTOMERS ─────────────────────────────────────────────────────────────

export function useCustomers(params: any = {}) {
  return useQuery({
    queryKey: QK.customers.list(params),
    queryFn: () => customerApi.getCustomers(params),
    staleTime: 60_000,
  });
}

// ── FUEL ─────────────────────────────────────────────────────────────────

export function useFuelEntries(params: any = {}) {
  return useQuery({
    queryKey: QK.fuel.list(params),
    queryFn: () => fuelApi.getFuelEntries(params),
    staleTime: 60_000,
  });
}

export function useCreateFuelEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fuelApi.createFuelEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fuel'] });
      toast.success('Fuel entry recorded');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ── EXPENSES ──────────────────────────────────────────────────────────────

export function useExpenses(params: any = {}) {
  return useQuery({
    queryKey: QK.expenses.list(params),
    queryFn: () => expenseApi.getExpenses(params),
    staleTime: 60_000,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: expenseApi.createExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense recorded');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

// ── BILLING ───────────────────────────────────────────────────────────────

export function useInvoices(params: any = {}) {
  return useQuery({
    queryKey: QK.billing.list(params),
    queryFn: () => billingApi.getInvoices(params),
    staleTime: 60_000,
  });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: billingApi.createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
