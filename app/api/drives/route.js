import { prisma } from "@/lib/prisma";

const VALID_JOB_TYPES = ["Internship", "Full-Time", "Other"];

// GET /api/drives — Retrieve all placement drives
export async function GET() {
try {
const drives = await prisma.placementDrive.findMany({
orderBy: {
driveDate: "asc",
},
});

return Response.json(drives, { status: 200 });

} catch (error) {
console.error("Error fetching placement drives:", error);

return Response.json(
  { error: "Failed to fetch placement drives." },
  { status: 500 }
);

}
}

// POST /api/drives — Create a placement drive
export async function POST(request) {
let body;

try {
body = await request.json();
} catch {
return Response.json(
{ error: "Request body must contain valid JSON." },
{ status: 400 }
);
}

const {
companyName,
role,
driveDate,
eligibleBranch,
minCGPA,
jobType,
} = body ?? {};

if (
typeof companyName !== "string" ||
!companyName.trim() ||
typeof role !== "string" ||
!role.trim() ||
typeof driveDate !== "string" ||
!driveDate.trim() ||
typeof eligibleBranch !== "string" ||
!eligibleBranch.trim()
) {
return Response.json(
{
error:
"companyName, role, driveDate, and eligibleBranch are required.",
},
{ status: 400 }
);
}

const parsedDate = new Date(driveDate);

if (Number.isNaN(parsedDate.getTime())) {
return Response.json(
{ error: "driveDate must be a valid date." },
{ status: 400 }
);
}

let parsedCGPA = null;

if (minCGPA !== undefined && minCGPA !== null && minCGPA !== "") {
if (
typeof minCGPA !== "number" ||
!Number.isFinite(minCGPA) ||
minCGPA < 0 ||
minCGPA > 10
) {
return Response.json(
{ error: "minCGPA must be a number between 0 and 10." },
{ status: 400 }
);
}

parsedCGPA = minCGPA;

}

let parsedJobType = null;

if (jobType !== undefined && jobType !== null && jobType !== "") {
if (
typeof jobType !== "string" ||
!VALID_JOB_TYPES.includes(jobType)
) {
return Response.json(
{ error: "jobType must be Internship, Full-Time, or Other." },
{ status: 400 }
);
}

parsedJobType = jobType;

}

try {
const drive = await prisma.placementDrive.create({
data: {
companyName: companyName.trim(),
role: role.trim(),
driveDate: parsedDate,
eligibleBranch: eligibleBranch.trim(),
minCGPA: parsedCGPA,
jobType: parsedJobType,
},
});

return Response.json(drive, { status: 201 });

} catch (error) {
console.error("Error creating placement drive:", error);

return Response.json(
  { error: "Failed to create placement drive." },
  { status: 500 }
);

}
}