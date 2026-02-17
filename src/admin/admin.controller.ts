import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { Role } from 'generated/prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('ADMIN')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  getDashBoard() {
    return this.adminService.getDashboardStats();
  }
}
