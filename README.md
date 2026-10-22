# Placement Drive Manager

A full-stack web application for managing campus placement drives. It provides a centralized dashboard to create, view, search, and filter placement opportunities, with data stored persistently in PostgreSQL.

## Features

* **Dashboard:** View placement drives and summary statistics.
* **Create Placement Drives:** Add company details, job roles, drive dates, eligible branches, minimum CGPA, and job type.
* **Search and Filtering:** Find drives using the available search and filter controls.
* **Form Validation:** Validate required fields, date values, CGPA, and job type.
* **Persistent Storage:** Store placement drive records in PostgreSQL using Prisma ORM.
* **REST API:** Retrieve and create placement drives through API endpoints.
* **Responsive Interface:** Use the dashboard on desktop and mobile screens.
* **Error and Loading States:** Display appropriate feedback while data loads or when requests fail.

## Tech Stack

* **Frontend:** Next.js, React, JavaScript
* **Styling:** Tailwind CSS
* **Backend:** Next.js App Router API Routes
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Version Control:** Git and GitHub

## Prerequisites

Install the following before running the project:

* Node.js and npm
* PostgreSQL
* Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/pragat1/placement-drive-manager.git
cd placement-drive-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file by copying the example file.

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure your PostgreSQL connection:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/placement_manager?schema=public"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

**Important:** If your password contains URL-reserved characters, encode them appropriately in the connection URL. Never commit your actual `.env` file or expose database credentials.

### 4. Create the database

Create a PostgreSQL database named `placement_manager` if it does not already exist.

You can use PostgreSQL's command-line client:

```sql
CREATE DATABASE placement_manager;
```

Run this SQL command while connected to PostgreSQL using an account with permission to create databases. Skip this step if the database already exists.

### 5. Apply database migrations

Run:

```bash
npx prisma migrate dev
```

This applies the project's existing migrations to the configured database.

If you intentionally create a new migration while developing the schema, use:

```bash
npx prisma migrate dev --name describe_your_change
```

### 6. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Documentation

The application exposes the following endpoint:

### `GET /api/drives`

Retrieves placement drives from the database, ordered by drive date.

**Successful response:** `200 OK`

Returns a JSON array of placement drive records.

### `POST /api/drives`

Creates a new placement drive.

**Example request body:**

```json
{
  "companyName": "Example Technologies",
  "role": "Software Engineer",
  "driveDate": "2026-11-15",
  "eligibleBranch": "CSE",
  "minCGPA": 7.5,
  "jobType": "Full-Time"
}
```

**Required fields:**

* `companyName`
* `role`
* `driveDate`
* `eligibleBranch`

**Optional fields:**

* `minCGPA`: Must be a number between 0 and 10.
* `jobType`: Must be `Internship`, `Full-Time`, or `Other`.

**Response codes:**

| Status                      | Meaning                                  |
| --------------------------- | ---------------------------------------- |
| `201 Created`               | Placement drive created successfully     |
| `400 Bad Request`           | Invalid input or missing required fields |
| `500 Internal Server Error` | An unexpected server-side error occurred |

The API persists successfully created records in PostgreSQL.

## Database Model

The `PlacementDrive` model contains:

| Field            | Description                       |
| ---------------- | --------------------------------- |
| `id`             | Unique identifier                 |
| `companyName`    | Hiring company                    |
| `role`           | Position being offered            |
| `driveDate`      | Scheduled placement drive date    |
| `eligibleBranch` | Eligible academic branch          |
| `minCGPA`        | Optional minimum CGPA requirement |
| `jobType`        | Optional employment type          |
| `createdAt`      | Record creation timestamp         |
| `updatedAt`      | Last update timestamp             |

## Development Commands

```bash
# Start the development server
npm run dev

# Run lint checks
npm run lint

# Create a production build
npm run build

# Validate the Prisma schema
npx prisma validate

# Generate the Prisma Client
npx prisma generate
```

## Security Notes

* Keep database credentials in `.env`.
* Use `.env.example` to document the required environment variable without including real credentials.
* Validate incoming API data before inserting records into the database.
* Do not commit secrets, local environment files, or database credentials.

## Repository

GitHub: https://github.com/pragat1/placement-drive-manager
