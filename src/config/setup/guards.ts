import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

export function getGlobalGuards(reflector: Reflector) {
  return [new JwtAuthGuard(reflector), new RolesGuard(reflector)];
}
