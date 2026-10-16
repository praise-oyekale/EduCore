import { Navigate, Route, Routes } from "react-router-dom"
import Home from "../pages/landing/Home"
import Login from "../pages/auth/Login"
import Signup from "../pages/auth/Signup"
import  StudentDashboard  from "../pages/student/studentdashboard/StudentDashboard"
import ProtectedRoute from "../routes/ProtectedRoute"
import StudentProfile from "../pages/student/studentprofile/StudenttProfile"
import StudentLayout from "../components/layout/StudentLayout"
import StudentCourses from "../pages/student/studentcourses/StudentCourses"
import TeacherLayout from "../components/layout/Teacherlayout"
import TeacherDashboard from "../pages/teacher/TeacherDashboard"
import TeacherProfile from "../pages/teacher/TeacherProfile"
import TeacherClasses from "../pages/teacher/TeacherClasses"
import AdminLayout from "../pages/admin/AdminLayout"
import AdminDashboard from "../pages/admin/AdminDashboard"

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            

            <Route element={<ProtectedRoute allowedRole={["student"]} />}>
                <Route path="/student" element={<StudentLayout />}>
                    <Route index element={<StudentDashboard />} />
                    <Route path="/student/profile" element={<StudentProfile />}/>
                    <Route path="/student/courses" element={<StudentCourses />} />
                </Route>
            
            </Route>

            <Route element={<ProtectedRoute allowedRole={["teacher"]} />}>
                <Route path="/teacher" element={<TeacherLayout />}>
                    <Route index element={<TeacherDashboard />} />
                    <Route path="/teacher/profile" element={<TeacherProfile />}/>
                    <Route path="/teacher/classes" element={<TeacherClasses />} />
                </Route>
            
            </Route>

            <Route element={<ProtectedRoute allowedRole={["admin"]} />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    {/* <Route path="/student/profile" element={<StudentProfile />}/> */}
                    {/* <Route path="/student/courses" element={<StudentCourses />} /> */}
                </Route>
            
            </Route>
            

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
    
}

export default AppRoutes