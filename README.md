# JobGenius – Smart Job Matching & Skill Gap Analyzer

JobGenius is a full-stack SaaS job portal that matches user skills with job requirements, calculates match percentage, identifies missing skills, and provides skill improvement recommendations.

Core Flow:
User → Login → Add Skills → Job Matching Engine → Match % → Skill Gap → Apply Job

## Core Features

### Authentication

- JWT login/register
- Protected routes

### Skill Management

- Add/remove skills
- Skill suggestions

### Job Matching

- Match percentage calculation
- Ranking system
- Skill gap analysis

### Job System

- Job listing
- Job details
- Apply/withdraw application

### Recommendations

- Missing skill suggestions
- Learning recommendations

### Candidate Profile

- Profile page
- Personal information management
- Profile completion tracking
- Activity summary

### Resume Management

- Upload resume
- Preview/download resume
- Replace/delete resume
- PDF/DOC/DOCX support

## Tech Stack

### Frontend

- React
- Tailwind CSS
- React Router
- Axios

### Backend

- Spring Boot
- Java
- JWT Authentication
- REST APIs

### Database

- PostgreSQL

## Architecture

Frontend Architecture:

- Component-based architecture
- Reusable UI components
- Service layer for API calls
- Protected route system

Backend Architecture:
Controller → Service → Repository → Database

## Frontend Structure

src/
├── components/
├── pages/
├── services/
├── hooks/
├── context/
├── routes/
├── layouts/
├── utils/
└── styles/

## Backend Structure

src/main/java/com/jobmatcher
├── controller/
├── service/
├── repository/
├── dto/
├── model/
├── config/
└── exception/

# API Documentation

Base URL:

```env
http://localhost:8080/api
```

---

# Authentication APIs

## Auth `/auth`

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/auth/register`      | Register new user        |
| POST   | `/auth/login`         | Login user               |
| POST   | `/auth/loginresponse` | Login with full response |

---

# User APIs

## Users `/users`

| Method | Endpoint    | Description                 |
| ------ | ----------- | --------------------------- |
| GET    | `/users/me` | Get current user profile    |
| PUT    | `/users/me` | Update current user profile |

---

# Job APIs

## Jobs `/jobs`

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/jobs`           | Get all jobs              |
| GET    | `/jobs/{jobId}`   | Get job by ID             |
| GET    | `/jobs/recruiter` | Get recruiter posted jobs |
| POST   | `/jobs`           | Create job                |
| PUT    | `/jobs/{jobId}`   | Update job                |
| DELETE | `/jobs/{jobId}`   | Delete job                |

---

# Application APIs

## Applications `/applications`

| Method | Endpoint                               | Description               |
| ------ | -------------------------------------- | ------------------------- |
| POST   | `/applications/{jobId}`                | Apply for a job           |
| GET    | `/applications/my`                     | Get my applications       |
| GET    | `/applications/job/{jobId}`            | Get applicants for a job  |
| PUT    | `/applications/{applicationId}/status` | Update application status |
| DELETE | `/applications/{applicationId}`        | Withdraw application      |
| GET    | `/applications/check/{jobId}`          | Check already applied     |

---

# Skill APIs

## Skills `/skills`

| Method | Endpoint            | Description               |
| ------ | ------------------- | ------------------------- |
| GET    | `/skills`           | Get all skills            |
| GET    | `/skills/user`      | Get current user's skills |
| POST   | `/skills`           | Add skills                |
| PUT    | `/skills`           | Update skills             |
| DELETE | `/skills/{skillId}` | Delete skill              |

---

# Job Matching APIs

## Job Matching `/jobmatch`

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | `/jobmatch/match` | Get matched jobs |

---

# Enum APIs

## Enums `/enums`

| Method | Endpoint            | Description     |
| ------ | ------------------- | --------------- |
| GET    | `/enums/job-types`  | List job types  |
| GET    | `/enums/work-modes` | List work modes |

