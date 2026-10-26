import { Navigate, Route, Routes } from "react-router-dom"
import Home from "../pages/landing/Home"
import Login from "../pages/auth/Login"

import  StudentDashboard  from "../pages/student/studentdashboard/StudentDashboard"
import ProtectedRoute from "../routes/ProtectedRoute"
import StudentProfile from "../pages/student/studentprofile/StudenttProfile"
import StudentLayout from "../components/layout/StudentLayout"
// import StudentCourses from "../pages/student/studentcourses/StudentCourses"
import TeacherLayout from "../components/layout/Teacherlayout"
import TeacherDashboard from "../pages/teacher/TeacherDashboard"
import TeacherProfile from "../pages/teacher/TeacherProfile"
import TeacherClasses from "../pages/teacher/TeacherClasses"
import AdminLayout from "../pages/admin/AdminLayout"
import AdminDashboard from "../pages/admin/AdminDashboard"
import AdminProfile from "../pages/admin/Adminprofile"
import Adminstudents from "../pages/admin/Adminstudent"
import StudentSubjects from "../pages/student/studentcourses/StudentSubject"
import AdminStaff from "../pages/admin/AdminStaffs"
import TeacherStudents from "../pages/teacher/TeacherStudent"
import { TeacherSubjects } from "../pages/teacher/TeacherSubject"
import { TeacherAttendance } from "../pages/teacher/TeacherAttendance"
import { TeacherGrades } from "../pages/teacher/TeacherGrades"
import { StudentGrades } from "../pages/student/studentgrades&result/StudentGrades"
import Apply from "../pages/auth/Apply"
import AdminAdmissions from "../pages/admin/AdminAdmission"
import FeatureCard from "../components/common/FeatureCard"

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/apply" element={<Apply />} />
           

            

            <Route element={<ProtectedRoute allowedRole={["student"]} />}>
                <Route path="/student" element={<StudentLayout />}>
                    <Route index element={<StudentDashboard />} />
                    <Route path="/student/profile" element={<StudentProfile />}/>
                    <Route path="/student/courses" element={<StudentSubjects />} />
                    <Route path="/student/grades" element={<StudentGrades />} />

                </Route>
            
            </Route>

            <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
                <Route path="/teacher" element={<TeacherLayout />}>
                    <Route index element={<TeacherDashboard />} />
                    <Route path="/teacher/profile" element={<TeacherProfile />}/>
                    <Route path="/teacher/classes" element={<TeacherClasses />} />
                    <Route path="/teacher/students" element={<TeacherStudents />} />
                    <Route path="/teacher/subjects" element={<TeacherSubjects />} />
                    <Route path="/teacher/attendance" element={<TeacherAttendance />} />
                    <Route path="/teacher/grades" element={<TeacherGrades />} />
                </Route>
            
            </Route>

            <Route element={<ProtectedRoute allowedRole={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="/admin/profile" element={<AdminProfile />}/>
                    <Route path="/admin/students" element={<Adminstudents />} />
                    <Route path="/admin/staffs" element={<AdminStaff />} />
                    <Route path="/admin/admissions" element={<AdminAdmissions />} />
                </Route>
            
            </Route>
            

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
    
}

export default AppRoutes