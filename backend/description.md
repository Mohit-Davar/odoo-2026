# TransitOps – Smart Transport Operations Platform

## Overview

TransitOps is a centralized Transport Operations Platform designed to digitize and streamline fleet management for logistics organizations. The system replaces traditional spreadsheet-based workflows with a unified web application that manages vehicles, drivers, trips, maintenance, fuel consumption, operational expenses, and analytics.

The objective is to provide a single source of truth for transport operations while enforcing business rules, reducing manual errors, improving fleet utilization, and providing operational insights through dashboards and reports.

---

# Problem Statement

Many logistics companies still manage their transportation operations manually using spreadsheets, registers, and paper logs. This leads to several operational challenges such as:

- Scheduling conflicts
- Double booking of vehicles or drivers
- Underutilized fleet
- Missed maintenance schedules
- Expired driver licenses going unnoticed
- Inaccurate fuel and expense tracking
- Lack of operational visibility
- Poor decision making due to fragmented information

TransitOps aims to solve these problems by providing an integrated transport management platform.

---

# Project Objective

Develop a responsive web application that enables organizations to manage the complete lifecycle of transportation operations, including:

- Fleet Management
- Driver Management
- Trip Dispatching
- Maintenance Management
- Fuel Logging
- Expense Tracking
- Operational Analytics

The platform must automate status transitions, enforce business validations, and provide dashboards with real-time operational metrics.

---

# Target Users

The application supports multiple organizational roles through Role-Based Access Control (RBAC).

## Fleet Manager

Responsible for managing fleet assets and vehicle lifecycle.

Responsibilities:

- Register vehicles
- Update vehicle information
- View fleet utilization
- Manage maintenance
- Monitor vehicle status

---

## Dispatcher

Responsible for planning and assigning trips.

Responsibilities:

- Create trips
- Assign vehicles
- Assign drivers
- Dispatch trips
- Monitor ongoing deliveries

---

## Safety Officer

Responsible for driver compliance.

Responsibilities:

- Manage driver records
- Monitor license validity
- Track safety scores
- Prevent assignment of non-compliant drivers

---

## Financial Analyst

Responsible for operational cost monitoring.

Responsibilities:

- Track fuel expenses
- Track operational expenses
- Analyze maintenance cost
- View profitability reports
- Review fleet ROI

---

# Core Modules

The platform consists of the following major modules.

---

## 1. Authentication & Role Based Access Control

The application must provide secure authentication.

### Features

- Email and password login
- User authentication
- Role-Based Access Control (RBAC)
- Protected routes
- Unauthorized access prevention

Every authenticated user can only access the modules permitted for their assigned role.

---

## 2. Dashboard

The dashboard provides an overall operational overview of the transport system.

### Key Performance Indicators

The dashboard should display:

- Active Vehicles
- Available Vehicles
- Vehicles In Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization Percentage

### Filtering

Dashboard data should support filtering by:

- Vehicle Type
- Vehicle Status
- Region

### Additional Dashboard Information

Recent Trips

Vehicle Status Distribution

Fleet Summary

Operational Statistics

---

## 3. Vehicle Registry

Maintain the organization's fleet inventory.

Each vehicle record contains information such as:

- Registration Number
- Vehicle Name / Model
- Vehicle Type
- Maximum Load Capacity
- Current Odometer Reading
- Acquisition Cost
- Current Status

Vehicle status can be:

- Available
- On Trip
- In Shop
- Retired

Users should be able to:

- Register vehicles
- View vehicles
- Update vehicle details
- Retire vehicles

---

## 4. Driver Management

Maintain complete driver information.

Each driver contains:

- Name
- License Number
- License Category
- License Expiry Date
- Contact Number
- Safety Score
- Current Status

Driver status can be:

- Available
- On Trip
- Off Duty
- Suspended

Users should be able to:

- Register drivers
- Edit driver details
- Monitor driver availability
- Monitor license validity
- Track safety score

---

## 5. Trip Management

Trip Management is the core workflow of the application.

A dispatcher should be able to create transport trips by specifying:

- Origin
- Destination
- Vehicle
- Driver
- Cargo Weight
- Planned Distance

Trip lifecycle:

Draft

↓

Dispatched

↓

Completed

or

Draft

↓

Cancelled

Trip management is responsible for enforcing operational validations before dispatch.

---

## 6. Maintenance Management

The maintenance module tracks repair and servicing activities.

Each maintenance record includes:

- Vehicle
- Service Type
- Cost
- Date
- Maintenance Status

