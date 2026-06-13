# Integrated Agricultural Data System — User Guide

> **Addis Ababa Science and Technology University**  
> Final Year Project — Computer Engineering Stream  
> Version 2.0.0

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Managing Farmers](#4-managing-farmers)
5. [Managing Plots](#5-managing-plots)
6. [Recording Field Observations](#6-recording-field-observations)
7. [Managing Crop Types](#7-managing-crop-types)
8. [Importing Data from CSV/Excel](#8-importing-data-from-csvexcel)
9. [AI Yield Predictions](#9-ai-yield-predictions)
10. [AI Intelligent Query (RAG)](#10-ai-intelligent-query-rag)
11. [Managing Organizations & Users](#11-managing-organizations--users)
12. [Device Management & Sync](#12-device-management--sync)
13. [Audit Logs](#13-audit-logs)
14. [Data Monetization](#14-data-monetization)
15. [Settings](#15-settings)
16. [Role Capabilities Summary](#16-role-capabilities-summary)

---

## 1. Introduction

The **Integrated Agricultural Data System (IADS)** is a digital platform for managing agricultural operations. It helps organizations track farmers, plots, field observations, crop yields, and devices. The system also provides AI-powered crop yield predictions, a natural-language intelligent query system, and data monetization capabilities.

### Who Should Use This Guide

- **Field Agents** — Collecting and recording field data
- **Supervisors** — Overseeing field operations and reviewing data
- **Administrators** — Managing users, organizations, and system configuration
- **Government & NGO Stakeholders** — Viewing analytics and yield trends
- **Researchers** — Accessing data for analysis and running predictions
- **Traders** — Viewing aggregated market-relevant data

---

## 2. Getting Started

### Accessing the System

Open your web browser and navigate to the system URL (e.g., `http://localhost:3000`). You will see the login screen.

### Creating an Account

1. Click the **Sign Up** link on the login page
2. Enter your full name, email address, and password
3. Click **Create Account**
4. Verify your email address using the link sent to your inbox

### Logging In

1. Enter your registered email and password
2. Click **Login**
3. You will be redirected to the Dashboard

### Resetting Your Password

1. Click **Forgot Password** on the login page
2. Enter your email address
3. Check your inbox for a password reset link
4. Follow the link to set a new password

---

## 3. Dashboard Overview

The Dashboard is your landing page after login. It displays key agricultural statistics and visualizations.

### Key Metrics Cards

- **Total Farmers** — Number of registered farmers in the system
- **Total Plots** — Number of registered farm plots
- **Expected Yield** — Total expected crop yield (kg)
- **Actual Yield** — Total harvested yield (kg)
- **Observations** — Total field observation records

### Charts & Visualizations

- **Yield by Crop** — Bar chart showing expected vs actual yield per crop type
- **Farmer Distribution** — Regional breakdown of registered farmers
- **Yield Trends** — Line chart of yield performance over time
- **Plot Map** — Interactive map showing plot locations

### System Status

- **ML Service** — Health status of the AI prediction service
- **Sync Status** — Pending sync queue items from offline devices

---

## 4. Managing Farmers

### Viewing Farmers

Navigate to **Dashboard > Farmers**. The farmers list shows:
- Name, phone number, region/zone/woreda
- Total plots per farmer
- Registration date

### Adding a New Farmer

1. Click the **Add Farmer** button
2. Fill in the required details:
   - Full name
   - Phone number
   - Region, Zone, Woreda (administrative divisions)
   - Optional: additional contact info
3. Click **Save**

### Editing a Farmer

1. Click the edit icon next to the farmer's record
2. Update the necessary fields
3. Click **Save**

### Deleting & Restoring a Farmer

- **Delete:** Click the delete icon. The farmer is soft-deleted (hidden but not permanently removed).
- **Restore:** Enable "Show Deleted" filter, then click the restore icon on the deleted record.

### Viewing a Farmer's Plots

Click on a farmer's name or the "Plots" action to see all plots belonging to that farmer.

---

## 5. Managing Plots

Plots represent individual farm parcels or fields.

### Viewing Plots

Navigate to **Dashboard > Plots**. The plot list shows:
- Plot name/number
- Associated farmer
- Area (hectares)
- Soil type and irrigation type
- Geolocation coordinates
- Observation count

### Adding a New Plot

1. Click the **Add Plot** button
2. Select the farmer from the dropdown
3. Enter plot details:
   - Area in hectares
   - Soil type (loam, clay, sandy, etc.)
   - Irrigation type (rainfed, drip, sprinkler, flood)
   - Geolocation (latitude/longitude or click on the map)
4. Click **Save**

### Map View

- Plots are displayed as markers on an interactive Leaflet map
- Click a marker to see plot details
- Use the map to find nearby plots

### Editing & Deleting

Use the edit and delete icons in the table. Plots support soft-delete with restore.

### Nearby Plots Search

Use the **Nearby** endpoint to find plots within a specified radius of a given location.

---

## 6. Recording Field Observations

Observations track crop health, growth stages, and yield data for each plot.

### Viewing Observations

Navigate to **Dashboard > Observations**. The list shows:
- Plot name and farmer
- Crop name and planting date
- Growth stage (seedling, vegetative, flowering, fruiting, harvest)
- Health status (healthy, fair, poor)
- Expected and actual yield

### Adding a New Observation

1. Click the **Add Observation** button
2. Select the plot
3. Enter crop details:
   - Crop name
   - Planting date
   - Growth stage
   - Health status
   - Expected yield (kg)
4. Click **Save**

### Recording a Harvest

When a crop is harvested:
1. Find the observation record
2. Click the **Record Harvest** action
3. Enter the actual yield (kg) and harvest date
4. Click **Save**

### Attaching Field Photos

1. Open an observation record
2. Click **Add Attachment**
3. Upload a photo file
4. Add an optional description
5. Click **Save**

Attachments are listed under the observation and can be viewed or downloaded.

### Editing & Restoring

Observations support editing and soft-delete with restore.

---

## 7. Managing Crop Types

### Viewing Crop Types

Navigate to **Dashboard > Crop Types**. The catalog shows:
- Crop name
- Category (cereal, legume, vegetable, fruit, cash crop, etc.)
- Growing season duration (days)

### Adding a New Crop Type

1. Click the **Add Crop Type** button
2. Enter the crop name and select a category
3. Enter the typical growing season duration
4. Click **Save**

### Categories

The system provides predefined categories for filtering: Cereal, Legume, Vegetable, Fruit, Cash Crop, and Other.

---

## 8. Importing Data from CSV/Excel

The import feature allows bulk upload of historical agricultural data.

### Supported Formats

- **CSV** (.csv) — Comma-separated values
- **Excel** (.xlsx) — Microsoft Excel workbook

### Importing a File

1. Navigate to **Dashboard > Data Imports**
2. Click the **Import Data** button
3. Select your CSV or Excel file
4. The system will auto-detect the schema and show a preview
5. Review the column mappings and data types
6. Choose between:
   - **Dry Run** — Validate without importing
   - **Import** — Proceed with the import
7. Wait for the import to complete

### Expected Columns

The system recognizes these columns (names are flexible):

| Field | Description |
|-------|-------------|
| `crop_name` | Name of the crop |
| `year` | Harvest year |
| `season` | Growing season (e.g., Meher, Belg) |
| `area_hectares` | Plot area in hectares |
| `rainfall_mm` | Total rainfall in mm |
| `temperature_celsius` | Average temperature in °C |
| `fertilizer_amount_kg` | Fertilizer applied in kg |
| `actual_yield_kg` | Harvested yield in kg |

### Monitoring Import Jobs

The imports page shows all past imports with:
- File name and type
- Status (pending, processing, completed, failed)
- Number of imported rows vs error rows
- Timestamp

---

## 9. AI Yield Predictions

The AI-powered prediction engine uses a trained machine learning model to estimate crop yields.

### Making a Prediction

1. Navigate to **Dashboard > Predictions**
2. Click the **New Prediction** button
3. Enter the input data:
   - Crop name
   - Area (hectares)
   - Expected rainfall (mm)
   - Expected temperature (°C)
   - Fertilizer amount (kg)
   - Season
   - Year
4. Click **Predict**
5. The system returns:
   - Predicted yield (kg)
   - Model version used

### Viewing Prediction History

The predictions page lists all previously made predictions with their inputs and results.

### ML Service Status

Check the ML service health indicator on the predictions page to ensure the model is loaded and ready.

---

## 10. AI Intelligent Query (RAG)

The Intelligent Query system allows you to ask natural-language questions about your agricultural data. It uses a Large Language Model (Claude AI) to generate answers based on actual database records.

### Asking a Question

1. Navigate to **Dashboard > AI Query**
2. Type your question in natural language (e.g., "What is the average yield of maize in 2024?")
3. Click **Ask**
4. The system retrieves relevant data from the database and generates a contextual answer

### Example Questions

- "How many farmers are registered in the Oromia region?"
- "What is the total expected yield for wheat this season?"
- "Show me plots with irrigation type drip"
- "Compare maize yields between 2023 and 2024"
- "Which plots have the highest fertilizer usage?"

### How It Works

1. Your question is processed by the backend
2. Relevant data is retrieved from the PostgreSQL database
3. The data + your question are sent to the LLM (Claude or Cerebras)
4. A natural-language answer is returned to you

---

## 11. Managing Organizations & Users

### Organizations

Organizations represent cooperatives, NGOs, government bodies, or private entities.

Navigate to **Dashboard > Organizations**.

- **View** — List of all organizations with type, contact info, and member count
- **Add** — Create a new organization (name, type, contact details)
- **Edit** — Update organization information
- **Delete** — Remove an organization

Organization types: Cooperative, NGO, Government, Private, Research.

### Users (App Users)

Manage system users and their roles.

Navigate to **Dashboard > Users**.

- **View** — List of all application users with email, role, and status
- **Add** — Create a new user with email and role assignment
- **Edit** — Change user role or details
- **Activate/Deactivate** — Enable or disable user access
- **View Devices** — See devices assigned to a user

Roles available: Admin, Field Agent, Supervisor, Government, NGO, Trader, Researcher.

---

## 12. Device Management & Sync

### Devices

Track mobile devices used for field data collection.

Navigate to **Dashboard > Devices**.

- **View** — List of registered devices with UUID, name, type, and last sync time
- **Add** — Register a new device
- **Edit** — Update device information
- **Mark Synced** — Manually update sync timestamp

### Sync Queue

The sync queue manages offline data synchronization from field devices.

Navigate to **Dashboard > Sync Queue**.

- **Pending** — Items waiting to be processed
- **Processing** — Items currently being processed
- **Completed** — Successfully synced items
- **Failed** — Items that failed with error details
- **Conflict** — Items with version conflicts requiring resolution

**Actions:**
- **Retry** — Re-process a failed sync item
- **Batch Sync** — Submit multiple items at once
- **Status Update** — Manually change sync status

---

## 13. Audit Logs

The audit trail records all data changes for compliance and traceability.

Navigate to **Dashboard > Audit Logs**.

### Viewing Logs

The audit log shows:
- Timestamp of the action
- User who performed the action
- Action type (INSERT, UPDATE, DELETE, SYNC, IMPORT, PREDICT, QUERY, EXPORT, PAYMENT)
- Table name and record ID affected
- Old values (before the change)
- New values (after the change)
- IP address and user agent

### Filtering

Filter logs by:
- Action type
- Table name
- Date range
- User

### Record History

To see all changes made to a specific record, use the **Record History** feature by providing the table name and record ID.

---

## 14. Data Monetization

The monetization module allows the sale of agricultural data products.

### Products

Browse available data products with pricing and billing intervals (monthly/yearly).

### Subscriptions

- Subscribe to a product to gain access to premium data
- View your active subscriptions and their status
- Subscriptions are processed through the Chapa payment gateway

### Transactions

View your payment history including:
- Amount and currency
- Status (pending, completed, failed)
- Chapa transaction ID
- Receipt URL

---

## 15. Settings

Navigate to **Dashboard > Settings** to manage your profile.

### Profile Information

- Update your full name
- Change your email address
- Update other profile details

### Account Actions

- View your account creation and last update dates
- Delete your account (if permitted)

---

## 16. Role Capabilities Summary

| Feature | Admin | Supervisor | Field Agent | Gov | NGO | Trader | Researcher |
|---------|-------|------------|-------------|-----|-----|--------|------------|
| Dashboard & Charts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Farmers/Plots/Obs | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create/Edit Farmers | ✓ | ✓ | ✓ | — | — | — | — |
| Create/Edit Plots | ✓ | ✓ | ✓ | — | — | — | — |
| Create/Edit Observations | ✓ | ✓ | ✓ | — | — | — | — |
| Delete/Restore Data | ✓ | ✓ | — | — | — | — | — |
| Manage Users | ✓ | — | — | — | — | — | — |
| Manage Devices | ✓ | ✓ | — | — | — | — | — |
| Manage Organizations | ✓ | ✓ | — | — | — | — | — |
| Import CSV/Excel | ✓ | ✓ | ✓ | — | — | — | — |
| AI Yield Predictions | ✓ | ✓ | — | — | ✓ | — | ✓ |
| AI Intelligent Query | ✓ | ✓ | — | ✓ | ✓ | — | ✓ |
| Analytics & Trends | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Audit Logs (read) | ✓ | ✓ | — | — | — | — | — |
| Manage Monetization | ✓ | — | — | — | — | — | — |
| Manage Settings | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

---

*For technical setup and deployment instructions, refer to `docs/technical-documentation.md`.*
*For API details, refer to `docs/openapi.yaml`.*
