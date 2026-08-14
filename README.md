# Ledger — Assignment & Submission Management System

A role-based full-stack web application for a school/college, allowing **teachers** to create
and grade assignments, **students** to view their class assignments and submit answers, and
**admins** to manage users, classes, subjects, and oversee the whole system.

Built for the OnnoRokom Projukti Limited Assistant Software Engineer recruitment assignment.

---

## 1. Project overview

- **Frontend**: React.js (Vite) + Tailwind CSS
- **Backend**: Express.js (Node.js) REST API
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT-based authentication with role-based authorization (admin / teacher / student)
- **Docs**: Swagger / OpenAPI, auto-served at `/api-docs`
- **Testing**: Jest + Supertest (in-memory MongoDB via `mongodb-memory-server`)

## 2. Main features

**Admin**
- Manage users (create/update/deactivate admins, teachers, students)
- Manage classes/courses and subjects
- Assign teachers to subjects
- View all assignments and submissions across the system

**Teacher**
- Create, update, delete assignments for subjects they are assigned to teach
- Publish an assignment or keep it as a draft (drafts are hidden from students)
- View submissions for their own assignments
- Grade submissions (marks + feedback), and manually adjust submission status

**Student**
- View published assignments for their own class
- Submit an answer (with an optional attachment link)
- Update a submission before the deadline (if the teacher allows it)
- View submission status, marks, and feedback once graded

## 3. Technology stack

| Layer      | Technology                                              |
|------------|-----------------------------------------------------------|
| Frontend   | React 18, Vite, React Router, Tailwind CSS, Axios          |
| Backend    | Node.js, Express.js, Mongoose, JWT, bcryptjs, express-validator |
| Database   | MongoDB                                                   |
| Docs       | swagger-jsdoc + swagger-ui-express                        |
| Logging    | winston + morgan                                          |
| Testing    | Jest, Supertest, mongodb-memory-server                    |

## 4. Project structure

```
assignment-system/
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── models/                   # User, Class, Subject, Assignment, Submission
│   ├── middleware/                # auth (JWT + RBAC), error handler, validation
│   ├── controllers/               # business logic per resource
│   ├── routes/                    # Express routers + Swagger annotations
│   ├── utils/                     # logger, JWT helper, swagger config
│   ├── seed/seed.js               # populates demo data
│   ├── tests/                     # Jest + Supertest test suites
│   ├── app.js                     # Express app (exported for tests)
│   ├── server.js                  # entrypoint (connects DB, starts server)
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                   # axios instance + resource API helpers
    │   ├── context/AuthContext.jsx
    │   ├── components/            # Navbar, Modal, ProtectedRoute, etc.
    │   └── pages/
    │       ├── auth/Login.jsx
    │       ├── admin/              # AdminOverview, Users, Classes, Subjects, Assignments
    │       ├── teacher/            # TeacherAssignments, TeacherSubmissions
    │       └── student/            # StudentAssignments, StudentSubmissions
    └── .env.example
```

## 5. Data model & relationships

- **User**: `name, email, password (hashed), role (admin|teacher|student), classId (students only), isActive`
- **Class**: `name, section, description` — a class/course group students belong to.
- **Subject**: `name, code, classId (ref Class), teachers (ref User[])` — subjects belong to a
  class and can have one or more teachers assigned.
- **Assignment**: `title, description, classId, subjectId, teacherId, deadline, maxMarks, status
  (draft|published), allowLateSubmission, allowResubmissionBeforeDeadline`
- **Submission**: `assignmentId, studentId, answerText, attachmentUrl, status
  (submitted|late|graded), marks, feedback, submittedAt, gradedAt, gradedBy` — one submission
  per student per assignment (updated in place rather than duplicated).

