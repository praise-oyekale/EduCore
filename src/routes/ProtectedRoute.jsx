import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function ProtectedRoute({ allowedRole}) {
    const {user, role, loading} = useAuth()

    if (loading) return  <div className="flex justify-center item-center ">Loading....</div>

    
    if (!user) return <Navigate to="/login" replace />
    if (!allowedRole.includes(role)) {
        if (role === "admin") return <Navigate to="/admin"/>;
        if (role === "teacher") return <Navigate to="/teacher"/>;
        return <Navigate to="/student"/>;
    }
    return <Outlet />
} 