# Frontend Pages Summary

---

# Public Pages

| Page         | Purpose                                   | APIs Used                  |
| ------------ | ----------------------------------------- | -------------------------- |
| LoginPage    | Email/password login, role-based redirect | `POST /auth/loginresponse` |
| RegisterPage | New user registration form                | `POST /auth/register`      |

---

# Candidate Pages (under `CandidateLayout`)

| Page                                         | Purpose                       | APIs Used                                                                      | Key Features                                                                           |
| -------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| JobListingPage `/find-jobs`                  | Browse all jobs               | `GET /jobs`                                                                    | Search, filter by job type/work mode, grid/list toggle, pagination, bookmarks, match % |
| JobDetailPage `/jobs/:id`                    | View full job details + apply | `GET /jobs/:id`, `POST /applications/:jobId`, `GET /applications/check/:jobId` | Match ring, cover letter modal, apply/withdraw, expiry warning                         |
| MyApplicationsPage `/my-applications`        | Track applied jobs            | `GET /applications/my`, `DELETE /applications/:id`                             | Status badges (Applied/Screening/Interview/Accepted/Rejected), withdraw application    |
| SkillManagementPage `/skill-management`      | Add/remove personal skills    | `GET /skills/user`, `POST /skills`, `DELETE /skills/:id`                       | Skill strength indicator, tag-style UI                                                 |
| SkillGapPage `/skill-gap/:jobId`             | Analyze skill gap for a job   | `GET /jobmatch/match`                                                          | Matched vs                                                                             |
| CandidateProfilePage `/profile`              | Manage candidate profile      | `GET /users/me`, `PUT /users/me`, Resume APIs                                  | Personal info, resume upload, profile completion, activity summary                     |
| missing skills, salary info, job match score |

---

# Recruiter Pages (under `RecruiterLayout`)

| Page                                      | Purpose                  | APIs Used                                                     | Key Features                                                        |
| ----------------------------------------- | ------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| RecruiterDashboard `/recruiter-dashboard` | Overview stats           | `GET /jobs/recruiter`, applications data                      | Stat cards (total jobs, applications), status breakdown             |
| ManageJobPage `/manage-jobs`              | View/manage posted jobs  | `GET /jobs/recruiter`, `DELETE /jobs/:id`                     | Search, filter by type/mode/status, pagination, edit/delete actions |
| PostJobPage `/post-job`                   | Create a new job posting | `POST /jobs`, `GET /enums/job-types`, `GET /enums/work-modes` | Full form with skills, salary, type, work mode                      |
| EditJobPage `/edit-job/:id`               | Edit existing job        | `GET /jobs/:id`, `PUT /jobs/:id`                              | Pre-filled form, same fields as PostJob                             |

---

# Routing System

## Public Routes

- /login
- /register

## Recruiter Routes

- /recruiter-dashboard
- /post-job
- /edit-job/:id
- /manage-jobs

## Candidate Routes

- /find-jobs
- /jobs/:id
- /skill-management
- /skill-gap/:jobId
- /my-applications

## Route Protection

Protected routes use:

- ProtectedRoute component
- JWT token from localStorage

Unauthorized users redirect to:

- /login

## Layout System

- RecruiterLayout → recruiter pages
- CandidateLayout → candidate pages

## Database Tables

users
skills
user_skills
jobs
job_skills
applications

## System Architecture

Frontend (React) → REST APIs → Spring Boot Backend → PostgreSQL Database

# Environment Variables

## Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Backend `application.properties`

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/job_matcher_db
spring.datasource.username=postgres
spring.datasource.password=your_password

jwt.secret=your_jwt_secret
```

## Matching Formula

Match % = (Matched Skills / Total Job Skills) × 100

## AI Development Rules

- Extend existing code only
- Avoid rewriting unrelated files
- Maintain current architecture
- Reuse existing components
- Follow existing API structure
- Use service layer for API calls
- Keep UI responsive
- Follow current coding style
