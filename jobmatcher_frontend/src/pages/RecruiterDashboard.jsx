// src/pages/RecruiterDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  TrendingUp,
  Calendar,
  ChevronDown,
  MoreVertical,
  ArrowRight,
  Pencil,
  Trash2,
  Search,
  X,
} from "lucide-react";
import API from "../services/api";

// ── Stat Card ─────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  trendColor,
  label,
  value,
  sub,
  subColor,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-start gap-3 sm:gap-4 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-0">
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon size={22} className={`sm:w-6 sm:h-6 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl sm:text-[32px] font-bold text-gray-900 leading-tight">
          {value}
        </p>
        <p className={`text-xs sm:text-sm mt-1 font-medium ${subColor}`}>
          {sub}
        </p>
      </div>
      <TrendingUp
        size={20}
        className={`sm:w-6 sm:h-6 ${trendColor} shrink-0 mt-1 sm:mt-2`}
      />
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Active: "bg-green-50 text-green-600 border-green-200",
    Paused: "bg-amber-50 text-amber-600 border-amber-200",
    Closed: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${map[status] || map.Closed}`}
    >
      {status}
    </span>
  );
}

// ── Row Action Menu ───────────────────────────────────────────
function ActionMenu({ jobId, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
            <Link
              to={`/edit-job/${jobId}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} className="text-blue-500" /> Edit Job
            </Link>
            {/* <button
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
            >
              <Eye size={14} className="text-violet-500" /> View Apps
            </button> */}
            <div className="border-t border-gray-100 my-1" />
            <button
              onClick={() => {
                onDelete(jobId);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Skeleton Row ──────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-50">
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32 sm:w-44 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-20 sm:w-28" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-3 bg-gray-200 rounded w-8" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-3 bg-gray-200 rounded w-20 sm:w-24" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-3 bg-gray-200 rounded w-20 sm:w-24" />
      </td>
      <td className="px-4 sm:px-6 py-4">
        <div className="h-4 bg-gray-100 rounded w-4" />
      </td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────
export default function RecruiterDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = (user?.name || user?.username || "there").split(" ")[0];

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // ── NEW

  useEffect(() => {
    API.get("/jobs")
      .then((res) => setJobs(res.data || []))
      .catch(() => setError("Failed to load jobs."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Delete this job posting?")) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch {
      alert("Failed to delete job.");
    }
  };

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(
    (j) => (j.status || "Active") === "Active",
  ).length;
  const totalApplications = jobs.reduce((s, j) => s + (j.applications || 0), 0);

  // ── Search filter + slice ── NEW
  const filteredJobs = jobs.filter((j) => {
    const q = searchQuery.toLowerCase();
    return (
      j.title?.toLowerCase().includes(q) ||
      j.jobType?.toLowerCase().includes(q) ||
      j.workMode?.toLowerCase().includes(q)
    );
  });
  const recentJobs = searchQuery ? filteredJobs : jobs.slice(0, 5);

  const fmt = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "—";

  return (
    <div className="w-full overflow-x-hidden">
      <div className="scale-[0.8] origin-top-left w-[125%] px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8">
        {/* ── Welcome + Date ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Here's what's happening with your job postings.
            </p>
          </div>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors shrink-0">
            <Calendar size={15} className="sm:w-4 sm:h-4 text-gray-400" />
            <span className="whitespace-nowrap">May 12 – May 18, 2024</span>
            <ChevronDown size={15} className="sm:w-4 sm:h-4 text-gray-400" />
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={BriefcaseBusiness}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
            trendColor="text-blue-400"
            label="Total Jobs"
            value={loading ? "—" : totalJobs}
            sub="2 new this week"
            subColor="text-blue-500"
          />
          <StatCard
            icon={Users}
            iconBg="bg-green-50"
            iconColor="text-green-500"
            trendColor="text-green-400"
            label="Total Applications"
            value={loading ? "—" : totalApplications || 128}
            sub="18 new this week"
            subColor="text-green-500"
          />
          <StatCard
            icon={BriefcaseBusiness}
            iconBg="bg-violet-50"
            iconColor="text-violet-500"
            trendColor="text-violet-400"
            label="Active Jobs"
            value={loading ? "—" : activeJobs}
            sub="3 expiring soon"
            subColor="text-amber-500"
          />
        </div>

        {/* ── Recent Job Postings ── */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* ── Table Header with Search ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 gap-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 shrink-0">
              Recent Job Postings
            </h2>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Search input */}
              <div className="relative flex-1 sm:w-56 md:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title..."
                  className="w-full pl-8 pr-8 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* View All Jobs button */}
              <Link
                to="/manage-jobs"
                className="group inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 whitespace-nowrap shrink-0"
              >
                View All Jobs
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          {error && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-red-50 border-b border-red-100 text-xs sm:text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="overflow-x-auto w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Job Title",
                    "Applications",
                    "Status",
                    "Last Date to Apply",
                    "Posted On",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {/* Loading skeleton */}
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}

                {/* Empty state — no jobs at all */}
                {!loading && jobs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 sm:px-6 py-12 sm:py-16 text-center"
                    >
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                          <BriefcaseBusiness
                            size={24}
                            className="sm:w-7 sm:h-7 text-gray-300"
                          />
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm font-medium">
                          No job postings yet
                        </p>
                        <Link
                          to="/post-job"
                          className="text-xs sm:text-sm text-blue-600 font-semibold hover:underline"
                        >
                          + Post your first job
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {/* No search results */}
                {!loading &&
                  jobs.length > 0 &&
                  searchQuery &&
                  filteredJobs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 sm:px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
                          {/* Icon */}
                          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                            <Search size={28} className="text-blue-400" />
                          </div>

                          {/* Title */}
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            No results found
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                            We couldn’t find any jobs matching{" "}
                            <span className="text-blue-600 font-semibold">
                              "{searchQuery}"
                            </span>
                          </p>

                          {/* Suggestions */}
                          <p className="text-xs text-gray-400 mt-2">
                            Try adjusting your search or using different
                            keywords
                          </p>

                          {/* Action */}
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                          >
                            <X size={14} />
                            Clear Search
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                {/* Job rows */}
                {!loading &&
                  recentJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="group transition-all duration-200 hover:bg-gray-50 hover:shadow-sm"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-all duration-200 cursor-pointer">
                          {job.title}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {job.jobType || "Full-time"} •{" "}
                          {job.location || job.workMode || "Remote"}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-700">
                        {job.applications ?? "—"}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <StatusBadge status={job.status || "Active"} />
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                        {fmt(job.lastDateToApply || job.deadline)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                        {fmt(job.createdAt || job.postedOn)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <ActionMenu jobId={job.id} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* View all footer */}
          {!loading && recentJobs.length > 0 && (
            <div className="border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-center">
              <Link
                to="/manage-jobs"
                className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 font-semibold hover:gap-3 transition-all duration-200"
              >
                View All Jobs <ArrowRight size={14} className="sm:w-4 sm:h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
