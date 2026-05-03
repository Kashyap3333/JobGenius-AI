import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/RegisterPage";
import Login from "../pages/LoginPage";
import RecruiterLayout from "../components/layout/RecruiterLayout";
import RecruiterDashboard from "../pages/RecruiterDashboard";
import PostJobPage from "../pages/PostJobPage";
import ProtectedRoute from "./ProtectedRoute";
import EditJobPage from "../pages/EditJobPage";

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
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/edit-job/:id" element={<EditJobPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
