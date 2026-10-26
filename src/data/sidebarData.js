import {
  FaTachometerAlt,
  FaUser,
  FaBookOpen,
  FaChartLine,
  FaTasks,
  FaCalendarAlt,
  FaCreditCard,
  FaBullhorn,
  FaCalendarDay,
  FaComments,
  FaBell,
  FaFolderOpen,
  FaCog,
  FaHeadset,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBook,
  FaClipboardCheck,
  FaAward,
  FaFileUpload,
  FaFolder,
  FaUserTie,
  FaSchool,
  FaUserPlus,
  FaClipboardList,
} from "react-icons/fa";

export const StudentSidebar = [
  {
    title: "MAIN",
    items: [
      {
        icon: FaTachometerAlt,
        label: "Overview",
        path: "/student",
        isLocked: false,
      },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        icon: FaUser,
        label: "Profile",
        path: "/student/profile",
        isLocked: false,
      },
      {
        icon: FaBookOpen,
        label: "Courses",
        path: "/student/courses",
        isLocked: false,
      },
      {
        icon: FaChartLine,
        label: "Results/GPA",
        path: "/student/grades",
        isLocked: false,
      },
      {
        icon: FaTasks,
        label: "Assignment",
        path: "/studentassignments",
        isLocked: true,
      },
      {
        icon: FaCalendarAlt,
        label: "Timetable",
        path: "/studenttimetable",
        isLocked: true,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        icon: FaCreditCard,
        label: "Fees & Payment",
        path: "/studentpayment",
        isLocked: false,
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        icon: FaBullhorn,
        label: "Anouncement",
        path: "/studentanouncement",
        isLocked: true,
      },
      {
        icon: FaCalendarDay,
        label: "Events",
        path: "/studentevents",
        isLocked: true,
      },
      {
        icon: FaComments,
        label: "Messages",
        path: "/studentmessages",
        isLocked: true,
      },
      {
        icon: FaBell,
        label: "Notification",
        path: "/studentnotification",
        isLocked: true,
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        icon: FaFolderOpen,
        label: "Document",
        path: "/studentdocuments",
        isLocked: true,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        icon: FaCog,
        label: "Settings",
        path: "/studentsettings",
        isLocked: false,
      },
      {
        icon: FaHeadset,
        label: "Help & Support",
        path: "/studentsupport",
        isLocked: false,
      },
    ],
  },
];

export const TeacherSidebar = [
  {
    title: "MAIN",
    items: [
      {
        icon: FaTachometerAlt,
        label: "Overview",
        path: "/teacher",
        isLocked: false,
      },
      {
        icon: FaUser,
        label: "Profile",
        path: "/teacher/profile",
        isLocked: false,
      },
    ],
  },
  {
    title: "TEACHING",
    items: [
      {
        icon: FaChalkboardTeacher,
        label: "My Classes",
        path: "/teacher/classes",
        isLocked: false,
      },
      {
        icon: FaUserGraduate,
        label: "Students",
        path: "/teacher/students",
        isLocked: false,
      },
      {
        icon: FaBook,
        label: "Subjects",
        path: "/teacher/subjects",
        isLocked: false,
      },
      {
        icon: FaClipboardCheck,
        label: "Attendance",
        path: "/teacher/attendance",
        isLocked: false,
      },
      {
        icon: FaAward,
        label: "Results/ Grades",
        path: "/teacher/grades",
        isLocked: false,
      },
      {
        icon: FaTasks,
        label: "Assignments",
        path: "/teacher/assignment",
        isLocked: true,
      },
      {
        icon: FaFileUpload,
        label: "Assignment Submissions",
        path: "/teacher/assSubmission",
        isLocked: true,
      },
      {
        icon: FaCalendarAlt,
        label: "Timetable",
        path: "/teacher/timetable",
        isLocked: true,
      },
      {
        icon: FaFolder,
        label: "Teaching Resourses",
        path: "/teacher/teachingResources",
        isLocked: true,
      },
    ],
  },
];

export const AdminSidebar = [
  {
    title: "MAIN",
    items: [
      {
        icon: FaTachometerAlt,
        label: "Overview",
        path: "/admin",
        isLocked: false,
      },
      {
        icon: FaUser,
        label: "Profile",
        path: "/admin/profile",
        isLocked: false,
      },
    ],
  },
  {
    title: "PEOPLE",
    items: [
      {
        icon: FaUserGraduate,
        label: "Students",
        path: "/admin/students",
        isLocked: false,
      },
      {
        icon: FaUserTie,
        label: "Teachers & Staffs",
        path: "/admin/staffs",
        isLocked: false,
      },
    ],
  },
  {
    title: "ACADEMICS",
    items: [
      {
        icon: FaSchool,
        label: "Classes & Sections",
        path: "/admin/classes",
        isLocked: true,
      },
      {
        icon: FaBook,
        label: "Subjects",
        path: "/admin/subjects",
        isLocked: true,
      },
      {
        icon: FaUserPlus,
        label: "Admissions",
        path: "/admin/admissions",
        isLocked: false,
      },
      {
        icon: FaClipboardList,
        label: "Attendance",
        path: "/admin/attendance",
        isLocked: true,
      },
      {
        icon: FaChartLine,
        label: "Results & Performance",
        path: "/admin/results",
        isLocked: true,
      },
      {
        icon: FaCalendarAlt,
        label: "TimeTable",
        path: "/admin/timetable",
        isLocked: true,
      },
    ],
  },
];
