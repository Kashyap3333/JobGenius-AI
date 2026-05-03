import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/RegisterPage";
import Login from "../pages/LoginPage";
import RecruiterLayout from "../components/layout/RecruiterLayout";
import RecruiterDashboard from "../pages/RecruiterDashboard";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Recruiter — all pages share RecruiterLayout (Navbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RecruiterLayout />}>
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          {/* /post-job and /manage-jobs routes to be added when pages are ready */}
        </Route>
      </Route>
    </Routes>
  );
}
