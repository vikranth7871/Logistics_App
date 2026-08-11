import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Executive dashboard KPI summary' })
  getDashboard(@Query('period') period: string, @CurrentUser() user: JwtPayload) {
    return this.reportsService.getDashboard(period || 'month', user.companyId);
  }

  @Get('profitability')
  @ApiOperation({ summary: 'Trip and vehicle profitability' })
  getProfitability(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getProfitability(user.companyId);
  }

  @Get('expenses-breakdown')
  @ApiOperation({ summary: 'Category-wise expense breakdown' })
  getExpenseBreakdown(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getExpenseBreakdown(user.companyId);
  }
}
