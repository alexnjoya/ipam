// Export all services from a single entry point
export { authService, default as auth } from './auth.service';
export { subnetService, default as subnet } from './subnet.service';
export { ipAddressService, default as ipAddress } from './ipAddress.service';
export { reservationService, default as reservation } from './reservation.service';
export { reportService, default as report } from './report.service';
export { auditService, default as audit } from './audit.service';
export { userService, default as user } from './user.service';

// Export base API
export { default as BaseApi } from './baseApi';
export type { ApiResponse } from './baseApi';

// Re-export types for convenience
export type * from '../types';

// Legacy API service for backward compatibility
import { authService } from './auth.service';
import { subnetService } from './subnet.service';
import { ipAddressService } from './ipAddress.service';
import { reservationService } from './reservation.service';
import { reportService } from './report.service';
import { auditService } from './audit.service';
import { userService } from './user.service';

class ApiService {
  // Auth
  login = authService.login.bind(authService);
  register = authService.register.bind(authService);
  getMe = authService.getMe.bind(authService);
  updateProfile = authService.updateProfile.bind(authService);
  changePassword = authService.changePassword.bind(authService);

  // Subnets
  getSubnets = subnetService.getSubnets.bind(subnetService);
  getSubnetById = subnetService.getSubnetById.bind(subnetService);
  createSubnet = subnetService.createSubnet.bind(subnetService);
  updateSubnet = subnetService.updateSubnet.bind(subnetService);
  deleteSubnet = subnetService.deleteSubnet.bind(subnetService);

  // IP Addresses
  getIpAddresses = ipAddressService.getIpAddresses.bind(ipAddressService);
  assignIpAddress = ipAddressService.assignIpAddress.bind(ipAddressService);
  updateIpAddress = ipAddressService.updateIpAddress.bind(ipAddressService);
  releaseIpAddress = ipAddressService.releaseIpAddress.bind(ipAddressService);

  // Reservations
  getReservations = reservationService.getReservations.bind(reservationService);
  createReservation = reservationService.createReservation.bind(reservationService);
  updateReservation = reservationService.updateReservation.bind(reservationService);
  deleteReservation = reservationService.deleteReservation.bind(reservationService);

  // Reports
  getUtilizationReport = reportService.getUtilizationReport.bind(reportService);
  getStatusReport = reportService.getStatusReport.bind(reportService);

  // Audit
  getAuditLogs = auditService.getAuditLogs.bind(auditService);

  // Users
  getUsers = userService.getUsers.bind(userService);
  createUser = userService.createUser.bind(userService);
  updateUser = userService.updateUser.bind(userService);
  deleteUser = userService.deleteUser.bind(userService);
}

export const api = new ApiService();
export default api;

