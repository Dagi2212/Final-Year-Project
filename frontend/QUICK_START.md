# Quick Start Reference

## Starting the Application

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env.local file
cp .env.example .env.local

# 3. Update .env.local with your API URL
# NEXT_PUBLIC_API_URL=http://localhost:3000

# 4. Start dev server
pnpm dev
```

Open http://localhost:3000 in your browser.

## Default Navigation

After login, you can access:
- Dashboard: `/dashboard`
- Organizations: `/dashboard/organizations`
- Users: `/dashboard/users`
- Farmers: `/dashboard/farmers`
- Plots: `/dashboard/plots`
- Observations: `/dashboard/observations`
- Devices: `/dashboard/devices`
- Audit Logs: `/dashboard/audit-logs`
- Settings: `/dashboard/settings`

## Test Accounts

Once you implement the backend, you can create test accounts via the signup page at `/signup`.

## Key Commands

```bash
# Development
pnpm dev              # Start dev server

# Building
pnpm build           # Build for production
pnpm start           # Run production build

# Linting
pnpm lint            # Run ESLint
```

## Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production, set the appropriate API URL.

## Common Patterns

### Using the API Client
```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const data = await apiClient.get('/api/endpoint');

// POST request
const newItem = await apiClient.post('/api/endpoint', { data });

// PUT request
const updated = await apiClient.put('/api/endpoint/id', { data });

// DELETE request
await apiClient.delete('/api/endpoint/id');
```

### Using Auth Context
```typescript
import { useAuth } from '@/lib/auth-context';

const { user, login, logout, isAuthenticated } = useAuth();

// Check if user is logged in
if (isAuthenticated) {
  // Show dashboard
}

// Login
await login(email, password);

// Logout
await logout();
```

### Creating a Protected Page
```typescript
import { ProtectedRoute } from '@/components/protected-route';

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>This page requires authentication</div>
    </ProtectedRoute>
  );
}
```

### Using Data Table
```typescript
import { DataTable } from '@/components/data-table';

<DataTable
  data={items}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ]}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onCreate={handleCreate}
  searchableColumns={['name', 'email']}
/>
```

### Using Form Modal
```typescript
import { FormModal } from '@/components/form-modal';

<FormModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  title="Item"
  isEdit={false}
  onSubmit={handleSubmit}
  loading={submitting}
>
  <Input 
    placeholder="Name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
  />
</FormModal>
```

## Type Definitions

Available types in `lib/types.ts`:
- `Organization`
- `User`
- `Farmer`
- `Plot`
- `Observation`
- `Device`
- `AuditLog`
- `SyncQueue`
- `DashboardStats`
- `PaginatedResponse<T>`

## Toast Notifications

```typescript
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.loading('Loading...');
```

## Styling

Uses Tailwind CSS with design tokens:
- `bg-background` - Main background
- `bg-card` - Card background
- `text-foreground` - Main text
- `text-muted-foreground` - Secondary text
- `border-border` - Border color

Example:
```jsx
<div className="bg-card text-foreground border border-border p-4 rounded-lg">
  Content
</div>
```

## Troubleshooting

### Port 3000 Already in Use
Next.js will automatically use the next available port. Check the terminal output.

### "API_URL not set" errors
Ensure `NEXT_PUBLIC_API_URL` is set in `.env.local`

### Cannot find module errors
Run `pnpm install` to ensure all dependencies are installed.

### Authentication failing
- Check backend API is running
- Verify API_URL in .env.local
- Check login endpoint is implemented
- Verify response includes token and user data

### CORS errors
Configure CORS on your backend to accept requests from the frontend URL.

## File Locations

| File/Folder | Purpose |
|-----------|---------|
| `app/` | Next.js app directory with pages |
| `components/` | Reusable React components |
| `lib/` | Utilities, types, and contexts |
| `public/` | Static assets |
| `.env.local` | Environment variables |
| `tailwind.config.ts` | Tailwind configuration |
| `tsconfig.json` | TypeScript configuration |
| `next.config.mjs` | Next.js configuration |

## Performance Tips

1. Use `pnpm install` (faster than npm)
2. Dev server hot reloads automatically
3. Production builds use Turbopack (faster)
4. Images should be optimized before use
5. Use lazy loading for large lists

## Code Style

- TypeScript for type safety
- React functional components with hooks
- Tailwind for styling
- shadcn/ui for components
- camelCase for variables/functions
- PascalCase for components/types

## Next Steps

1. Implement backend API endpoints
2. Test authentication flow
3. Test CRUD operations
4. Deploy to production
5. Set up monitoring/logging

## Additional Resources

- **README.md**: Full project documentation
- **SETUP.md**: Detailed API specification
- **IMPLEMENTATION_SUMMARY.md**: Feature overview

## Support

For issues:
1. Check the documentation files
2. Review the error message in browser console
3. Verify backend API is running
4. Check network tab for API responses
