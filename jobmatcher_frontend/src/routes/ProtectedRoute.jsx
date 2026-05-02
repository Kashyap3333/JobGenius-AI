// src/routes/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  // Not logged in? Redirect to login
  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
}
