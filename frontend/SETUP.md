# Quick Setup Guide

## Frontend Setup (This Repository)

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Configure Environment
Create a `.env.local` file with the following:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Change `http://localhost:3000` to your backend API URL if different.

### Step 3: Start Development Server
```bash
pnpm dev
```

The application will be available at `http://localhost:3000` (or the next available port if 3000 is in use).

## Backend Requirements

Your backend API must implement the following endpoints:

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Request: { email: string, password: string }
Response: { token: string, user: User }
```

#### Signup
```
POST /api/auth/signup
Request: { email: string, password: string, firstName: string, lastName: string }
Response: { token: string, user: User }
```

#### Logout
```
POST /api/auth/logout
Request: {}
Response: { success: boolean }
```

### User Endpoints

#### Get Current User
```
GET /api/users/me
Headers: Authorization: Bearer {token}
Response: User
```

#### List Users
```
GET /api/users
Headers: Authorization: Bearer {token}
Response: User[]
```

#### Create User
```
POST /api/users
Headers: Authorization: Bearer {token}
Request: { email: string, password: string, firstName: string, lastName: string, role: string }
Response: User
```

#### Update User
```
PUT /api/users/{id}
Headers: Authorization: Bearer {token}
Request: { firstName?: string, lastName?: string, role?: string }
Response: User
```

#### Delete User
```
DELETE /api/users/{id}
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Organization Endpoints

#### List Organizations
```
GET /api/organizations
Headers: Authorization: Bearer {token}
Response: Organization[]
```

#### Create Organization
```
POST /api/organizations
Headers: Authorization: Bearer {token}
Request: { name: string, description?: string, location?: string }
Response: Organization
```

#### Update Organization
```
PUT /api/organizations/{id}
Headers: Authorization: Bearer {token}
Request: { name?: string, description?: string, location?: string }
Response: Organization
```

#### Delete Organization
```
DELETE /api/organizations/{id}
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Farmer Endpoints

#### List Farmers
```
GET /api/farmers
Headers: Authorization: Bearer {token}
Response: Farmer[]
```

#### Create Farmer
```
POST /api/farmers
Headers: Authorization: Bearer {token}
Request: { firstName: string, lastName: string, phoneNumber?: string, email?: string, location?: string }
Response: Farmer
```

#### Update Farmer
```
PUT /api/farmers/{id}
Headers: Authorization: Bearer {token}
Request: { firstName?: string, lastName?: string, phoneNumber?: string, email?: string, location?: string }
Response: Farmer
```

#### Delete Farmer
```
DELETE /api/farmers/{id}
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Plot Endpoints

#### List Plots
```
GET /api/plots
Headers: Authorization: Bearer {token}
Response: Plot[]
```

#### Create Plot
```
POST /api/plots
Headers: Authorization: Bearer {token}
Request: { 
  name: string, 
  farmerId: string, 
  location?: string, 
  areaSize?: number, 
  cropType?: string, 
  plantingDate?: string 
}
Response: Plot
```

#### Update Plot
```
PUT /api/plots/{id}
Headers: Authorization: Bearer {token}
Request: { name?: string, location?: string, areaSize?: number, cropType?: string, plantingDate?: string }
Response: Plot
```

#### Delete Plot
```
DELETE /api/plots/{id}
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Observation Endpoints

#### List Observations
```
GET /api/observations
Headers: Authorization: Bearer {token}
Response: Observation[]
```

#### Create Observation
```
POST /api/observations
Headers: Authorization: Bearer {token}
Request: { 
  type: string, 
  description: string, 
  plotId: string, 
  date: string, 
  time?: string, 
  latitude?: number, 
  longitude?: number, 
  imageUrl?: string 
}
Response: Observation
```

#### Update Observation
```
PUT /api/observations/{id}
Headers: Authorization: Bearer {token}
Request: { type?: string, description?: string, date?: string, time?: string, latitude?: number, longitude?: number, imageUrl?: string }
Response: Observation
```

#### Delete Observation
```
DELETE /api/observations/{id}
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Device Endpoints

#### List Devices
```
GET /api/devices
Headers: Authorization: Bearer {token}
Response: Device[]
```

#### Create Device
```
POST /api/devices
Headers: Authorization: Bearer {token}
Request: { name: string, type: string, serialNumber?: string, assignedUserId?: string, status: 'online' | 'offline' | 'inactive' }
Response: Device
```

#### Update Device
```
PUT /api/devices/{id}
Headers: Authorization: Bearer {token}
Request: { name?: string, type?: string, serialNumber?: string, assignedUserId?: string, status?: string }
Response: Device
```

#### Delete Device
```
DELETE /api/devices/{id}
Headers: Authorization: Bearer {token}
Response: { success: boolean }
```

### Dashboard & Audit Endpoints

#### Get Dashboard Stats
```
GET /api/dashboard/stats
Headers: Authorization: Bearer {token}
Response: { 
  totalFarmers: number, 
  totalPlots: number, 
  totalObservations: number, 
  recentObservations: Observation[], 
  deviceStatus: { online: number, offline: number, inactive: number }
}
```

#### Get Audit Logs
```
GET /api/audit-logs
Headers: Authorization: Bearer {token}
Response: AuditLog[]
```

## Error Handling

All endpoints should return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

For errors, return a JSON response with error details:
```json
{
  "message": "Error description",
  "error": "Error type"
}
```

## User Roles

Three user roles are supported:
- `admin` - Full system access
- `supervisor` - Manage organization data
- `field_agent` - View and record observations

## Testing the Frontend

Once both frontend and backend are running:

1. Navigate to `http://localhost:3000`
2. You will be redirected to the login page
3. Test signup by creating a new account
4. Login with your credentials
5. Navigate through the dashboard and test all features

## Production Build

To create a production build:

```bash
pnpm build
pnpm start
```

## Troubleshooting

### "Failed to fetch" errors
- Ensure your backend API is running
- Check that `NEXT_PUBLIC_API_URL` in `.env.local` points to the correct backend URL
- Check browser console for specific error messages

### CORS errors
- Ensure your backend has CORS enabled
- The frontend sends requests with credentials, so configure CORS accordingly
- Allow the frontend origin in your backend CORS settings

### Blank dashboard page
- Check that all dashboard stats API endpoints are implemented
- Verify the API is returning valid data
- Check browser console for network errors

### Cannot login
- Verify the login endpoint is implemented and returns the correct response format
- Check that the token is being stored correctly in localStorage
- Verify the Authorization header is being sent correctly in subsequent requests

## Next Steps

1. Implement the backend API with all required endpoints
2. Test the authentication flow
3. Verify CORS configuration
4. Test CRUD operations for all entities
5. Verify audit logging is working
6. Deploy to production

For more details, see the main README.md file.
