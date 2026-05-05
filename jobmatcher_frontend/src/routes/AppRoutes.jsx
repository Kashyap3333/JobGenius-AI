// src/routes/AppRoutes.jsx

import { Routes, Route, Navigate } from "react-router-dom";
import Register from "../pages/RegisterPage";
import Login from "../pages/LoginPage";

// Layouts
import RecruiterLayout from "../components/layout/RecruiterLayout";
import CandidateLayout from "../components/layout/CandidateLayout";

// Route guards
import ProtectedRoute from "./ProtectedRoute";

// Recruiter pages
import RecruiterDashboard from "../pages/RecruiterDashboard";
import PostJobPage from "../pages/PostJobPage";
import EditJobPage from "../pages/EditJobPage";
import ManageJobsPage from "../pages/ManageJobPage";

// Candidate pages
import JobListingPage from "../pages/JobListingPage";
import SkillManagementPage from "../pages/SkillManagementPage";
import SkillGapPage from "../pages/SkillGapPage";
import MyApplicationsPage from "../pages/MyApplicationsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* ── Recruiter — all pages share RecruiterLayout (Navbar) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<RecruiterLayout />}>
          <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
          <Route path="/post-job" element={<PostJobPage />} />
          <Route path="/edit-job/:id" element={<EditJobPage />} />
          <Route path="/manage-jobs" element={<ManageJobsPage />} />
        </Route>
      </Route>

      {/* ── Candidate — all pages share CandidateLayout (Navbar) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<CandidateLayout />}>
          <Route path="/find-jobs" element={<JobListingPage />} />
          <Route path="/skill-management" element={<SkillManagementPage />} />
          <Route path="/skill-gap" element={<SkillGapPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
        </Route>
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
