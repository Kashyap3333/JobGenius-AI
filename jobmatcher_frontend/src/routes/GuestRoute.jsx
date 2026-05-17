import { Navigate, Outlet } from "react-router-dom";

export default function GuestRoute() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    const destination =
      user.role === "RECRUITER" ? "/recruiter-dashboard" : "/find-jobs";
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
