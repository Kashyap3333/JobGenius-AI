// src/pages/JobListingPage.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  BadgeCheck,
  IndianRupee,
  TrendingUp,
  Eye,
  PhoneCall,
  ArrowRight,
  Star,
  Loader2,
  AlertCircle,
  X,
  SlidersHorizontal,
  Building2,
  Monitor,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function timeAgo(date) {
  if (!date) return "";
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Normalise requiredSkills — backend returns [{id,name}] or [string]
function getSkillNames(job) {
  const raw = job.requiredSkills || job.skills || [];
  return raw
    .map((s) => (typeof s === "string" ? s : s?.name || s?.skillName || ""))
    .filter(Boolean);
}

const JOB_TYPE_STYLE = {
  FULL_TIME: { bg: "#EDE9FE", text: "#5B21B6" },
  PART_TIME: { bg: "#FEF3C7", text: "#92400E" },
  CONTRACT: { bg: "#FFF3E0", text: "#B45309" },
  INTERNSHIP: { bg: "#E0F2FE", text: "#0369A1" },
  FREELANCE: { bg: "#F0FDF4", text: "#166534" },
  REMOTE: { bg: "#ECFDF5", text: "#065F46" },
};

function JTypeBadge({ value }) {
  const key = value?.toUpperCase().replace(/[\s-]/g, "_");
  const color = JOB_TYPE_STYLE[key] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      style={{ backgroundColor: color.bg, color: color.text }}
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
    >
      {value?.replace(/_/g, " ")}
    </span>
  );
}

