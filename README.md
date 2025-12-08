# IPAM Client

IP Address Management System Frontend

A modern React-based web application for managing IP addresses, subnets, and network resources.

## Features

- 🎨 Modern, responsive UI built with React 19 and Tailwind CSS
- 📊 Real-time utilization charts and reports
- 🔐 JWT-based authentication with protected routes
- 📱 Fully responsive design
- 🔍 Advanced search and filtering
- 📈 Dashboard with utilization overview
- 📋 CSV/JSON export functionality
- ✅ Support for both IPv4 and IPv6 addresses
- 🎯 Role-based access control (Admin, User, Read-only)

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see `../server/README.md`)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:3000/api
```

If not set, the app defaults to `http://localhost:3000/api`.

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Charts/      # Chart components
│   │   ├── Layout/      # Layout components (Header, Sidebar)
│   │   ├── Modal/       # Modal dialogs
│   │   ├── Prefixes/    # Prefix/Subnet table components
│   │   └── Search/      # Search input components
│   ├── contexts/        # React contexts (Auth)
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Subnets.tsx
│   │   ├── IpAddresses.tsx
│   │   ├── Reservations.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── services/        # API service layer
│   ├── types/           # TypeScript type definitions
│   └── main.tsx         # Application entry point
├── public/              # Static assets
└── package.json
```

## Key Features

### Dashboard
- Overview of subnet utilization
- Recent subnets table
- IP utilization charts

### Subnet Management
- Create, update, and delete subnets
- Support for IPv4 and IPv6
- Subnet hierarchy (parent/child relationships)
- Utilization tracking

### IP Address Management
- Automatic and manual IP assignment
- IP status tracking (Available, Reserved, Assigned, DHCP, Static)
- IP history and audit trail
- Bulk operations

### Reports & Analytics
- Utilization reports by subnet
- IP status distribution
- Export to CSV or JSON

### User Management
- Role-based access (Admin, User, Read-only)
- User profile management
- Account settings

## Authentication

The application uses JWT tokens stored in localStorage. After login, the token is automatically included in API requests.

Default test credentials (after seeding the database):
- **Email:** `admin@ipam.com`
- **Password:** `admin123`

## API Integration

The frontend communicates with the backend API through service classes in `src/services/`:

- `auth.service.ts` - Authentication endpoints
- `subnet.service.ts` - Subnet management
- `ipAddress.service.ts` - IP address operations
- `reservation.service.ts` - IP reservations
- `report.service.ts` - Reports and analytics
- `user.service.ts` - User management

## Development

### Code Style

The project uses ESLint for code quality. Run linting:

```bash
npm run lint
```

### TypeScript

Type definitions are organized in `src/types/`:
- `api.types.ts` - API response types
- `auth.types.ts` - Authentication types
- `subnet.types.ts` - Subnet types
- `ipAddress.types.ts` - IP address types
- And more...

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues

1. Ensure the backend server is running on `http://localhost:3000`
2. Check the `VITE_API_URL` environment variable
3. Verify CORS settings on the backend

### Build Issues

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Clear Vite cache:
```bash
rm -rf node_modules/.vite
```

## Contributing

When adding new features:
1. Follow the existing component structure
2. Add TypeScript types for all data structures
3. Use Tailwind CSS for styling
4. Update this README if adding major features

## License

See the main project README for license information.