**Key business rules enforced by the API:**
- A teacher can only create/edit assignments for subjects they are assigned to teach.
- Students only ever see **published** assignments for **their own class**.
- Submissions after the deadline are rejected unless the assignment explicitly allows late
  submissions (in which case they're flagged `late`).
- A student can update their submission only before the deadline, only if the assignment allows
  it, and never after it has been graded.
- Marks entered by a teacher cannot exceed the assignment's `maxMarks`.
- Every mutation checks ownership (a teacher cannot touch another teacher's assignment or grade
  another teacher's submissions; a student cannot touch another student's submission).

## 6. Setup instructions

### Prerequisites
- Node.js 18+ and npm
- A running MongoDB instance (local install, Docker, or MongoDB Atlas)

### 6.1 Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set MONGO_URI, JWT_SECRET, etc.
```

**.env variables:**

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/assignment_system
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=*
```

**Seed the database with demo data (classes, subjects, users, sample assignments):**

```bash
npm run seed
```

**Run the API:**

```bash
npm run dev      # nodemon, auto-restart on changes
# or
npm start        # plain node
```

The API will be available at `http://localhost:3001`, with interactive Swagger docs at
`http://localhost:3001/api-docs`.

### 6.2 Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# edit VITE_API_BASE_URL if your backend isn't on localhost:5000
npm run dev
```

The app will be available at `http://localhost:5173`.

### 6.3 Running tests

```bash
cd backend
npm test
```

Tests spin up an in-memory MongoDB instance automatically (via `mongodb-memory-server`), so no
running database is required to run the test suite — just internet access the first time, to
download the MongoDB test binary.

Test coverage includes:
- Login success/failure, protected-route rejection without/with an invalid token
- Role-based authorization (403s for disallowed roles across admin/teacher/student routes)
- Assignment ownership rules (a teacher can't touch another teacher's subject/assignment)
- Draft vs. published visibility to students
- The full submission lifecycle: on-time submission, blocked late submission, allowed late
  submission, duplicate-submission rejection, update-before-deadline, blocked update after
  deadline, grading, marks-exceeding-maxMarks rejection, and blocked edits after grading

## 7. Demo credentials

After running `npm run seed` in the backend:

| Role     | Email                 | Password     |
|----------|------------------------|--------------|
| Admin    | admin@school.test      | Admin@123    |
| Teacher  | teacher@school.test    | Teacher@123  |
| Teacher2 | teacher2@school.test   | Teacher@123  |
| Student  | student@school.test    | Student@123  |
| Student2 | student2@school.test   | Student@123  |

The login page also has clickable demo-account shortcuts that autofill these credentials.

## 8. Assumptions

- A "class/course" and a "subject" are modeled separately: a `Class` is the group a student
  belongs to (e.g. "Class 10, Section A"), and a `Subject` belongs to a class and has one or
  more teachers assigned to it. An assignment is created for a specific subject within a class.
- A student may only submit **one** answer per assignment; resubmission before the deadline
  updates that same submission in place rather than creating a new record, which keeps the
  submission history simple and matches "update a submission before the deadline" in the brief.
- Attachments are handled as a plain URL/link field (`attachmentUrl`) rather than binary file
  upload/storage, to keep the submission flow simple — a student pastes a link to their file
  (e.g. Google Drive) instead of uploading it directly to the server.
- "Change the submission status when necessary" (a teacher responsibility) is implemented as a
  dedicated `PUT /api/submissions/:id/status` endpoint, in addition to the grading endpoint which
  sets status to `graded` automatically.
- Admins can view all assignments/submissions but do not grade by default in the UI (the API
  does allow it, since `admin` is included alongside `teacher` in the authorization list for
  grading routes) — admin's role in the brief is primarily oversight and user/class/subject
  management.
- Deleting an assignment cascades to delete its submissions, since an orphaned submission
  referencing a non-existent assignment would break the data model.

## 9. Known limitations

- File attachments are link-based only (no binary upload/storage).
- No email notifications for new assignments, grading, or deadlines.
- No pagination on list endpoints — acceptable at the scale of a demo dataset, but would need
  adding for a large production dataset.
- No password-reset flow — an admin must manually reset a user's password via the "edit user"
  form.
- The "admin grading" path exists in the API for completeness but isn't surfaced as a dedicated
  page in the admin UI (admins can view but the grading form lives on the teacher's Submissions
  page).

## 10. API documentation

Once the backend is running, visit `http://localhost:3001/api-docs` for the full interactive
Swagger/OpenAPI documentation, including every endpoint, required roles, and request/response
schemas. You can authenticate directly in the Swagger UI using the "Authorize" button with a JWT
obtained from `POST /api/auth/login`.