Maintenance status:

- Active
- Completed

The module should maintain a history of all maintenance records.

---

## 7. Fuel Management

Fuel consumption should be recorded for operational analysis.

Each fuel log contains:

- Vehicle
- Trip (if applicable)
- Fuel Date
- Fuel Quantity
- Fuel Cost

Fuel records are later used for analytics and efficiency calculations.

---

## 8. Expense Management

Track operational expenses incurred during transportation.

Expenses include:

- Toll Charges
- Maintenance Costs
- Miscellaneous Expenses

Each expense record stores:

- Vehicle
- Trip
- Expense Type
- Amount
- Date
- Remarks (optional)

---

## 9. Reports & Analytics

The analytics module provides operational insights.

Reports include:

### Fuel Efficiency

Calculated as:

Distance Travelled / Fuel Consumed

---

### Fleet Utilization

Calculated as:

Vehicles Currently On Trip / Total Fleet

---

### Operational Cost

Total operational cost consists of:

Fuel Cost

+

Maintenance Cost

+

Other Operational Expenses

---

### Vehicle ROI

Calculated using:

(Revenue − Fuel Cost − Maintenance Cost)

/

Vehicle Acquisition Cost

---

The analytics dashboard should present these metrics using charts and visual summaries.

---

# Mandatory Business Rules

The application must enforce the following business rules throughout the system.

## Vehicle Rules

- Vehicle registration number must be unique.
- Retired vehicles cannot be assigned to trips.
- Vehicles currently under maintenance cannot be assigned to trips.
- Vehicles already assigned to an active trip cannot be assigned again.

---

## Driver Rules

- Drivers with expired licenses cannot be assigned.
- Suspended drivers cannot be assigned.
- Drivers already on another trip cannot be assigned again.

---

## Cargo Validation

Cargo weight must never exceed the maximum load capacity of the selected vehicle.

If exceeded, dispatch must be blocked.

---

## Trip Status Automation

Dispatching a trip automatically changes:

Vehicle

Available

↓

On Trip

Driver

Available

↓

On Trip

---

Completing a trip automatically changes:

Vehicle

On Trip

↓

Available

Driver

On Trip

↓

Available

---

Cancelling a dispatched trip restores:

Vehicle

↓

Available

Driver

↓

Available

---

## Maintenance Automation

Creating an active maintenance record automatically changes the vehicle status to:

Available

↓

In Shop

Closing maintenance restores the vehicle to:

In Shop

↓

Available

unless the vehicle has already been retired.

---

# Application Workflow

A typical operational workflow is as follows:

1. Register a vehicle.

2. Register a driver.

3. Create a transport trip.

4. Validate:

   - Vehicle availability
   - Driver availability
   - Driver license validity
   - Cargo capacity

5. Dispatch the trip.

6. Automatically update vehicle and driver status.

7. Complete the trip.

8. Record final odometer and fuel consumption.

9. Restore availability of vehicle and driver.

10. Create maintenance records when servicing is required.

11. Track fuel and operational expenses.

12. View updated dashboards and analytics.

---

# Dashboard Metrics

The dashboard should continuously provide real-time operational information including:

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Recent Trips
- Vehicle Status Distribution

---

# Reports

The system should generate reports for:

- Fuel Efficiency
- Fleet Utilization
- Operational Cost
- Vehicle ROI

CSV export is mandatory.

PDF export is optional.

---

# Responsive User Interface

The application should provide a responsive interface for desktop usage with the following major screens:

1. Authentication

2. Dashboard

3. Vehicle Registry

4. Driver Management

5. Trip Management

6. Maintenance

7. Fuel & Expense Management

8. Reports & Analytics

9. Settings & RBAC

---

# Expected Deliverables

The final application must include:

- Responsive Web Interface
- Secure Authentication
- Role-Based Access Control
- Vehicle CRUD
- Driver CRUD
- Trip Management
- Automatic Status Transitions
- Maintenance Workflow
- Fuel Logging
- Expense Tracking
- Dashboard with KPIs
- Reports & Analytics

---

# Bonus Features

The following features are optional but add additional value:

- Interactive charts
- PDF report export
- Email reminders for expiring licenses
- Vehicle document management
- Advanced search and filters
- Sorting
- Dark mode

---

# Technology Goal

The primary focus of this project is not only implementing CRUD operations, but also building a robust transport operations platform that correctly models real-world logistics workflows by enforcing business rules, maintaining data consistency, automating operational state transitions, and providing actionable insights through dashboards and analytics.
