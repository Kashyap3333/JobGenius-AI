// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/LoginPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      {/* Protected — must be logged in */}
      <Route element={<ProtectedRoute />}></Route>
    </Routes>
  );
}
