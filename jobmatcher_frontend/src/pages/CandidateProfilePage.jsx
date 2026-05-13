// src/pages/CandidateProfilePage.jsx
// Navbar comes from CandidateLayout — do NOT add it here

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  MapPin,
  Pencil,
  Settings2,
  ChevronRight,
  Camera,
  FileText,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Trash2,
  Shield,
  Upload,
  TrendingUp,
  User,
  Loader2,
} from "lucide-react";
import API from "../services/api";

// ─────────────────────────────────────────────────────────────
// Donut chart — SVG
// ─────────────────────────────────────────────────────────────
function DonutChart({ percent }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg
        width="96"
        height="96"
        viewBox="0 0 96 96"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="9"
        />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="#2563EB"
          strokeWidth="9"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900">
        {percent}%
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Info Row
// ─────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="text-gray-400 mt-0.5 shrink-0" />
      <span className="w-24 text-sm text-gray-500 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 break-words min-w-0">
        {value || "—"}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
export default function CandidateProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const profileImageInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [resume, setResume] = useState(null);
  const [skills, setSkills] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});
  const [showPw, setShowPw] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const candidateId = storedUser?.id;
  const displayName =
    user?.username ||
    user?.name ||
    storedUser?.username ||
    storedUser?.name ||
    "User";

  // ── Fetch user profile, resume, skills, applications ──────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, skillsRes, appsRes] = await Promise.allSettled([
          API.get("/users/me"),
          API.get("/skills/user"),
          API.get("/applications/my"),
        ]);

        if (userRes.status === "fulfilled") setUser(userRes.value.data);
        if (skillsRes.status === "fulfilled")
          setSkills(skillsRes.value.data || []);
        if (appsRes.status === "fulfilled")
          setApplications(appsRes.value.data || []);

        // Resume fetch needs candidateId — derive it from API response if localStorage is stale
        const resolvedId =
          candidateId ||
          (userRes.status === "fulfilled" ? userRes.value.data?.id : null);

        if (resolvedId) {
          try {
            const resumeRes = await API.get(`/resume/${resolvedId}`);
            setResume(resumeRes.data);
          } catch {
            setResume(null);
          }
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchAll();
  }, []);

  // ── Toast helper ───────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Upload handler ─────────────────────────────────────────
  const handleFileUpload = async (file) => {
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.type)) {
      showToast("Only PDF, DOC, DOCX files are allowed.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be under 5MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadLoading(true);
    try {
      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResume(res.data);
      showToast("Resume uploaded successfully!");
    } catch (err) {
      showToast(err?.response?.data || "Upload failed. Try again.", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Delete handler ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm("Delete your resume?")) return;
    setDeleteLoading(true);
    try {
      await API.delete(`/resume/${candidateId}`);
      setResume(null);
      showToast("Resume deleted.");
    } catch (err) {
      showToast(err?.response?.data || "Delete failed.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Drop handler ───────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // ── Profile image upload ───────────────────────────────────
  const handleProfileImageUpload = async (file) => {
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      showToast("Only JPG, PNG, WEBP images are allowed.", "error");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/users/profile-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({
        ...prev,
        profileImageUrl: res.data.profileImageUrl,
      }));
      showToast("Profile photo updated!");
    } catch (err) {
      showToast(err?.response?.data || "Photo upload failed.", "error");
    }
  };

  // ── Change password ────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = "Required";
    if (!pwForm.newPassword || pwForm.newPassword.length < 4)
      errs.newPassword = "Min 4 characters";
    if (pwForm.newPassword !== pwForm.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }

    setPwLoading(true);
    try {
      await API.put("/users/change-password", {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwErrors({});
      setPwOpen(false);
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Failed to change password.",
        "error",
      );
    } finally {
      setPwLoading(false);
    }
  };

  // ── Edit profile ──────────────────────────────────────────
  const openEditModal = () => {
    setEditForm({
      username: user?.username || "",
      phone: user?.phone || "",
      location: user?.location || "",
      education: user?.education || "",
      aboutMe: user?.aboutMe || "",
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editForm.username?.trim()) errs.username = "Username is required";
    if (editForm.phone) {
      const cleanedPhone = editForm.phone.replace(/\D/g, "");

      if (cleanedPhone.length !== 10) {
        errs.phone = "Phone number must be exactly 10 digits";
      }
    }
    return errs;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errs = validateEditForm();
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }

    setEditLoading(true);
    try {
      const res = await API.put("/users/me", {
        username: editForm.username.trim(),
        phone: editForm.phone.trim(),
        location: editForm.location.trim(),
        education: editForm.education.trim(),
        aboutMe: editForm.aboutMe.trim(),
      });
      setUser(res.data);
      setEditOpen(false);
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(
        err?.response?.data?.message || err?.response?.data || "Update failed.",
        "error",
      );
    } finally {
      setEditLoading(false);
    }
  };

  const profileCompletion = user
    ? Math.round(
        ([
          !!user.username,
          !!user.profileImageUrl,
          !!user.phone,
          !!user.location,
          !!user.education,
          !!user.aboutMe,
          !!resume,
          skills.length > 0,
        ].filter(Boolean).length /
          8) *
          100,
      )
    : 0;

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1460px] mx-auto px-3 sm:px-4 lg:px-5 py-4 sm:py-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white transition-all
            ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-5">
        <button
          onClick={() => navigate("/find-jobs")}
          className="text-blue-600 hover:underline font-medium cursor-pointer"
        >
          Home
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-gray-500 font-medium">Profile</span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Hero card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-5">
              <div className="relative shrink-0">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-100 select-none"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold select-none">
                    {displayName[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                  title="Change profile photo"
                >
                  <Camera size={13} className="text-gray-600" />
                </button>
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) =>
                    handleProfileImageUpload(e.target.files?.[0])
                  }
                />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                  {displayName}
                </h1>
                <p className="text-blue-600 font-semibold text-sm mt-0.5">
                  Candidate
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-gray-500 text-sm">
                  <MapPin size={13} />
                  <span>India</span>
                </div>
              </div>

              <button
                onClick={openEditModal}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shrink-0 cursor-pointer"
              >
                <Pencil size={14} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Personal Info + Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Personal Information */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-900">
                    Personal Information
                  </h2>
                </div>
                <button
                  onClick={openEditModal}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                <InfoRow icon={Mail} label="Email" value={user?.email} />

                <InfoRow icon={Phone} label="Phone" value={user?.phone} />

                <InfoRow
                  icon={MapPin}
                  label="Location"
                  value={user?.location}
                />

                <InfoRow
                  icon={GraduationCap}
                  label="Education"
                  value={user?.education}
                />

                <InfoRow icon={User} label="About" value={user?.aboutMe} />
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings2 size={16} className="text-gray-500" />
                  <h2 className="text-sm font-bold text-gray-900">Skills</h2>
                </div>
                <button
                  onClick={() => navigate("/skill-management")}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  Manage Skills
                </button>
              </div>
              {skills.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  No skills added yet.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s.id || s.name}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100"
                    >
                      {s.name || s.skillName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resume */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900">Resume</h2>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-7 px-4 cursor-pointer transition-all
                    ${dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}`}
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  {uploadLoading ? (
                    <Loader2 size={20} className="text-blue-500 animate-spin" />
                  ) : (
                    <Upload size={20} className="text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-600 font-medium text-center">
                  Drag &amp; drop your resume here
                </p>
                <p className="text-xs text-gray-400">or</p>
                <button
                  disabled={uploadLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all disabled:opacity-60 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  {uploadLoading ? "Uploading..." : "Upload New Resume"}
                </button>
                <p className="text-[11px] text-gray-400 mt-1">
                  PDF, DOC, DOCX (Max. 5MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                />
              </div>

              {/* Current resume */}
              <div className="flex-1 flex flex-col gap-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Current Resume
                </p>

                {resume ? (
                  <>
                    {/* File card */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-red-600">
                          {resume.resumeFileName
                            ?.split(".")
                            .pop()
                            .toUpperCase() || "PDF"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 break-all">
                          {resume.resumeFileName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Uploaded on{" "}
                          {resume.resumeUploadedAt
                            ? new Date(
                                resume.resumeUploadedAt,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-green-100 text-green-700 text-[11px] font-semibold rounded-full">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <a
                        href={resume.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Eye size={13} /> Preview
                      </a>
                      <a
                        href={resume.resumeUrl}
                        download={resume.resumeFileName}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Download size={13} /> Download
                      </a>
                      <button
                        onClick={() => replaceInputRef.current?.click()}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <RefreshCw size={13} /> Replace
                      </button>
                      <button
                        onClick={handleDelete}
                        disabled={deleteLoading}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-all disabled:opacity-60 cursor-pointer"
                      >
                        {deleteLoading ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        Delete
                      </button>

                      {/* Hidden replace input */}
                      <input
                        ref={replaceInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files?.[0])}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                    <FileText size={28} className="text-gray-300" />
                    <p className="text-sm text-gray-400 font-medium">
                      No resume uploaded yet.
                    </p>
                    <p className="text-xs text-gray-400">
                      Upload your resume to apply for jobs.
                    </p>
                  </div>
                )}

                {/* Info banner */}
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
                  <Shield size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Your resume is visible to recruiters when you apply to jobs.{" "}
                    <span className="font-semibold">
                      Keep your resume updated for better match results.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-full xl:w-[320px] flex flex-col gap-5">
          {/* Profile Completion */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-4">
              Profile Completion
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <DonutChart percent={profileCompletion} />
              <div>
                <p className="text-base font-bold text-blue-600">
                  {profileCompletion >= 75 ? "Good Job!" : "Keep Going!"}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Complete your profile to increase job match accuracy.
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900">
                Activity Summary
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-3 p-3 rounded-xl min-w-0 bg-gray-50 hover:bg-blue-50 transition-colors group cursor-pointer"
                onClick={() => navigate("/my-applications")}
              >
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Briefcase size={16} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {applications.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Applied Jobs</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  View all <ChevronRight size={12} />
                </div>
              </div>

              <div
                className="flex items-center gap-3 p-3 rounded-xl min-w-0 bg-gray-50 hover:bg-green-50 transition-colors group cursor-pointer"
                onClick={() => navigate("/find-jobs")}
              >
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {skills.length}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Skills Added</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Find Jobs <ChevronRight size={12} />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl min-w-0 bg-gray-50 hover:bg-purple-50 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <User size={16} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {profileCompletion}%
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Profile Completion
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  Improve <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={16} className="text-gray-500" />
              <h2 className="text-sm font-bold text-gray-900">Security</h2>
            </div>
            <button
              onClick={() => {
                setPwForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setPwErrors({});
                setShowPw({ current: false, newPw: false, confirm: false });
                setPwOpen(true);
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={15} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-700">
                  Change Password
                </span>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-400 group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Profile Modal ── */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">
                Edit Profile
              </h2>
              <button
                onClick={() => setEditOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleEditSubmit}
              className="px-6 py-5 flex flex-col gap-4"
            >
              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, username: e.target.value }))
                  }
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all
                      ${editErrors.username ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  placeholder="Your full name"
                />
                {editErrors.username && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.username}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Phone
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  maxLength={11}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    if (value.length > 10) {
                      setEditErrors((p) => ({
                        ...p,
                        phone: "Phone number cannot exceed 10 digits",
                      }));
                    } else {
                      setEditErrors((p) => ({
                        ...p,
                        phone: "",
                      }));
                    }

                    setEditForm((p) => ({
                      ...p,
                      phone: value,
                    }));
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl outline-none transition-all
                      ${editErrors.phone ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  placeholder="+91 98765 43210"
                />
                {editErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">
                    {editErrors.phone}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="City, State"
                />
              </div>

              {/* Education */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Education
                </label>
                <input
                  type="text"
                  value={editForm.education}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, education: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="B.Tech in Computer Science"
                />
              </div>

              {/* About Me */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  About Me
                </label>
                <textarea
                  value={editForm.aboutMe}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, aboutMe: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                  placeholder="Tell recruiters a bit about yourself..."
                />
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {editLoading && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">
                  Change Password
                </h2>
              </div>
              <button
                onClick={() => setPwOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleChangePassword}
              className="px-6 py-5 flex flex-col gap-4"
            >
              {/* Current Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.current ? "text" : "password"}
                    value={pwForm.currentPassword}
                    onChange={(e) => {
                      setPwForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }));
                      setPwErrors((p) => ({ ...p, currentPassword: "" }));
                    }}
                    placeholder="Enter current password"
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-xl outline-none transition-all
                        ${pwErrors.currentPassword ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, current: !p.current }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw.current ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.currentPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.newPw ? "text" : "password"}
                    value={pwForm.newPassword}
                    onChange={(e) => {
                      setPwForm((p) => ({ ...p, newPassword: e.target.value }));
                      setPwErrors((p) => ({ ...p, newPassword: "" }));
                    }}
                    placeholder="Min. 4 characters"
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-xl outline-none transition-all
                        ${pwErrors.newPassword ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, newPw: !p.newPw }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw.newPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.newPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.confirmPassword}
                    onChange={(e) => {
                      setPwForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }));
                      setPwErrors((p) => ({ ...p, confirmPassword: "" }));
                    }}
                    placeholder="Re-enter new password"
                    className={`w-full px-3.5 py-2.5 pr-10 text-sm border rounded-xl outline-none transition-all
                        ${pwErrors.confirmPassword ? "border-red-400 focus:ring-2 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPw((p) => ({ ...p, confirm: !p.confirm }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPw.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {pwErrors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    {pwErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPwOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {pwLoading && <Loader2 size={14} className="animate-spin" />}
                  {pwLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
