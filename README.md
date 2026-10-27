# EduCore: School Management System

**🔗 Live demo: [educore01.netlify.app](https://educore01.netlify.app/)**

EduCore is a role-based school management system built with **React** and **Firebase**. Admins, teachers and students each get their own dashboard, and all three read from the same live Firestore data. When a teacher saves a score, the student sees it right away. When an admin posts an announcement, it appears on the student dashboard.

> Built as my first major full-stack project and documented in public as I learn.

## Features

### Admin
- Dashboard with live school statistics: enrolled students, attendance, transfers and attendance by class
- Student management: search, filter by class (JSS1 to SSS3), view, edit and add students
- Teacher and staff management: titles, departments, assigned classes, subjects, qualifications and employment details
- Announcements: post updates that show up on student dashboards
- Profile page with account and permission details and profile picture upload

### Teacher
- Dashboard built from real data: assigned students, classes, awaiting scores and class performance
- My Classes: open a class roster and enter student scores
- Students page: every student in the teacher's classes, with grade, attendance and status
- Profile page with employment summary and profile picture upload

### Student
- Dashboard showing their subjects, progress and the latest school announcements
- Subjects page that updates live when a teacher records a score
- Profile page with personal, guardian and academic details and profile picture upload

### Shared
- Email and password authentication with **role-based routing**
- Protected routes that send each user to their own dashboard
- Admin-created accounts that do not log the admin out (a secondary Firebase app instance creates the account)
- Profile picture upload for every role, with automatic cropping and resizing
- Live data: pages update without a refresh when records change

## How the roles connect

```
Admin assigns classes and subjects to a teacher
   → the teacher sees only the students in those classes
   → the teacher enters scores
   → the student sees them instantly
   → the admin can edit the same record

Admin posts an announcement
   → it appears on the student dashboard
```

## Tech stack

| Area | Tools |
|---|---|
| Frontend | React, React Router |
| Backend | Firebase Authentication, Cloud Firestore, Firebase Storage |
| Charts | Recharts |
| Icons | React Icons |
| Styling | Custom CSS |
| Hosting | Netlify |

## Data model

| Collection | Purpose |
|---|---|
| `student` | Profile, class, status, `photoURL` and a `subjects` array of `{ name, score }` |
| `teacher` | Teaching and non-teaching staff, assigned classes and subjects |
| `admin` | Administrator profiles |
| `attendance` | Daily records: `studentId`, `date`, `status` |
| `announcements` | Posts from the admin, shown on dashboards |
| `events`, `admissions` | Content shown on the admin dashboard |

Each user document ID is the Firebase Auth UID. Profile pictures live in Firebase Storage, and only their URL is saved in the user's document.

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/educore.git
cd educore

# 2. Install dependencies
npm install

# 3. Add your Firebase config (see below)

# 4. Start the development server
npm run dev
```

### Firebase setup
1. Create a project in the [Firebase console](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password), **Firestore** and **Storage**.
3. Copy your web app config into `src/firebase.js`, ideally from environment variables, and never commit real keys.
4. Add Firestore and Storage security rules before using real data.

## Project structure

```
src/
├── components/common/   Shared pieces such as Avatar and AvatarUpload
├── context/             AuthContext (role-aware auth state)
├── pages/               admin, teacher and student pages
├── services/            Firestore functions (admin, teacher, student, subject, profile picture)
└── firebase.js          Firebase initialisation
```

## Roadmap

- [x] Role-based authentication and protected routes
- [x] Admin, teacher and student dashboards connected to Firestore
- [x] Student and staff management
- [x] Score entry and live results
- [x] Profile picture upload for all roles
- [x] Admin announcements shown on the student dashboard
- [x] Deployed on Netlify
- [ ] Attendance marking
- [ ] Assignments and submissions
- [ ] Timetable
- [ ] Announcements for teachers, plus an announcements archive page
- [ ] Firestore and Storage security
