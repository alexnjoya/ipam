# IPAM Client Testing Guide

This guide provides comprehensive testing scenarios and sample data for the IPAM (IP Address Management) client application.

## Table of Contents
1. [Setup & Prerequisites](#setup--prerequisites)
2. [Test Credentials](#test-credentials)
3. [Authentication Testing](#authentication-testing)
4. [Dashboard Testing](#dashboard-testing)
5. [Subnet Management Testing](#subnet-management-testing)
6. [IP Address Management Testing](#ip-address-management-testing)
7. [Reservations Testing](#reservations-testing)
8. [Reports Testing](#reports-testing)
9. [User Management Testing](#user-management-testing)
10. [Settings & Account Testing](#settings--account-testing)
11. [Common Test Scenarios](#common-test-scenarios)
12. [Troubleshooting](#troubleshooting)

---

## Setup & Prerequisites

### Local Development Setup

1. **Install Dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Configure Environment**
   - Create `.env` file (optional):
     ```
     VITE_API_URL=http://localhost:3000
     ```
   - Or use default: `https://ipam-yary.onrender.com`

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   - Application will be available at `http://localhost:5173`

### Production Testing

- **Client URL**: `https://ipam-pi.vercel.app`
- **API URL**: `https://ipam-yary.onrender.com/api`

---

## Test Credentials

### Default Admin Account
- **Email**: `admin@ipam.com`
- **Password**: `admin123`
- **Role**: `admin`

### Creating Test Users
After logging in as admin, you can create additional test users with different roles:
- **Admin**: Full access
- **User**: Standard access (no user management)
- **Readonly**: Read-only access

---

## Authentication Testing

### Test Case 1: Successful Login
1. Navigate to login page
2. Enter credentials:
   - Email: `admin@ipam.com`
   - Password: `admin123`
3. Click "Sign in"
4. **Expected**: Redirect to Dashboard, token stored in localStorage

### Test Case 2: Invalid Credentials
1. Enter incorrect email or password
2. Click "Sign in"
3. **Expected**: Error message displayed, stay on login page

### Test Case 3: Protected Routes
1. Logout or clear localStorage
2. Try to access `/dashboard` or `/subnets` directly
3. **Expected**: Redirect to login page

### Test Case 4: Token Expiration
1. Login successfully
2. Manually expire token in localStorage
3. Try to access protected route
4. **Expected**: Redirect to login with error message

---

## Dashboard Testing

### Test Case 1: View Dashboard Overview
1. Login as admin
2. Navigate to Dashboard (`/`)
3. **Expected**: 
   - Subnet utilization chart displayed
   - Total subnets count
   - Recent subnets table
   - Utilization statistics

### Test Case 2: Empty State
1. Fresh database (no subnets)
2. View dashboard
3. **Expected**: 
   - "No subnets found" message
   - Empty state UI displayed

### Test Case 3: Utilization Charts
1. Create subnets with assigned IPs
2. View dashboard
3. **Expected**: 
   - Pie chart showing Used vs Available IPs
   - Correct percentages calculated
   - Color-coded segments

---

## Subnet Management Testing

### Sample Subnet Data

#### IPv4 Subnet
```json
{
  "networkAddress": "192.168.1.0",
  "subnetMask": 24,
  "description": "Main office network",
  "location": "Main Office",
  "vlanId": 100
}
```

#### IPv6 Subnet
```json
{
  "networkAddress": "2001:db8::",
  "subnetMask": 64,
  "description": "Main office IPv6 network",
  "location": "Main Office",
  "vlanId": 100
}
```

### Test Case 1: Create IPv4 Subnet
1. Navigate to Subnets page (`/subnets`)
2. Click "Create Subnet" button
3. Fill form:
   - Network Address: `192.168.1.0`
   - Subnet Mask: `24`
   - Description: `Test IPv4 Subnet`
   - Location: `Test Location`
   - VLAN ID: `100`
4. Click "Create"
5. **Expected**: 
   - Subnet created successfully
   - Appears in subnets list
   - CIDR shows as `192.168.1.0/24`

### Test Case 2: Create IPv6 Subnet
1. Click "Create Subnet"
2. Fill form:
   - Network Address: `2001:db8::`
   - Subnet Mask: `64`
   - Description: `Test IPv6 Subnet`
3. Click "Create"
4. **Expected**: 
   - IPv6 subnet created
   - CIDR shows as `2001:db8::/64`

### Test Case 3: Invalid Subnet Mask
1. Try to create subnet with:
   - IPv4 address + mask > 32
   - IPv6 address + mask > 128
2. **Expected**: Validation error displayed

### Test Case 4: Duplicate Subnet
1. Create subnet with existing network address and mask
2. Try to create same subnet again
3. **Expected**: Error message "Subnet already exists"

### Test Case 5: Update Subnet
1. Click edit icon on existing subnet
2. Modify description or location
3. Save changes
4. **Expected**: Subnet updated, changes reflected in list

### Test Case 6: Delete Subnet
1. Click delete icon on subnet
2. Confirm deletion in modal
3. **Expected**: 
   - Subnet removed from list
   - Associated IPs also deleted (cascade)

### Test Case 7: Search & Filter
1. Create multiple subnets with different locations
2. Use search bar to filter
3. Filter by location
4. **Expected**: 
   - Search filters by CIDR, description, location
   - Location filter works correctly

### Test Case 8: Pagination
1. Create more than 10 subnets
2. Navigate through pages
3. **Expected**: 
   - Pagination controls appear
   - Can navigate between pages
   - Page numbers update correctly

---

## IP Address Management Testing

### Test Case 1: Automatic IP Assignment
1. Navigate to IP Addresses (`/ip-addresses`)
2. Click "Assign IP" button
3. Select a subnet from dropdown (required)
4. Leave "IP Address" field blank (for automatic assignment)
5. Fill optional fields:
   - Hostname: `server-01.example.com`
   - MAC Address: `00:1B:44:11:3A:B7`
   - Device Name: `Web Server`
   - Assigned To: `John Doe`
   - Description: `Production web server`
   - Status: `ASSIGNED` (default, or select: RESERVED, DHCP, STATIC)
6. Click "Assign IP"
7. **Expected**: 
   - First available IP assigned automatically
   - IP appears in list with status "ASSIGNED"
   - All provided information saved (hostname, MAC, device name, assigned to, description)

### Test Case 2: Manual IP Assignment
1. Click "Assign IP" button
2. Select subnet from dropdown
3. Enter specific IP in "IP Address" field: `192.168.1.10`
4. Fill device information:
   - Hostname: `db-server.example.com`
   - MAC Address: `00:1B:44:11:3A:B8`
   - Device Name: `Database Server`
   - Assigned To: `Jane Smith`
   - Description: `Primary database server`
   - Status: `STATIC` (for static IP assignment)
5. Click "Assign IP"
6. **Expected**: 
   - Specific IP `192.168.1.10` assigned
   - IP appears in list with all provided information
   - Status set to "STATIC"

### Test Case 3: IP Outside Subnet Range
1. Try to assign IP: `10.0.0.1` to subnet `192.168.1.0/24`
2. **Expected**: Validation error "IP not within subnet range"

### Test Case 4: Duplicate IP Assignment
1. Assign IP `192.168.1.10`
2. Try to assign same IP again
3. **Expected**: Error "IP already assigned"

### Test Case 5: Update IP Address
1. Click edit icon on IP address
2. Update any of the following fields:
   - Hostname
   - MAC Address
   - Device Name
   - Assigned To
   - Description
   - Status (ASSIGNED, RESERVED, DHCP, STATIC)
3. Save changes
4. **Expected**: 
   - All changes saved and reflected in the list
   - Updated information visible in IP details

### Test Case 6: Different IP Status Types
1. Assign IPs with different statuses:
   - **ASSIGNED**: Regular assigned IP (default)
   - **RESERVED**: Reserved for future use
   - **DHCP**: DHCP-managed IP
   - **STATIC**: Static IP assignment
2. **Expected**: 
   - Each IP shows correct status badge
   - Status filter works for each type
   - Status can be changed when updating IP

### Test Case 7: Release IP Address
1. Select assigned IP
2. Click "Release" button
3. Confirm release
4. **Expected**: 
   - IP status changes to AVAILABLE
   - Can be reassigned
   - All previous information cleared

### Test Case 8: IP Status Filtering
1. Filter by status: ASSIGNED, RESERVED, AVAILABLE, DHCP, STATIC
2. **Expected**: List shows only IPs with selected status

### Test Case 9: Search IP Addresses
1. Search by IP address, hostname, MAC address, device name, or assigned to
2. **Expected**: Results filtered correctly across all searchable fields

### Test Case 10: View IP History
1. Click on IP address to view details
2. Check history tab
3. **Expected**: 
   - Shows assignment history
   - Timestamps and user actions visible
   - Shows all status changes and updates

### IP Assignment Parameters Reference

**Required Fields:**
- `subnetId` - Subnet to assign IP from (dropdown selection)

**Optional Fields:**
- `ipAddress` - Specific IP address (leave blank for automatic assignment)
- `hostname` - FQDN or hostname (e.g., `server.example.com`)
- `macAddress` - MAC address in format `00:1B:44:11:3A:B7`
- `deviceName` - Device identifier (e.g., `Web Server`, `Database Server`)
- `assignedTo` - Person or team responsible (e.g., `John Doe`, `IT Team`)
- `description` - Additional notes or description
- `status` - IP status type:
  - `ASSIGNED` - Regular assigned IP (default)
  - `RESERVED` - Reserved for future use
  - `DHCP` - DHCP-managed IP address
  - `STATIC` - Static IP assignment

---

## Reservations Testing

### Sample Reservation Data
```json
{
  "subnetId": "<subnet-id>",
  "startIp": "192.168.1.100",
  "endIp": "192.168.1.200",
  "purpose": "DHCP Pool",
  "reservedBy": "admin",
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

### Test Case 1: Create IP Range Reservation
1. Navigate to Reservations (`/reservations`)
2. Click "Create Reservation"
3. Select subnet
4. Enter:
   - Start IP: `192.168.1.100`
   - End IP: `192.168.1.200`
   - Purpose: `DHCP Pool`
5. Click "Create"
6. **Expected**: 
   - Reservation created
   - All IPs in range marked as RESERVED
   - Reservation appears in list

### Test Case 2: Invalid IP Range
1. Try to create reservation with:
   - Start IP > End IP
   - IPs outside subnet range
2. **Expected**: Validation errors displayed

### Test Case 3: Conflicting Reservation
1. Assign IP `192.168.1.150`
2. Try to reserve range `192.168.1.100-200`
3. **Expected**: Error "IP range conflicts with existing assigned IPs"

### Test Case 4: Update Reservation
1. Edit existing reservation
2. Change purpose or expiration date
3. Save
4. **Expected**: Changes saved

### Test Case 5: Delete Reservation
1. Delete a reservation
2. Confirm deletion
3. **Expected**: 
   - Reservation removed
   - Reserved IPs released (status → AVAILABLE)

### Test Case 6: Large Range Reservation
1. Create reservation for large range (e.g., 1000+ IPs)
2. **Expected**: 
   - Reservation created
   - Note: System limits to 1000 IPs for performance

---

## Reports Testing

### Test Case 1: Utilization Report
1. Navigate to Reports (`/reports`)
2. Select "Utilization Report"
3. **Expected**: 
   - Shows all subnets with utilization stats
   - Total IPs, Used IPs, Reserved IPs, Available IPs
   - Utilization percentage per subnet
   - Overall totals

### Test Case 2: Status Report
1. Select "Status Report"
2. **Expected**: 
   - Shows count of IPs by status
   - ASSIGNED, RESERVED, AVAILABLE, DHCP, STATIC counts

### Test Case 3: Export to CSV
1. Generate utilization report
2. Click "Export Report" → Select CSV
3. **Expected**: 
   - CSV file downloaded
   - Contains subnet data with headers
   - Totals row included

### Test Case 4: Export to JSON
1. Generate report
2. Click "Export Report" → Select JSON
3. **Expected**: 
   - JSON file downloaded
   - Properly formatted JSON structure

### Test Case 5: Chart Visualization
1. View utilization report
2. Check charts
3. **Expected**: 
   - Pie charts showing IP distribution
   - Correct percentages
   - Color-coded segments

---

## User Management Testing

### Test Case 1: View Users (Admin Only)
1. Navigate to Settings (`/settings`)
2. Go to "Users" tab
3. **Expected**: 
   - List of all users
   - Username, email, role displayed
   - Creation date shown

### Test Case 2: Create User
1. Click "Create User"
2. Fill form:
   - Username: `testuser`
   - Email: `testuser@example.com`
   - Password: `password123`
   - Role: `user`
3. Click "Create"
4. **Expected**: 
   - User created successfully
   - Appears in users list
   - Can login with new credentials

### Test Case 3: Update User
1. Click edit on user
2. Change role or email
3. Save
4. **Expected**: Changes saved

### Test Case 4: Delete User
1. Delete a user
2. Confirm deletion
3. **Expected**: User removed from system

### Test Case 5: Role-Based Access
1. Login as `user` role (not admin)
2. Try to access `/settings` → Users tab
3. **Expected**: 
   - Access denied or tab hidden
   - Error message displayed

---

## Settings & Account Testing

### Test Case 1: Update Profile
1. Navigate to Account (`/account`)
2. Update username or email
3. Save
4. **Expected**: Profile updated, changes reflected

### Test Case 2: Change Password
1. Go to Account page
2. Enter:
   - Current Password: `admin123`
   - New Password: `newpassword123`
   - Confirm Password: `newpassword123`
3. Click "Change Password"
4. **Expected**: 
   - Password changed
   - Can login with new password

### Test Case 3: Invalid Password Change
1. Enter incorrect current password
2. Try to change password
3. **Expected**: Error "Current password is incorrect"

### Test Case 4: View Audit Log
1. Navigate to Audit (`/audit`)
2. **Expected**: 
   - List of audit events
   - IP address changes, assignments, releases
   - User actions logged
   - Timestamps displayed

---

## Common Test Scenarios

### Scenario 1: Complete IP Lifecycle
1. Create subnet `192.168.1.0/24`
2. Assign IP `192.168.1.10` to server
3. Update IP hostname to `web-server-01`
4. Reserve range `192.168.1.100-150` for DHCP
5. Release IP `192.168.1.10`
6. View utilization report
7. **Expected**: All operations succeed, data consistent

### Scenario 2: Multi-Subnet Management
1. Create multiple subnets:
   - `192.168.1.0/24` (Office)
   - `192.168.2.0/24` (Remote)
   - `10.0.0.0/16` (Data Center)
2. Assign IPs in each subnet
3. View dashboard
4. **Expected**: 
   - All subnets visible
   - Correct utilization per subnet
   - Totals calculated correctly

### Scenario 3: IPv4 and IPv6 Mixed
1. Create IPv4 subnet `192.168.1.0/24`
2. Create IPv6 subnet `2001:db8::/64`
3. Assign IPs in both
4. View reports
5. **Expected**: 
   - Both IP versions handled correctly
   - Separate statistics for each

### Scenario 4: Bulk Operations
1. Create subnet with large range
2. Reserve multiple IP ranges
3. Assign multiple IPs
4. Export utilization report
5. **Expected**: 
   - All operations complete
   - Report accurate
   - Performance acceptable

---

## Troubleshooting

### Issue: CORS Errors
**Symptoms**: Network errors, blocked requests
**Solution**: 
- Verify `CORS_ORIGIN` environment variable on server
- Check API URL in client `.env` or `baseApi.ts`
- Ensure client URL is in allowed origins list

### Issue: Authentication Fails
**Symptoms**: Can't login, redirect loops
**Solution**:
- Check token in localStorage
- Verify API endpoint `/api/auth/login`
- Check network tab for API responses
- Clear localStorage and try again

### Issue: Data Not Loading
**Symptoms**: Empty lists, loading spinners
**Solution**:
- Check browser console for errors
- Verify API is running and accessible
- Check network requests in DevTools
- Verify database connection

### Issue: Validation Errors
**Symptoms**: Forms won't submit, error messages
**Solution**:
- Check required fields are filled
- Verify IP address format (IPv4/IPv6)
- Check subnet mask ranges (0-32 for IPv4, 0-128 for IPv6)
- Ensure IPs are within subnet range

### Issue: Charts Not Displaying
**Symptoms**: Empty charts, no data
**Solution**:
- Verify data is being fetched
- Check browser console for errors
- Ensure subnets have IPs assigned
- Try refreshing the page

---

## Performance Testing

### Test Case 1: Large Dataset
1. Create 100+ subnets
2. Assign 1000+ IP addresses
3. Load dashboard and reports
4. **Expected**: 
   - Page loads within 3 seconds
   - Pagination works correctly
   - No memory leaks

### Test Case 2: Concurrent Operations
1. Open multiple browser tabs
2. Perform operations simultaneously
3. **Expected**: 
   - No conflicts
   - Data consistency maintained
   - All operations complete

---

## Browser Compatibility

Tested browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `PUT /api/auth/password` - Change password

### Subnets
- `GET /api/subnets` - List subnets
- `GET /api/subnets/:id` - Get subnet details
- `POST /api/subnets` - Create subnet
- `PUT /api/subnets/:id` - Update subnet
- `DELETE /api/subnets/:id` - Delete subnet

### IP Addresses
- `GET /api/ip-addresses` - List IPs
- `GET /api/ip-addresses/:id` - Get IP details
- `POST /api/ip-addresses` - Assign IP
- `PUT /api/ip-addresses/:id` - Update IP
- `DELETE /api/ip-addresses/:id` - Release IP

### Reservations
- `GET /api/reservations` - List reservations
- `GET /api/reservations/:id` - Get reservation
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `DELETE /api/reservations/:id` - Delete reservation

### Reports
- `GET /api/reports/utilization` - Utilization report
- `GET /api/reports/status` - Status report

---

## Sample Test Data

### Complete Test Setup
```javascript
// Subnets
Subnet 1: 192.168.1.0/24 (Office Network, Location: Main Office, VLAN: 100)
Subnet 2: 192.168.2.0/24 (Remote Office, Location: Branch Office, VLAN: 200)
Subnet 3: 10.0.0.0/16 (Data Center, Location: DC1, VLAN: 300)
Subnet 4: 2001:db8::/64 (IPv6 Network, Location: Main Office, VLAN: 100)

// IP Assignments (with all parameters)
{
  ipAddress: "192.168.1.10",
  hostname: "web-server-01.example.com",
  macAddress: "00:1B:44:11:3A:B7",
  deviceName: "Web Server",
  assignedTo: "John Doe",
  description: "Production web server",
  status: "ASSIGNED"
}

{
  ipAddress: "192.168.1.11",
  hostname: "db-server-01.example.com",
  macAddress: "00:1B:44:11:3A:B8",
  deviceName: "Database Server",
  assignedTo: "Jane Smith",
  description: "Primary MySQL database",
  status: "STATIC"
}

{
  ipAddress: "192.168.1.12",
  hostname: "mail.example.com",
  macAddress: "00:1B:44:11:3A:B9",
  deviceName: "Mail Server",
  assignedTo: "IT Team",
  description: "Exchange mail server",
  status: "ASSIGNED"
}

// Reservations
192.168.1.100-150 - DHCP Pool (Purpose: "DHCP Range")
192.168.1.200-220 - Backup Servers (Purpose: "Backup Infrastructure")
```

---

## Quick Test Checklist

- [ ] Login with admin credentials
- [ ] Create IPv4 subnet
- [ ] Create IPv6 subnet
- [ ] Assign IP automatically
- [ ] Assign IP manually
- [ ] Create IP reservation
- [ ] View utilization report
- [ ] Export report (CSV/JSON)
- [ ] Update subnet
- [ ] Delete subnet
- [ ] Release IP address
- [ ] Search and filter subnets
- [ ] View audit log
- [ ] Update user profile
- [ ] Change password
- [ ] Create new user (admin only)
- [ ] Test role-based access

---

## Notes

- All timestamps are in UTC
- IP addresses are validated for correct format
- Subnet masks must match IP version (IPv4: 0-32, IPv6: 0-128)
- Reservations automatically mark IPs as RESERVED
- Deleting a subnet cascades to delete all associated IPs
- Maximum 1000 IPs created per reservation (performance limit)

---

**Last Updated**: December 2024
**Version**: 1.0

