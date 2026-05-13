# Smart Process - Farm Management Dashboard

A comprehensive Next.js-based admin dashboard for agricultural farm management and monitoring.

## Features

- **Authentication**: Secure login/signup with JWT token management
- **Dashboard**: Real-time analytics and overview with charts
- **User Management**: Create and manage app users with different roles (Admin, Supervisor, Field Agent)
- **Organizations**: Create and manage organizations with farmers and plots
- **Farmers**: Maintain farmer records and contact information
- **Plots**: Manage agricultural plots with crop types and planting dates
- **Observations**: Record and track field observations with location data
- **Devices**: Manage mobile devices and field equipment
- **Audit Logs**: Track system activity and changes

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API with custom wrapper
- **Charts**: Recharts
- **Notifications**: Sonner
- **Form Handling**: React Hook Form, Zod
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Backend API running (default: http://localhost:3000)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd smart-process
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

5. Start the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
├── page.tsx                 # Root redirect page
├── layout.tsx              # Root layout with providers
├── globals.css             # Global styles
├── login/page.tsx          # Login page
├── signup/page.tsx         # Signup page
└── dashboard/
    ├── layout.tsx          # Dashboard layout with sidebar
    ├── page.tsx            # Dashboard overview
    ├── organizations/      # Organizations management
    ├── users/              # Users management
    ├── farmers/            # Farmers management
    ├── plots/              # Plots management
    ├── observations/       # Observations management
    ├── devices/            # Devices management
    ├── audit-logs/         # Audit logs viewer
    └── settings/           # User settings

components/
├── protected-route.tsx     # Route protection wrapper
├── sidebar.tsx             # Navigation sidebar
├── data-table.tsx          # Reusable data table component
├── form-modal.tsx          # Form dialog component
└── ui/                     # shadcn/ui components

lib/
├── api-client.ts           # HTTP client with auth
├── auth-context.tsx        # Authentication context & hooks
├── types.ts                # TypeScript type definitions
└── utils.ts                # Utility functions
```

## API Endpoints

The application expects the following API endpoints on your backend:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - List all users
- `GET /api/users/me` - Get current user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Organizations
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Farmers
- `GET /api/farmers` - List farmers
- `POST /api/farmers` - Create farmer
- `PUT /api/farmers/:id` - Update farmer
- `DELETE /api/farmers/:id` - Delete farmer

### Plots
- `GET /api/plots` - List plots
- `POST /api/plots` - Create plot
- `PUT /api/plots/:id` - Update plot
- `DELETE /api/plots/:id` - Delete plot

### Observations
- `GET /api/observations` - List observations
- `POST /api/observations` - Create observation
- `PUT /api/observations/:id` - Update observation
- `DELETE /api/observations/:id` - Delete observation

### Devices
- `GET /api/devices` - List devices
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Dashboard & Audit
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/audit-logs` - Audit logs

## Authentication Flow

1. User visits `/login` or `/signup`
2. Credentials are sent to backend via `/api/auth/login` or `/api/auth/signup`
3. Backend returns JWT token and user data
4. Token is stored in localStorage (key: `auth_token`)
5. Token is included in all subsequent API requests via `Authorization: Bearer <token>` header
6. Protected routes check for authentication and redirect to login if not authenticated
7. On logout, token is cleared from localStorage and user is redirected to login

## Components

### Protected Route
Wraps protected pages to ensure only authenticated users can access them.

```tsx
import { ProtectedRoute } from '@/components/protected-route';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Data Table
Reusable component for displaying and managing tabular data with pagination and search.

```tsx
import { DataTable, Column } from '@/components/data-table';

interface Item {
  id: string;
  name: string;
}

const columns: Column<Item>[] = [
  { key: 'name', label: 'Name' },
];

<DataTable
  data={items}
  columns={columns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onCreate={handleCreate}
  searchableColumns={['name']}
/>
```

### Form Modal
Dialog component for creating and editing items.

```tsx
import { FormModal } from '@/components/form-modal';

<FormModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  title="Item"
  isEdit={isEdit}
  onSubmit={handleSubmit}
  loading={submitting}
>
  {/* Form fields here */}
</FormModal>
```

## Hooks

### useAuth
Access authentication state and methods.

```tsx
import { useAuth } from '@/lib/auth-context';

const { user, login, logout, isAuthenticated } = useAuth();
```

## Styling

The application uses Tailwind CSS with custom design tokens defined in `tailwind.config.ts` and `globals.css`.

Key design tokens:
- `bg-background` - Main background
- `bg-card` - Card/container background
- `text-foreground` - Main text color
- `text-muted-foreground` - Secondary text
- `border-border` - Border color

## Troubleshooting

### "Cannot GET /api/..." errors
- Ensure your backend is running on the correct port
- Update `NEXT_PUBLIC_API_URL` in `.env.local` if using a different API URL
- Check CORS settings on your backend

### "Token expired" or "Unauthorized" errors
- Token is stored in localStorage under the key `auth_token`
- Automatic logout occurs on 401 responses
- User is redirected to login page

### Images not loading
- Ensure image URLs are properly formatted
- Check CORS settings if images are from external sources
- Use proper alt text for accessibility

## Performance Optimizations

- Page components use client-side rendering for interactivity
- API calls are wrapped with error handling
- Pagination is implemented in data tables
- Lazy loading for components where applicable

## Future Enhancements

- Real-time notifications with WebSocket
- Advanced filtering and export options
- Mobile app version
- Offline-first sync capabilities
- Multi-language support
- Dark mode toggle

## Support

For issues or questions, please refer to the backend API documentation or contact the development team.
