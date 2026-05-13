// src/pages/JobApplicantsPage.jsx
// Navbar comes from RecruiterLayout — do NOT add it here

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  ChevronDown,
  Mail,
  Calendar,
  X,
  FileText,
  Eye,
  Download,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────────────────────
const STATUSES = ["APPLIED", "SCREENING", "INTERVIEW", "ACCEPTED", "REJECTED"];

const STATUS_STYLES = {
  APPLIED: {
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#BFDBFE",
    dot: "#3B82F6",
  },
  SCREENING: {
    bg: "#FFFBEB",
    text: "#92400E",
    border: "#FDE68A",
    dot: "#F59E0B",
  },
  INTERVIEW: {
    bg: "#F5F3FF",
    text: "#5B21B6",
    border: "#DDD6FE",
    dot: "#8B5CF6",
  },
  ACCEPTED: {
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
    dot: "#22C55E",
  },
  REJECTED: {
    bg: "#FEF2F2",
    text: "#991B1B",
    border: "#FECACA",
    dot: "#EF4444",
  },
};

function StatusBadge({ value }) {
  const key = value?.toUpperCase();
  const s = STATUS_STYLES[key] || {
    bg: "#F9FAFB",
    text: "#6B7280",
    border: "#E5E7EB",
    dot: "#9CA3AF",
  };
  return (
    <span
      style={{
        backgroundColor: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
      }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
    >
      <span
        style={{ backgroundColor: s.dot }}
        className="w-1.5 h-1.5 rounded-full shrink-0"
      />
      {key}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// StatusDropdown — uses portal to escape overflow:hidden
// ─────────────────────────────────────────────────────────────
function StatusDropdown({
  applicationId,
  currentStatus,
  onStatusChange,
  updating,
}) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef(null);
  const dropRef = useRef(null);

  // Position the portal dropdown below the button
  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 160),
      });
    }
    setOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        dropRef.current &&
        !dropRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on scroll/resize to avoid stale position
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const currentKey = currentStatus?.toUpperCase();
  const currentStyle = STATUS_STYLES[currentKey];

  return (
    <>
      <button
        ref={buttonRef}
        onClick={open ? () => setOpen(false) : openDropdown}
        disabled={updating}
        style={
          currentStyle
            ? { borderColor: currentStyle.border, color: currentStyle.text }
            : {}
        }
        className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-lg border bg-white text-xs font-semibold transition-all disabled:opacity-50 hover:shadow-sm w-[120px] justify-between cursor-pointer"
      >
        {updating ? (
          <span className="flex items-center gap-1.5 w-full justify-center text-gray-500">
            <Loader2 size={11} className="animate-spin" /> Saving…
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1.5 truncate">
              {currentStyle && (
                <span
                  style={{ backgroundColor: currentStyle.dot }}
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                />
              )}
              <span className="truncate">{currentKey || "Set status"}</span>
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform shrink-0 ml-1 ${open ? "rotate-180" : ""}`}
            />
          </>
        )}
      </button>

      {/* Portal — renders outside all overflow:hidden ancestors */}
      {open &&
        createPortal(
          <div
            ref={dropRef}
            style={{
              position: "absolute",
              top: dropPos.top,
              left: dropPos.left,
              width: dropPos.width,
              zIndex: 9999,
            }}
            className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Change Status
              </p>
            </div>
            {STATUSES.map((s) => {
              const style = STATUS_STYLES[s];
              const isCurrent = s === currentKey;
              return (
                <div
                  key={s}
                  onClick={() => {
                    if (!isCurrent) onStatusChange(applicationId, s);
                    setOpen(false);
                  }}
                  className={`px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2
                  ${isCurrent ? "opacity-40 cursor-default bg-gray-50" : "hover:bg-gray-50"}`}
                  style={{ color: style.text }}
                >
                  <span
                    style={{ backgroundColor: style.dot }}
                    className="w-2 h-2 rounded-full shrink-0"
                  />
                  {s}
                  {isCurrent && (
                    <span className="ml-auto text-[10px] text-gray-400 font-normal">
                      current
                    </span>
                  )}
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// JobApplicantsPage — Main
// ─────────────────────────────────────────────────────────────
export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    setLoading(true);
    setFetchError("");
    Promise.all([
      API.get(`/applications/job/${jobId}`),
      API.get(`/jobs/${jobId}`),
    ])
      .then(([appRes, jobRes]) => {
        setApplicants(appRes.data || []);
        setJobTitle(jobRes.data?.title || "");
      })
      .catch(() =>
        setFetchError("Failed to load applicants. Please try again."),
      )
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    setUpdateError("");
    try {
      await API.put(`/applications/${applicationId}/status`, {
        status: newStatus,
      });
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === applicationId ? { ...a, status: newStatus } : a,
        ),
      );
    } catch {
      setUpdateError("Failed to update status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const fmt = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = applicants.filter((a) => a.status?.toUpperCase() === s).length;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-13 py-6 sm:py-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/manage-jobs")}
            className="mt-0.5 p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-all shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Job Applicants
            </h1>
            {jobTitle && (
              <p className="text-gray-500 text-sm mt-0.5">
                Applicants for{" "}
                <span className="font-semibold text-gray-700">{jobTitle}</span>
              </p>
            )}
          </div>
        </div>
        {!loading && !fetchError && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl shrink-0 w-fit">
            <Users size={15} className="text-blue-500" />
            <span className="text-sm font-semibold text-blue-700">
              {applicants.length} Applicant{applicants.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* ── Status Summary Pills ── */}
      {!loading && !fetchError && applicants.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUSES.map((s) => {
            if (statusCounts[s] === 0) return null;
            const style = STATUS_STYLES[s];
            return (
              <div
                key={s}
                style={{
                  backgroundColor: style.bg,
                  borderColor: style.border,
                  color: style.text,
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold"
              >
                <span
                  style={{ backgroundColor: style.dot }}
                  className="w-2 h-2 rounded-full"
                />
                {s}
                <span className="font-bold ml-0.5">{statusCounts[s]}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Update error ── */}
      {updateError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
          <AlertCircle size={15} className="shrink-0" />
          <span className="flex-1">{updateError}</span>
          <button
            onClick={() => setUpdateError("")}
            className="p-0.5 hover:bg-red-100 rounded-lg transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <Loader2 size={30} className="animate-spin text-blue-500" />
          <p className="text-sm text-gray-500">Loading applicants…</p>
        </div>
      ) : fetchError ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3.5 text-sm max-w-md w-full">
            <AlertCircle size={16} className="shrink-0" /> {fetchError}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      ) : applicants.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Users size={28} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No applicants yet for this job.
          </p>
          <p className="text-xs text-gray-400">
            Applications will appear here once candidates apply.
          </p>
        </div>
      ) : (
        /* ── Table (overflow:hidden removed from wrapper — portal handles dropdown) ── */
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="overflow-x-auto rounded-2xl">
            <table
              className="w-full"
              style={{ minWidth: "960px", tableLayout: "fixed" }}
            >
              <colgroup>
                <col style={{ width: "44px" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {[
                    "#",
                    "Candidate",
                    "Email",
                    "Applied On",
                    "Status",
                    "Resume",
                    "Update Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {applicants.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`hover:bg-blue-50/20 transition-colors ${i % 2 !== 0 ? "bg-gray-50/30" : ""}`}
                  >
                    <td className="px-4 py-4 text-xs text-gray-400 font-medium">
                      {i + 1}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 text-blue-600 font-bold text-sm">
                          {(app.candidateName ||
                            app.userName ||
                            app.name ||
                            "?")[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {app.candidateName || app.userName || app.name || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail size={12} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-500 truncate">
                          {app.candidateEmail || app.email || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar
                          size={12}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="text-sm text-gray-500">
                          {fmt(app.appliedAt || app.appliedOn || app.createdAt)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge value={app.status} />
                    </td>

                    <td className="px-4 py-4">
                      {app.selectedResumeFileName && app.selectedResumeUrl ? (
                        <div className="flex flex-col gap-1.5 min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="w-5 h-5 rounded bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                              <FileText size={11} className="text-red-400" />
                            </div>
                            <span className="text-xs font-medium text-gray-700 truncate max-w-27.5" title={app.selectedResumeFileName}>
                              {app.selectedResumeFileName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 pl-0.5">
                            <a
                              href={app.selectedResumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Eye size={10} /> Preview
                            </a>
                            <a
                              href={app.selectedResumeUrl}
                              download
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Download size={10} /> Download
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <StatusDropdown
                        applicationId={app.id}
                        currentStatus={app.status}
                        onStatusChange={handleStatusChange}
                        updating={updatingId === app.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 rounded-b-2xl">
            <p className="text-xs text-gray-400">
              Total{" "}
              <span className="font-semibold text-gray-600">
                {applicants.length}
              </span>{" "}
              applicant{applicants.length !== 1 ? "s" : ""} for this position.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
