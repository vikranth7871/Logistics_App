import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  ParseUUIDPipe, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all company users (Admin only)' })
  findAll(
    @Query() query: PaginationDto & { search?: string; role?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.findAll(query, user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.usersService.findOne(id, user.companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create / invite new user' })
  create(@Body() body: any, @CurrentUser() user: JwtPayload) {
    return this.usersService.create(body, user.companyId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user role or profile' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.usersService.update(id, body, user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.usersService.remove(id, user.companyId);
  }
}
