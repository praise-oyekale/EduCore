// import { FaUser, FaBook } from "react-icons";
// import { MdDashboard } from "react-icons/md";

export const StudentSidebar = [
  {
    title: "MAIN",
    items: [
      {
        // icon: MdDashboard,
        label: "Overview",
        path: "/student",
      },
    ],
  },
  {
    title: "Academics",
    items: [
      {
        // icon: FaUser,
        label: "Profile",
        path: "/student/profile",
      },
      {
        label: "Courses",
        path: "/student/courses",
      },
      {
        label: "Results/GPA",
        path: "/student/results",
      },
      {
        label: "Assignment",
        path: "/studentassignments",
      },
      {
        label: "Timetable",
        path: "/studenttimetable",
      },
    ],
  },

  {
    title: "Finance",
    items: [
      {
        label: "Fees & Payment",
        path: "/studentpayment",
      },
    ],
  },

  {
    title: "Communication",
    items: [
      {
        label: "Anouncement",
        path: "/studentanouncement",
      },
      {
        label: "Events",
        path: "/studentevents",
      },
      {
        label: "Messages",
        path: "/studentmessages",
      },
      {
        label: "Notification",
        path: "/studentnotification",
      },
    ],
  },

  {
    title: "Resources",
    items: [
      {
        label: "Document",
        path: "/studentdocuments"
      },
    ],
  },

  {
    title: "ACCOUNT",
    items: [
      {
        label: "Settings",
        path: "/studentsettings",
      },
      {
        label: "Help & Support",
        path: "/studentsupport"
      },
    ],
  },
];



export const TeacherSidebar = [
  {
    title: "MAIN",
    items: [
      {
        // icon: MdDashboard,
        label: "Overview",
        path: "/teacher",
      },
       {
        // icon: FaUser,
        label: "Profile",
        path: "/teacher/profile",
      },
    ],
  },

  {
    title: "TEACHING",
    items: [
      {
        label: 'My Classes',
        path: "/teacher/classes"
      },
      {
        label: 'Students',
        path: "/teacher/myStudents"
      },
      {
        label: 'Subjects',
        path: "/teacher/subject"
      },
      {
        label: 'Attendance',
        path: "/teacher/attendance"
      },
      {
        label: 'Results/ Grades',
        path: "/teacher/grades"
      },
      {
        label: 'Assignments',
        path: "/teacher/assignment"
      },
      {
        label: 'Assignment Submissions',
        path: "/teacher/assSubmission"
      },
      {
        label: 'Timetable',
        path: "/teacher/timetable"
      },
      {
        label: 'Teaching Resourses',
        path: "/teacher/teachingResources"
      },


    ]
  }
]


export const AdminSidebar = [
  {
    title: "MAIN",
    items: [
      {
        // icon: MdDashboard,
        label: "Overview",
        path: "/admin",
      },
       {
        // icon: FaUser,
        label: "Profile",
        path: "/admin/profile",
      },
    ],
  },

  {
    title: "PEOPLE",
    items: [
      {
        label: 'Students',
        path: "/teacher/classes"
      },
      {
        label: 'Teachers & Staffs',
        path: "/admin/staffs"
      },


    ]

  },

  {
    title: "ACADEMICS",
    items: [
      {
        label: 'Classes & Sections',
        path: "/admin/classes"
      },
      {
        label: 'Subjects',
        path: "/admin/subjects"
      },
      {
        label: 'Admissions',
        path: "/admin/admissions"
      },
      {
        label: 'Attendance',
        path: "/admin/attendance"
      },
      {
        label: 'Results & Performance',
        path: "/admin/results"
      },
      {
        label: 'TimeTable',
        path: "/admin/timetable"
      },
    ]
  }
]