function MatchRing({ pct = 0 }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const color = pct >= 85 ? "#16a34a" : pct >= 70 ? "#2563eb" : "#f59e0b";
  return (
    <div className="relative w-[72px] h-[72px] flex items-center justify-center shrink-0">
      <svg width="72" height="72" className="-rotate-90 absolute inset-0">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="5"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-gray-900 leading-none">
          {pct}%
        </span>
        <span className="text-[10px] text-gray-400 font-medium">Match</span>
      </div>
    </div>
  );
}
function JobTypeDropdownUI({ value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full pl-0">
      <div
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between border rounded-xl pl-9 pr-3 py-2.5 text-sm bg-white transition-all
${open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value ? value.replace(/_/g, " ") : "Job Types"}
        </span>

        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {open && (
        <div className="absolute left-0 top-[110%] w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`px-4 py-2.5 text-sm cursor-pointer
            ${value === "" ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
          >
            Job Types
          </div>

          {options.map((t) => (
            <div
              key={t}
              onClick={() => {
                onChange(t);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-all
              ${value === t ? "bg-blue-50 text-blue-600 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {t.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function SkillChip({ name }) {
  return (
    <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full whitespace-nowrap">
      {name}
    </span>
  );
}

function FilterCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
      />
      <span
        className={`text-sm transition-colors ${checked ? "text-blue-600 font-medium" : "text-gray-600 group-hover:text-gray-900"}`}
      >
        {label}
      </span>
    </label>
  );
}

function QuickLinkCard({ icon: Icon, color, title, subtitle, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-left"
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: color.bg }}
      >
        <Icon size={17} style={{ color: color.icon }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-tight">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 leading-tight">{subtitle}</p>
      </div>
      <ArrowRight
        size={14}
        className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0"
      />
    </button>
  );
}

const APP_STATUS_STYLE = {
  Applied: { bg: "#EFF6FF", text: "#1D4ED8" },
  Interview: { bg: "#F0FDF4", text: "#15803D" },
  Screening: { bg: "#FFF7ED", text: "#C2410C" },
  Rejected: { bg: "#FFF1F2", text: "#BE123C" },
};

function AppStatusBadge({ status }) {
  const s = APP_STATUS_STYLE[status] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.text }}
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
    >
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dropdowns
// ─────────────────────────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = [
    "Most Relevant",
    "Newest First",
    "Highest Salary",
    "Best Match",
  ];

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all font-medium text-gray-700"
      >
        {value}
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {opts.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`px-4 py-2.5 text-sm cursor-pointer ${value === o ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SalaryDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const opts = ["Any", "₹5L – ₹10L", "₹10L – ₹15L", "₹15L – ₹25L", "₹25L+"];

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm border rounded-xl bg-white transition-all
          ${open ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}`}
      >
        <span
          className={
            value && value !== "Any"
              ? "text-gray-800 font-medium"
              : "text-gray-400"
          }
        >
          {value || "Select range"}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {opts.map((o) => (
            <div
              key={o}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer ${value === o ? "bg-blue-50 text-blue-600 font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Job Card
// ─────────────────────────────────────────────────────────────────────────────

function JobCard({ job, matchPct, saved, onSave, onApply }) {
  const skillNames = getSkillNames(job);
  const shown = skillNames.slice(0, 4);
  const extra = skillNames.length - shown.length;

  const fmtSalary = (s) => {
    if (s == null) return null;

    const yearly = s * 12;

    const yearlyFormatted =
      yearly >= 100000
        ? `₹${(yearly / 100000).toFixed(1).replace(/\.0$/, "")}L/year`
        : `₹${yearly.toLocaleString("en-IN")}/year`;

    return `₹${s.toLocaleString("en-IN")}/month • ${yearlyFormatted}`;
  };

  const fmtDate = (d) => {
    if (!d) return null;
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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 hover:border-blue-300 hover:shadow-md transition-all group">
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.companyName}
              className="w-full h-full object-contain p-1"
            />
          ) : (
            <span className="text-lg font-bold text-gray-400">
              {(job.companyName || "?")[0].toUpperCase()}
            </span>
          )}
        </div>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                  {job.title}
                </h3>
                <BadgeCheck size={16} className="text-blue-500 shrink-0 " />

                {job.jobType && <JTypeBadge value={job.jobType} />}
              </div>

              <div className="mt-1 space-y-1">
                {/* Row 1 */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  {job.companyName && (
                    <span className="flex items-center gap-1">
                      <Building2 size={11} /> {job.companyName}
                    </span>
                  )}

                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {job.location}
                    </span>
                  )}

                  {job.workMode && (
                    <span className="flex items-center gap-1">
                      <Monitor size={11} /> {job.workMode.replace(/_/g, " ")}
                    </span>
                  )}

                  {job.experienceRequired && (
                    <span className="flex items-center gap-1">
                      <Briefcase size={11} /> {job.experienceRequired}
                    </span>
                  )}
                </div>

                {/* Row 2 */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  {job.salary && (
                    <span className="flex items-center gap-1">
                      <IndianRupee size={10} /> {fmtSalary(job.salary)}
                    </span>
                  )}

                  {job.lastDateToApply && (
                    <span className="flex items-center gap-1 text-gray-500">
                      <CalendarDays size={11} /> Apply by{" "}
                      {fmtDate(job.lastDateToApply)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Time + bookmark */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                {timeAgo(job.createdAt || job.postedOn)}
              </span>
              <button
                onClick={() => onSave(job.id)}
                className={`p-1.5 rounded-lg transition-all ${saved ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
              >
                {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              </button>
            </div>
          </div>

          {/* Skills */}
          {shown.length > 0 && (
            <div className="flex items-center flex-wrap gap-1.5 mt-3">
              {shown.map((s, i) => (
                <SkillChip key={i} name={s} />
              ))}
              {extra > 0 && (
                <span className="text-xs text-blue-600 font-semibold">
                  +{extra} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Match ring + apply (sm+) */}
        <div className="hidden sm:flex flex-col items-center gap-2.5 shrink-0">
          <MatchRing pct={matchPct} />
          <button
            onClick={() => onApply(job)}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm shadow-blue-200 whitespace-nowrap"
          >
            Apply Now
          </button>
        </div>
      </div>

      {/* Mobile bar */}
      <div className="sm:hidden flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <span className="text-sm font-bold text-blue-600">
          {matchPct}% Match
        </span>
        <button
          onClick={() => onApply(job)}
          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const EXP_LEVELS = ["Fresher", "1 - 3 years", "3 - 5 years", "5+ years"];

// Mock applications — replace when backend application endpoint is ready
const MOCK_APPLICATIONS = [
  {
    title: "Senior Backend Developer",
    company: "Google",
    status: "Applied",
    time: "2h ago",
  },
  {
    title: "Full Stack Developer",
    company: "Amazon",
    status: "Interview",
    time: "1d ago",
  },
  {
    title: "Software Engineer",
    company: "Microsoft",
    status: "Screening",
    time: "2d ago",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function JobListingPage() {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();
  const firstName = (user.username || user.name || "User").split(" ")[0];

  // ── Backend data ───────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]); // GET /jobs
  const [matchMap, setMatchMap] = useState({}); // GET /jobmatch/match → { jobId: pct }
  const [allSkills, setAllSkills] = useState([]); // GET /skills
  const [jobTypes, setJobTypes] = useState([]); // GET /enums/job-types
  const [workModes, setWorkModes] = useState([]); // GET /enums/work-modes (not used in filter yet)

  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState("");
  const [matchLoading, setMatchLoading] = useState(false);
  const [skillsLoading, setSkillsLoading] = useState(true);

  // ── Filter / search ────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [jobTypeSearch, setJobTypeSearch] = useState("");
  const [checkedTypes, setCheckedTypes] = useState([]);
  const [checkedSkills, setCheckedSkills] = useState([]);
  const [checkedExp, setCheckedExp] = useState([]);
  const [salaryRange, setSalaryRange] = useState("Any");
  const [skillSearch, setSkillSearch] = useState("");
  const [showMoreSkills, setShowMoreSkills] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [sortBy, setSortBy] = useState("Most Relevant");
  const [viewMode, setViewMode] = useState("list");
  const [page, setPage] = useState(1);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const ROWS = viewMode === "grid" ? 6 : 5;

  // ── 1. GET /jobs ──────────────────────────────────────────────────────────
  const fetchJobs = useCallback(() => {
    setJobsLoading(true);
    setJobsError("");
    API.get("/jobs")
      .then((r) => setJobs(r.data || []))
      .catch(() => setJobsError("Failed to load jobs. Please try again."))
      .finally(() => setJobsLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // ── 2. GET /jobmatch/match ────────────────────────────────────────────────
  //    Response: [{jobId, matchPercentage}] or {jobId: pct}
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    setMatchLoading(true);
    API.get("/jobmatch/match")
      .then((r) => {
        const data = r.data || [];
        const map = {};
        if (Array.isArray(data)) {
          data.forEach((item) => {
            const id = item.jobId ?? item.id ?? item.job?.id;
            const pct =
              item.matchPercentage ?? item.matchScore ?? item.score ?? 0;
            if (id != null) map[String(id)] = Math.round(pct);
          });
        } else {
          Object.entries(data).forEach(([k, v]) => {
            map[k] = Math.round(Number(v));
          });
        }
        setMatchMap(map);
      })
      .catch(() => {}) // non-fatal
      .finally(() => setMatchLoading(false));
  }, []);

  // ── 3. GET /skills ─────────────────────────────────────────────────────────
  useEffect(() => {
    API.get("/skills")
      .then((r) => {
        const names = (r.data || [])
          .map((s) =>
            typeof s === "string" ? s : s?.name || s?.skillName || "",
          )
          .filter(Boolean);
        setAllSkills(names);
      })
      .catch(() => {})
      .finally(() => setSkillsLoading(false));
  }, []);

  // ── 4. GET /enums ──────────────────────────────────────────────────────────
  useEffect(() => {
    API.get("/enums/job-types")
      .then((r) => setJobTypes(r.data || []))
      .catch(() => {});
    API.get("/enums/work-modes")
      .then((r) => setWorkModes(r.data || []))
      .catch(() => {});
  }, []);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = jobs.filter((j) => {
    const kw = keyword.toLowerCase();
    const lc = location.toLowerCase();
    return (
      (!kw ||
        j.title?.toLowerCase().includes(kw) ||
        j.companyName?.toLowerCase().includes(kw)) &&
      (!lc || j.location?.toLowerCase().includes(lc)) &&
      (!jobTypeSearch ||
        j.jobType?.toUpperCase() === jobTypeSearch.toUpperCase()) &&
      (checkedTypes.length === 0 ||
        checkedTypes.some(
          (t) => j.jobType?.toUpperCase() === t.toUpperCase(),
        )) &&
      (checkedSkills.length === 0 ||
        checkedSkills.some((sk) =>
          getSkillNames(j).some((s) =>
            s.toLowerCase().includes(sk.toLowerCase()),
          ),
        ))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Newest First")
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === "Highest Salary") return (b.salary ?? 0) - (a.salary ?? 0);
    // "Most Relevant" + "Best Match" → sort by match %
    return (matchMap[String(b.id)] ?? 0) - (matchMap[String(a.id)] ?? 0);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ROWS));
  const safeP = Math.min(page, totalPages);
  const paginated = sorted.slice((safeP - 1) * ROWS, safeP * ROWS);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safeP) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && arr[i - 1] !== p - 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  const toggleType = (t) =>
    setCheckedTypes((p) =>
      p.includes(t) ? p.filter((x) => x !== t) : [...p, t],
    );
  const toggleSkill = (s) =>
    setCheckedSkills((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
    );
  const toggleSave = (id) =>
    setSavedJobs((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const handleApply = (job) => navigate(`/jobs/${job.id}`);
  const clearAll = () => {
    setCheckedTypes([]);
    setCheckedSkills([]);
    setCheckedExp([]);
    setSalaryRange("Any");
    setSkillSearch("");
  };

  const getMatch = (job) =>
    matchMap[String(job.id)] ?? job.matchPercentage ?? 0;

  const displayedSkills = (
    showMoreSkills ? allSkills : allSkills.slice(0, 6)
  ).filter((s) => s.toLowerCase().includes(skillSearch.toLowerCase()));

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const SidebarContent = (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-blue-600" /> Filters
        </h3>
        <button
          onClick={clearAll}
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Job Type — from GET /enums/job-types */}
      <div>
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">
          Job Type
        </p>
        <div className="space-y-2">
          <FilterCheckbox
            label="All Types"
            checked={checkedTypes.length === 0}
            onChange={() => setCheckedTypes([])}
          />
          {(jobTypes.length > 0
            ? jobTypes
            : ["Full-time", "Part-time", "Contract", "Internship", "Remote"]
          ).map((t) => (
            <FilterCheckbox
              key={t}
              label={t.replace(/_/g, " ")}
              checked={checkedTypes.includes(t)}
              onChange={() => toggleType(t)}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Skills — from GET /skills */}
      <div>
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">
          Skills
        </p>
        <div className="relative mb-2.5">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
            placeholder="Search skills"
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all"
          />
        </div>
        {skillsLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
            <Loader2 size={12} className="animate-spin" /> Loading…
          </div>
        ) : (
          <div className="space-y-2">
            {displayedSkills.map((s) => (
              <FilterCheckbox
                key={s}
                label={s}
                checked={checkedSkills.includes(s)}
                onChange={() => toggleSkill(s)}
              />
            ))}
          </div>
        )}
        {allSkills.length > 6 && (
          <button
            onClick={() => setShowMoreSkills(!showMoreSkills)}
            className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-2 hover:underline"
          >
            {showMoreSkills
              ? "Show less"
              : `Show more (${allSkills.length - 6})`}
            <ChevronDown
              size={12}
              className={`transition-transform ${showMoreSkills ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      <div className="border-t border-gray-100" />

      {/* Experience */}
      <div>
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">
          Experience Level
        </p>
        <div className="space-y-2">
          {EXP_LEVELS.map((e) => (
            <FilterCheckbox
              key={e}
              label={e}
              checked={checkedExp.includes(e)}
              onChange={() =>
                setCheckedExp((p) =>
                  p.includes(e) ? p.filter((x) => x !== e) : [...p, e],
                )
              }
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Salary */}
      <div>
        <p className="text-xs font-bold text-gray-800 uppercase tracking-wide mb-2.5">
          Salary Range
        </p>
        <SalaryDropdown value={salaryRange} onChange={setSalaryRange} />
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 overflow-visible">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute top-6 right-32 w-24 h-24 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 left-1/3 w-36 h-36 bg-white/5 rounded-full" />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 pt-8 pb-0">
          <div className="max-w-2xl mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Find the right job
              <br />
              with <span className="text-yellow-400">smart matching</span>
            </h1>
            <p className="text-blue-100 text-sm sm:text-base mt-2">
              Our AI matches your skills with the best opportunities.
            </p>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-2xl rounded-b-none shadow-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center relative z-50 overflow-visible">
            <div className="flex-1 relative min-w-0">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="e.g. Software Engineer"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex-1 relative min-w-0">
              <MapPin
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                placeholder="Select location"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="relative w-[180px] shrink-0">
              <Briefcase
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />

              <JobTypeDropdownUI
                value={jobTypeSearch}
                onChange={(val) => {
                  setJobTypeSearch(val);
                  setPage(1);
                }}
                options={
                  jobTypes.length > 0
                    ? jobTypes
                    : ["Full-time", "Part-time", "Contract", "Internship"]
                }
              />
            </div>
            <button
              onClick={() => setPage(1)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.97] transition-all shadow-sm shadow-blue-300 whitespace-nowrap"
            >
              <Search size={15} /> Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5">
        <div className="flex gap-5 items-start">
          {/* Left sidebar */}
          <aside className="hidden lg:block w-52 xl:w-56 shrink-0 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sticky top-20">
            {SidebarContent}
          </aside>

          {/* Centre */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-all text-gray-700 font-medium"
                >
                  <SlidersHorizontal size={14} /> Filters
                </button>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">
                    {sorted.length.toLocaleString()}
                  </span>{" "}
                  jobs found
                  {matchLoading && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-400">
                      <Loader2 size={11} className="animate-spin" /> Calculating
                      match…
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchJobs}
                  title="Refresh"
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <RefreshCw size={14} />
                </button>
                <span className="text-xs text-gray-500 hidden sm:block">
                  Sort by:
                </span>
                <SortDropdown value={sortBy} onChange={setSortBy} />
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition-colors ${viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition-colors ${viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Job cards */}
            {jobsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <p className="text-sm text-gray-500">
                  Finding the best jobs for you…
                </p>
              </div>
            ) : jobsError ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3.5 text-sm max-w-md w-full">
                  <AlertCircle size={15} className="shrink-0" /> {jobsError}
                </div>
                <button
                  onClick={fetchJobs}
                  className="text-sm text-blue-600 hover:underline font-medium flex items-center gap-1"
                >
                  <RefreshCw size={13} /> Try again
                </button>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Search size={36} className="text-gray-300" />
                <p className="text-gray-500 text-sm">
                  No jobs match your search. Try adjusting the filters.
                </p>
                <button
                  onClick={clearAll}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                    : "flex flex-col gap-3"
                }
              >
                {paginated.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    matchPct={getMatch(job)}
                    saved={savedJobs.has(job.id)}
                    onSave={toggleSave}
                    onApply={handleApply}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!jobsLoading && !jobsError && sorted.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safeP === 1}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                {pageNums.map((p, i) =>
                  p === "…" ? (
                    <span key={`e${i}`} className="px-1 text-gray-400 text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${safeP === p ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeP === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="hidden xl:flex flex-col gap-4 w-64 shrink-0">
            {/* Profile */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-base font-bold shrink-0">
                  {firstName[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Hi, {firstName} 👋
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Profile completeness
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: "80%" }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700">80%</span>
              </div>
              <button
                onClick={() => navigate("/profile")}
                className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
              >
                Improve your profile <ArrowRight size={11} />
              </button>
            </div>

            {/* Quick links */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 flex flex-col gap-2">
              <QuickLinkCard
                icon={Star}
                color={{ bg: "#FFF7ED", icon: "#F97316" }}
                title="Skill Management"
                subtitle="Add, remove or update your skills"
                onClick={() => navigate("/skill-management")}
              />
              <QuickLinkCard
                icon={TrendingUp}
                color={{ bg: "#F0FDF4", icon: "#16A34A" }}
                title="Skill Gap & Recommendations"
                subtitle="Find missing skills and get suggestions"
                onClick={() => navigate("/skill-gap")}
              />
              <QuickLinkCard
                icon={Bookmark}
                color={{ bg: "#EFF6FF", icon: "#2563EB" }}
                title="Saved / Applied Jobs"
                subtitle="Track your saved and applied jobs"
                onClick={() => navigate("/my-applications")}
              />
            </div>

            {/* My Applications */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-900">
                  My Applications
                </p>
                <button
                  onClick={() => navigate("/my-applications")}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  View all
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {MOCK_APPLICATIONS.map((app, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {app.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {app.company}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      <AppStatusBadge status={app.status} />
                      <span className="text-[10px] text-gray-400">
                        {app.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-900">
                  JobGenius Insights
                </p>
                <span className="text-xs text-gray-400">This week</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    icon: PhoneCall,
                    value: "12",
                    label: "Applications",
                    color: "#3B82F6",
                  },
                  {
                    icon: Eye,
                    value: "156",
                    label: "Profile Views",
                    color: "#8B5CF6",
                  },
                  {
                    icon: TrendingUp,
                    value: "8",
                    label: "Interview Calls",
                    color: "#10B981",
                  },
                ].map(({ icon: Icon, value, label, color }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50">
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      {value}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-tight text-center">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative ml-auto w-72 max-w-full bg-white h-full overflow-y-auto shadow-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
            {SidebarContent}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="w-full mt-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
