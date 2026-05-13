# Solution: UUID vs Integer ID Mismatch Fix

## Overview
The issue was caused by a mismatch between the authentication system (using integer IDs from the `users` table) and the application data tables (expecting UUIDs from the `app_users` table for the `createdBy` field).

## Changes Made

### 1. Model Fixes
- **AppUser Model**: Corrected the `static table` property from `'users'` to `'app_users'`. This ensures the `AppUser` model correctly represents the application-specific user data.
- **Entity Models**: Updated `Farmer`, `Plot`, `Observation`, `Attachment`, and `SyncQueue` models to use `number` for their user-reference fields (`createdBy`, `uploadedBy`, `userId`).
- **Relationships**: Updated these models to link their creator/user relationships to the `User` model (integer IDs) instead of the `AppUser` model (UUIDs).

### 2. Validation Fixes
- Updated `createFarmerValidator`, `createPlotValidator`, `createObservationValidator`, `createAttachmentValidator`, and `createSyncQueueValidator` to accept `vine.number()` for user-reference fields instead of enforcing `vine.string().uuid()`.

### 3. Database Migration Updates
- Modified migrations for `farmers`, `plots`, `observations`, `attachments`, and `sync_queue` to change the user-reference columns from `uuid` to `integer`.
- Updated foreign key constraints to reference the `users(id)` column (the auth table) instead of `app_users(id)`.

## How to Apply
To apply these changes to your database, you should:
1. Ensure your local database is in a state where these migrations can be run (or re-run).
2. Run the migrations:
   ```bash
   node ace migration:run
   ```
   *Note: If you have existing data with UUIDs in these columns, you may need to clear those tables first or perform a manual data migration.*

## Result
The backend now correctly accepts the integer IDs (like `"3"`) sent by the frontend during entity creation, resolving the `createdBy field must be a valid UUID` validation error.
