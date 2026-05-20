"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import {
  adminLogin,
  adminGetProfile,
  adminSaveProfile,
  adminGetProjects,
  adminCreateProject,
  adminUpdateProject,
  adminDeleteProject,
  adminGetSkills,
  adminCreateSkill,
  adminUpdateSkill,
  adminDeleteSkill,
  adminGetEducation,
  adminCreateEducation,
  adminUpdateEducation,
  adminDeleteEducation,
  adminGetContacts,
  adminDeleteContact,
  adminGetSession,
  adminGetCvMetadata,
  adminUploadCv,
  adminDeleteCv,
  adminGetCvContent,
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  adminGetAuditLogs,
  adminGetAuditLogStats,
  adminExportAuditLogs,
} from "@/services/adminApi";

const TABS = ["Profile", "Projects", "Skills", "Education", "Contacts", "Logs"];

function formatStrengths(strengthsText) {
  return strengthsText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapTechStackToText(list) {
  if (!Array.isArray(list)) return "";
  return list.join(", ");
}

function toDateLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read the selected image."));
    reader.readAsDataURL(file);
  });
}

function getEditableCvFileName(fileName) {
  const safe = String(fileName || "cv").trim() || "cv";
  const base = safe.replace(/\.[^.]+$/, "");
  return `${base}.txt`;
}

async function compressImageFileToDataUrl(file) {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Failed to load the selected image."));
      element.src = sourceUrl;
    });

    const maxDimension = 900;
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available in this browser.");

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "" });

  const [profileForm, setProfileForm] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [profileImageFileName, setProfileImageFileName] = useState("");
  const [cvMeta, setCvMeta] = useState(null);
  const [cvEditing, setCvEditing] = useState(false);
  const [cvEditContent, setCvEditContent] = useState("");
  const [cvPreviewing, setCvPreviewing] = useState(false);
  const [cvPreviewContent, setCvPreviewContent] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [selectedCvFile, setSelectedCvFile] = useState(null);
  const [sessionTimeoutMs, setSessionTimeoutMs] = useState(300000);
  const [sessionRemainingMs, setSessionRemainingMs] = useState(300000);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsTotal, setAuditLogsTotal] = useState(0);
  const [auditLogsPage, setAuditLogsPage] = useState(0);
  const [auditLogsStats, setAuditLogsStats] = useState(null);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  useEffect(() => {
    const saved = getAdminToken();
    if (saved) setToken(saved);
  }, []);

  const formatCountdown = useCallback((ms) => {
    const safeMs = Math.max(0, ms);
    const totalSeconds = Math.ceil(safeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, []);

  const resetSessionClock = useCallback((timeoutMs) => {
    const safeTimeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 300000;
    setSessionTimeoutMs(safeTimeout);
    setSessionRemainingMs(safeTimeout);
  }, []);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    async function loadSessionInfo() {
      try {
        const session = await adminGetSession(token);
        if (!isMounted) return;
        resetSessionClock(Number(session?.timeoutMs) || 300000);
      } catch (err) {
        if (err?.status === 401) {
          clearAdminToken();
          setToken(null);
          setStatus({ type: "error", text: "Session expired. Please log in again." });
        }
      }
    }

    void loadSessionInfo();

    return () => {
      isMounted = false;
    };
  }, [resetSessionClock, token]);

  useEffect(() => {
    if (!token) return;

    const handleActivity = () => {
      setSessionRemainingMs(sessionTimeoutMs);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove", "focus"];
    events.forEach((eventName) => window.addEventListener(eventName, handleActivity));

    const timer = window.setInterval(() => {
      setSessionRemainingMs((prev) => {
        const next = Math.max(0, prev - 1000);
        if (next === 0) {
          clearAdminToken();
          setToken(null);
          setStatus({
            type: "error",
            text: "Your session expired due to inactivity. Please sign in again.",
          });
        }
        return next;
      });
    }, 1000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      window.clearInterval(timer);
    };
  }, [sessionTimeoutMs, token]);

  const refreshAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const [profile, projectRows, skillRows, educationRows, contactRows] = await Promise.all([
        adminGetProfile(token),
        adminGetProjects(token),
        adminGetSkills(token),
        adminGetEducation(token),
        adminGetContacts(token),
      ]);

      setProfileForm(
        profile
          ? {
              ...profile,
              strengthsText: Array.isArray(profile.strengths) ? profile.strengths.join("\n") : "",
            }
          : {
              name: "",
              title: "",
              summary: "",
              email: "",
              phone: "",
              github: "",
              linkedin: "",
              profileImageUrl: "",
              careerObjective: "",
              strengthsText: "",
            }
      );
          setProfileImageFileName("");

      setProjects(
        (projectRows || []).map((p) => ({
          ...p,
          techStackText: mapTechStackToText(p.techStack),
        }))
      );
      setSkills(skillRows || []);
      setEducation(educationRows || []);
      setContacts(contactRows || []);
      try {
        const meta = await adminGetCvMetadata(token);
        setCvMeta(meta || null);
      } catch (e) {
        setCvMeta(null);
      }
      resetSessionClock(sessionTimeoutMs);
    } catch (err) {
      if (err?.status === 401) {
        clearAdminToken();
        setToken(null);
        setStatus({ type: "error", text: "Session expired. Please log in again." });
        return;
      }
      setStatus({ type: "error", text: err?.message || "Failed to load admin data." });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void refreshAll();
  }, [refreshAll, token]);

  useEffect(() => {
    if (!token || activeTab !== "Logs") return;
    void loadAuditLogs(0);
  }, [token, activeTab]);

  async function handleLogin(e) {
    e.preventDefault();
    setStatus({ type: "idle", text: "" });

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!email || !password) {
      setStatus({ type: "error", text: "Email and password are required." });
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      setAdminToken(res.token);
      setToken(res.token);
      resetSessionClock(300000);
      setStatus({ type: "success", text: "Signed in successfully." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Login failed." });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    clearAdminToken();
    setToken(null);
    setSessionRemainingMs(sessionTimeoutMs);
    setStatus({ type: "success", text: "Logged out successfully. Returning to your portfolio." });
    window.setTimeout(() => router.push("/#home"), 700);
  }

  async function handleProfileSave() {
    if (!profileForm) return;
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const payload = {
        ...profileForm,
        strengths: formatStrengths(profileForm.strengthsText || ""),
      };
      delete payload.strengthsText;
      const saved = await adminSaveProfile(payload, token);
      setProfileForm({
        ...saved,
        strengthsText: Array.isArray(saved.strengths) ? saved.strengths.join("\n") : "",
      });
      setProfileImageFileName("");
      setStatus({ type: "success", text: "Profile updated." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file || !profileForm) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", text: "Please choose an image file." });
      event.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setStatus({ type: "error", text: "Image must be 8 MB or smaller." });
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setProfileForm((prev) => (prev ? { ...prev, profileImageUrl: dataUrl } : prev));
      setProfileImageFileName(file.name);
      setStatus({ type: "success", text: "Image ready to save." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to load image." });
    } finally {
      event.target.value = "";
    }
  }

  async function handleCvFileSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!token) return setStatus({ type: "error", text: "Not signed in." });

    if (file.size > 12 * 1024 * 1024) {
      setStatus({ type: "error", text: "CV must be 12 MB or smaller." });
      event.target.value = "";
      return;
    }

    // Store selected file and wait for explicit upload
    setSelectedCvFile(file);
    setCvFileName(file.name);
    setStatus({ type: "success", text: "CV ready to upload. Click 'Upload CV' to save." });
    event.target.value = "";
  }

  async function handleCvUpload() {
    if (!selectedCvFile) return setStatus({ type: "error", text: "No file selected." });
    if (!token) return setStatus({ type: "error", text: "Not signed in." });
    setLoading(true);
    try {
      const dataUrl = await fileToDataUrl(selectedCvFile);
      const payload = { filename: selectedCvFile.name, contentBase64: dataUrl, mimeType: selectedCvFile.type };
      const saved = await adminUploadCv(payload, token);
      setCvMeta(saved || null);
      setSelectedCvFile(null);
      setCvFileName("");
      setStatus({ type: "success", text: "CV uploaded." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to upload CV." });
    } finally {
      setLoading(false);
    }
  }

  async function handleCvDelete() {
    if (!token) return setStatus({ type: "error", text: "Not signed in." });
    const confirmed = window.confirm("Delete current CV? This cannot be undone.");
    if (!confirmed) return;
    setLoading(true);
    try {
      await adminDeleteCv(token);
      setCvMeta(null);
      setStatus({ type: "success", text: "CV deleted." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to delete CV." });
    } finally {
      setLoading(false);
    }
  }

  async function handleCvEditOpen() {
    if (!token) return setStatus({ type: "error", text: "Not signed in." });
    setLoading(true);
    try {
      const data = await adminGetCvContent(token);
      setCvEditContent(data.content || "");
      setCvEditing(true);
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to open CV for editing." });
    } finally {
      setLoading(false);
    }
  }

  async function handleCvPreviewOpen() {
    if (!token) return setStatus({ type: "error", text: "Not signed in." });
    setLoading(true);
    try {
      const data = await adminGetCvContent(token);
      setCvPreviewContent(data.content || "");
      setCvPreviewing(true);
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to open CV preview." });
    } finally {
      setLoading(false);
    }
  }

  function textToDataUrl(text, filename) {
    const b64 = typeof window !== "undefined" ? window.btoa(unescape(encodeURIComponent(text))) : Buffer.from(text, 'utf8').toString('base64');
    return `data:text/plain;base64,${b64}`;
  }

  async function handleCvSaveEdit() {
    if (!token) return setStatus({ type: "error", text: "Not signed in." });
    setLoading(true);
    try {
      const filename = getEditableCvFileName(cvMeta?.originalName || cvFileName || `cv-${Date.now()}.pdf`).replace(/\.txt$/, ".pdf");
      const saved = await adminUploadCv(
        {
          filename,
          contentText: cvEditContent,
          outputFormat: "pdf",
          mimeType: "application/pdf",
        },
        token
      );
      setCvMeta(saved || null);
      setCvEditing(false);
      setStatus({ type: "success", text: "CV saved as PDF." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to save CV." });
    } finally {
      setLoading(false);
    }
  }

  async function handleProjectSave(project) {
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const payload = {
        title: project.title,
        description: project.description,
        techStack: project.techStackText,
        githubLink: project.githubLink,
        liveDemo: project.liveDemo,
      };
      const saved = await adminUpdateProject(project.id, payload, token);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === saved.id
            ? { ...saved, techStackText: mapTechStackToText(saved.techStack) }
            : p
        )
      );
      setStatus({ type: "success", text: "Project saved." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to save project." });
    } finally {
      setLoading(false);
    }
  }

  async function handleProjectCreate() {
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const payload = {
        title: "New Project",
        description: "Describe the project.",
        techStack: "",
        githubLink: "",
        liveDemo: "",
      };
      const created = await adminCreateProject(payload, token);
      setProjects((prev) => [
        ...prev,
        { ...created, techStackText: mapTechStackToText(created.techStack) },
      ]);
      setStatus({ type: "success", text: "Project created." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to create project." });
    } finally {
      setLoading(false);
    }
  }

  async function handleProjectDelete(projectId) {
    if (!projectId) return;
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      await adminDeleteProject(projectId, token);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      setStatus({ type: "success", text: "Project deleted." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to delete project." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSkillSave(skill) {
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const payload = { category: skill.category, name: skill.name };
      const saved = await adminUpdateSkill(skill.id, payload, token);
      setSkills((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
      setStatus({ type: "success", text: "Skill saved." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to save skill." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSkillCreate() {
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const created = await adminCreateSkill({ category: "New Category", name: "New Skill" }, token);
      setSkills((prev) => [...prev, created]);
      setStatus({ type: "success", text: "Skill created." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to create skill." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSkillDelete(skillId) {
    if (!skillId) return;
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      await adminDeleteSkill(skillId, token);
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
      setStatus({ type: "success", text: "Skill deleted." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to delete skill." });
    } finally {
      setLoading(false);
    }
  }

  async function handleEducationSave(item) {
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const payload = {
        institution: item.institution,
        program: item.program,
        description: item.description,
        statusTag: item.statusTag,
        sortOrder: item.sortOrder,
      };
      const saved = await adminUpdateEducation(item.id, payload, token);
      setEducation((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
      setStatus({ type: "success", text: "Education saved." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to save education." });
    } finally {
      setLoading(false);
    }
  }

  async function handleEducationCreate() {
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      const created = await adminCreateEducation(
        {
          institution: "New Institution",
          program: "Program or certificate",
          description: "Description",
          statusTag: "",
          sortOrder: education.length + 1,
        },
        token
      );
      setEducation((prev) => [...prev, created]);
      setStatus({ type: "success", text: "Education created." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to create education." });
    } finally {
      setLoading(false);
    }
  }

  async function handleEducationDelete(itemId) {
    if (!itemId) return;
    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      await adminDeleteEducation(itemId, token);
      setEducation((prev) => prev.filter((e) => e.id !== itemId));
      setStatus({ type: "success", text: "Education deleted." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to delete education." });
    } finally {
      setLoading(false);
    }
  }

  async function handleContactDelete(contactId) {
    if (!contactId) return;

    const confirmed = window.confirm("Delete this contact message? This cannot be undone.");
    if (!confirmed) return;

    setLoading(true);
    setStatus({ type: "idle", text: "" });
    try {
      await adminDeleteContact(contactId, token);
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      setStatus({ type: "success", text: "Message deleted." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to delete message." });
    } finally {
      setLoading(false);
    }
  }

  async function loadAuditLogs(page = 0) {
    if (!token) return;
    setAuditLogsLoading(true);
    try {
      const data = await adminGetAuditLogs(token, { skip: page * 50, take: 50 });
      setAuditLogs(data.logs || []);
      setAuditLogsTotal(data.pagination?.total || 0);
      setAuditLogsPage(page);

      const stats = await adminGetAuditLogStats(token);
      setAuditLogsStats(stats);
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to load audit logs." });
    } finally {
      setAuditLogsLoading(false);
    }
  }

  async function handleAuditLogsExport() {
    if (!token) return;
    try {
      await adminExportAuditLogs(token);
      setStatus({ type: "success", text: "Audit logs exported successfully." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to export audit logs." });
    }
  }

  const showAuth = !token;
  const showSessionWarning = !showAuth && sessionRemainingMs <= 60000;

  const statusClass = useMemo(() => {
    if (status.type === "success") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
    if (status.type === "error") return "border-rose-400/30 bg-rose-400/10 text-rose-100";
    return "border-white/10 bg-white/5 text-slate-200";
  }, [status.type]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Container className="py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">Admin</p>
              <h1 className="mt-2 text-3xl font-extrabold text-white">Portfolio Control Room</h1>
            </div>
            {!showAuth && (
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshAll}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setActiveTab("Logs")}
                  className="rounded-xl border border-white/10 bg-indigo-600/10 px-4 py-2 text-sm font-semibold text-indigo-200 hover:bg-indigo-600/20"
                >
                  Logs
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className={`rounded-2xl border px-4 py-3 text-sm ${statusClass}`}>
            {status.text || (showAuth ? "Enter your admin credentials to continue." : "Ready")}
          </div>

          {showSessionWarning ? (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              Your session will end in {formatCountdown(sessionRemainingMs)} due to inactivity.
            </div>
          ) : null}

          {showAuth ? (
            <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-white/95">Admin Login</h2>
              <p className="mt-2 text-sm text-slate-300">Enter your admin credentials to continue.</p>
              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <label className="block text-sm text-slate-300">
                  Email
                  <input
                    name="email"
                    type="email"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                    placeholder="admin@example.com"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Password
                  <input
                    name="password"
                    type="password"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                    placeholder="••••••••"
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "border-indigo-400/50 bg-indigo-400/15 text-indigo-100"
                        : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "Profile" && profileForm ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-white/95">Profile</h2>
                  <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-start">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-slate-300">
                        Name
                        <input
                          value={profileForm.name}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        Title
                        <input
                          value={profileForm.title}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300 md:col-span-2">
                        Summary
                        <textarea
                          value={profileForm.summary}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, summary: e.target.value }))
                          }
                          rows={3}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        Email
                        <input
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        Phone
                        <input
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        GitHub
                        <input
                          value={profileForm.github}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, github: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300">
                        LinkedIn
                        <input
                          value={profileForm.linkedin}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, linkedin: e.target.value }))
                          }
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300 md:col-span-2">
                        Career Objective
                        <textarea
                          value={profileForm.careerObjective || ""}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, careerObjective: e.target.value }))
                          }
                          rows={2}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                      <label className="text-sm text-slate-300 md:col-span-2">
                        Strengths (one per line)
                        <textarea
                          value={profileForm.strengthsText}
                          onChange={(e) =>
                            setProfileForm((prev) => ({ ...prev, strengthsText: e.target.value }))
                          }
                          rows={4}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/30 px-4 py-2 text-sm text-white"
                        />
                      </label>
                    </div>

                    <aside className="mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-slate-950/25 p-5 shadow-soft xl:sticky xl:top-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            Profile image
                          </p>
                          <h3 className="mt-2 text-base font-semibold text-white/95">Upload from device</h3>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
                          Stored in DB
                        </div>
                      </div>

                      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-3">
                        <div className="relative aspect-square w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/40">
                          {profileForm.profileImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={profileForm.profileImageUrl}
                              alt="Profile preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-slate-400">
                              No image selected yet.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 space-y-3">
                        <label className="block text-sm text-slate-300">
                          Choose image from device
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="mt-2 block w-full rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                          />
                        </label>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                          <p className="font-semibold text-white/95">Selected file</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {profileImageFileName || "No file selected"}
                          </p>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                          <p className="font-semibold text-white/95">Curriculum Vitae (CV)</p>
                          <p className="mt-2 text-xs text-slate-400">Upload a PDF, DOCX, TXT or Markdown file for visitors to download.</p>

                          <div className="mt-3 flex items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.md"
                              onChange={handleCvFileSelect}
                              className="block rounded-xl border border-white/10 bg-slate-950/30 px-3 py-2 text-sm text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                            />
                            {selectedCvFile ? (
                              <div className="ml-3 flex items-center gap-2">
                                <span className="text-sm text-slate-200">{selectedCvFile.name}</span>
                                <button onClick={handleCvUpload} className="rounded-xl border border-white/10 bg-indigo-600/10 px-3 py-1 text-xs text-indigo-200 hover:bg-indigo-600/20">Upload CV</button>
                                <button onClick={() => { setSelectedCvFile(null); setCvFileName(""); setStatus({type:'idle', text:''}); }} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10">Cancel</button>
                              </div>
                            ) : null}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            {cvMeta?.url ? (
                              <button onClick={handleCvPreviewOpen} className="text-indigo-300 underline text-sm">
                                View current CV
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">No CV uploaded</span>
                            )}

                            {cvMeta ? (
                              <>
                                <button onClick={handleCvEditOpen} className="ml-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10">Edit</button>
                                <button onClick={handleCvDelete} className="ml-2 rounded-xl border border-white/10 bg-rose-600/10 px-3 py-1 text-xs text-rose-200 hover:bg-rose-600/20">Delete</button>
                              </>
                            ) : null}
                          </div>
                        </div>

                        <p className="text-xs leading-relaxed text-slate-400">
                          The chosen image is resized before saving so the profile update stays small.
                        </p>
                      </div>
                    </aside>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={handleProfileSave}
                      disabled={loading}
                      className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save profile"}
                    </button>
                  </div>
                </section>
              ) : null}

              {activeTab === "Projects" ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white/95">Projects</h2>
                    <button
                      onClick={handleProjectCreate}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                    >
                      Add project
                    </button>
                  </div>
                  <div className="mt-5 space-y-5">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm text-slate-300">
                            Title
                            <input
                              value={project.title}
                              onChange={(e) =>
                                setProjects((prev) =>
                                  prev.map((p) =>
                                    p.id === project.id ? { ...p, title: e.target.value } : p
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300">
                            Tech stack (comma separated)
                            <input
                              value={project.techStackText || ""}
                              onChange={(e) =>
                                setProjects((prev) =>
                                  prev.map((p) =>
                                    p.id === project.id
                                      ? { ...p, techStackText: e.target.value }
                                      : p
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300 md:col-span-2">
                            Description
                            <textarea
                              value={project.description}
                              onChange={(e) =>
                                setProjects((prev) =>
                                  prev.map((p) =>
                                    p.id === project.id
                                      ? { ...p, description: e.target.value }
                                      : p
                                  )
                                )
                              }
                              rows={3}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300">
                            GitHub URL
                            <input
                              value={project.githubLink || ""}
                              onChange={(e) =>
                                setProjects((prev) =>
                                  prev.map((p) =>
                                    p.id === project.id
                                      ? { ...p, githubLink: e.target.value }
                                      : p
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300">
                            Demo URL
                            <input
                              value={project.liveDemo || ""}
                              onChange={(e) =>
                                setProjects((prev) =>
                                  prev.map((p) =>
                                    p.id === project.id
                                      ? { ...p, liveDemo: e.target.value }
                                      : p
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => handleProjectSave(project)}
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleProjectDelete(project.id)}
                            disabled={loading}
                            className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeTab === "Skills" ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white/95">Skills</h2>
                    <button
                      onClick={handleSkillCreate}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                    >
                      Add skill
                    </button>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                      >
                        <label className="text-sm text-slate-300">
                          Category
                          <input
                            value={skill.category}
                            onChange={(e) =>
                              setSkills((prev) =>
                                prev.map((s) =>
                                  s.id === skill.id ? { ...s, category: e.target.value } : s
                                )
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                          />
                        </label>
                        <label className="mt-3 text-sm text-slate-300">
                          Skill
                          <input
                            value={skill.name}
                            onChange={(e) =>
                              setSkills((prev) =>
                                prev.map((s) =>
                                  s.id === skill.id ? { ...s, name: e.target.value } : s
                                )
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                          />
                        </label>
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => handleSkillSave(skill)}
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleSkillDelete(skill.id)}
                            disabled={loading}
                            className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeTab === "Education" ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-white/95">Education</h2>
                    <button
                      onClick={handleEducationCreate}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                    >
                      Add education
                    </button>
                  </div>
                  <div className="mt-5 space-y-5">
                    {education.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"
                      >
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="text-sm text-slate-300">
                            Institution
                            <input
                              value={item.institution}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((ed) =>
                                    ed.id === item.id
                                      ? { ...ed, institution: e.target.value }
                                      : ed
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300">
                            Program
                            <input
                              value={item.program}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((ed) =>
                                    ed.id === item.id ? { ...ed, program: e.target.value } : ed
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300 md:col-span-2">
                            Description
                            <textarea
                              value={item.description}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((ed) =>
                                    ed.id === item.id
                                      ? { ...ed, description: e.target.value }
                                      : ed
                                  )
                                )
                              }
                              rows={3}
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300">
                            Status tag
                            <input
                              value={item.statusTag || ""}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((ed) =>
                                    ed.id === item.id ? { ...ed, statusTag: e.target.value } : ed
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                          <label className="text-sm text-slate-300">
                            Sort order
                            <input
                              type="number"
                              value={item.sortOrder}
                              onChange={(e) =>
                                setEducation((prev) =>
                                  prev.map((ed) =>
                                    ed.id === item.id
                                      ? { ...ed, sortOrder: Number(e.target.value) }
                                      : ed
                                  )
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white"
                            />
                          </label>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            onClick={() => handleEducationSave(item)}
                            disabled={loading}
                            className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleEducationDelete(item.id)}
                            disabled={loading}
                            className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeTab === "Contacts" ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-white/95">Contact Messages</h2>
                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-3 py-2">Name</th>
                          <th className="px-3 py-2">Email</th>
                          <th className="px-3 py-2">Message</th>
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="border-t border-white/10">
                            <td className="px-3 py-2 text-slate-100">{contact.name}</td>
                            <td className="px-3 py-2 text-slate-300">{contact.email}</td>
                            <td className="px-3 py-2 text-slate-300">{contact.message}</td>
                            <td className="px-3 py-2 text-slate-400">
                              {toDateLabel(contact.createdAt)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => handleContactDelete(contact.id)}
                                disabled={loading}
                                className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              {activeTab === "Logs" ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h2 className="text-lg font-semibold text-white/95">Audit Logs</h2>
                      <p className="text-xs text-slate-400 mt-1">All admin actions are recorded in real-time. Read-only access.</p>
                    </div>
                    <button
                      onClick={handleAuditLogsExport}
                      disabled={auditLogsLoading}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10 disabled:opacity-50"
                    >
                      Export CSV
                    </button>
                  </div>

                  {auditLogsStats && (
                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Total Logs</p>
                        <p className="mt-2 text-2xl font-bold text-indigo-300">{auditLogsStats.totalLogs || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Action Types</p>
                        <div className="mt-2 space-y-1">
                          {auditLogsStats.actionBreakdown?.slice(0, 3).map((action) => (
                            <p key={action.action} className="text-xs text-slate-300">
                              {action.action}: <span className="font-semibold text-indigo-300">{action.count}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-400">Admins Active</p>
                        <p className="mt-2 text-2xl font-bold text-indigo-300">{auditLogsStats.adminBreakdown?.length || 0}</p>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-xs uppercase text-slate-400">
                        <tr>
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Admin Email</th>
                          <th className="px-3 py-2">Action</th>
                          <th className="px-3 py-2">Method</th>
                          <th className="px-3 py-2">Endpoint</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Timestamp</th>
                          <th className="px-3 py-2">IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogsLoading ? (
                          <tr>
                            <td colSpan="8" className="px-3 py-4 text-center text-slate-400">
                              Loading logs...
                            </td>
                          </tr>
                        ) : auditLogs.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-3 py-4 text-center text-slate-400">
                              No logs found
                            </td>
                          </tr>
                        ) : (
                          auditLogs.map((log) => (
                            <tr key={log.id} className="border-t border-white/10 hover:bg-white/5">
                              <td className="px-3 py-2 text-slate-300">{log.id}</td>
                              <td className="px-3 py-2 text-slate-300">{log.adminEmail}</td>
                              <td className="px-3 py-2">
                                <span className="inline-block rounded-full bg-indigo-500/20 px-2 py-1 text-xs font-semibold text-indigo-200">
                                  {log.action}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-slate-400">
                                <span className={`text-xs font-semibold ${
                                  log.method === 'GET' ? 'text-blue-300' :
                                  log.method === 'POST' ? 'text-green-300' :
                                  log.method === 'PUT' ? 'text-yellow-300' :
                                  log.method === 'DELETE' ? 'text-rose-300' :
                                  'text-slate-300'
                                }`}>
                                  {log.method}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-400 truncate max-w-xs">{log.endpoint}</td>
                              <td className="px-3 py-2">
                                <span className={`text-xs font-semibold ${
                                  log.statusCode >= 200 && log.statusCode < 300 ? 'text-emerald-300' :
                                  log.statusCode >= 400 && log.statusCode < 500 ? 'text-yellow-300' :
                                  log.statusCode >= 500 ? 'text-rose-300' :
                                  'text-slate-300'
                                }`}>
                                  {log.statusCode || 'N/A'}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-xs text-slate-400">{toDateLabel(log.timestamp)}</td>
                              <td className="px-3 py-2 text-xs text-slate-400">{log.ipAddress || 'N/A'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {auditLogsTotal > 0 && (
                    <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                      <p className="text-xs text-slate-400">
                        Showing logs 1-{Math.min(50, auditLogsTotal)} of {auditLogsTotal}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadAuditLogs(Math.max(0, auditLogsPage - 1))}
                          disabled={auditLogsPage === 0 || auditLogsLoading}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm disabled:opacity-50 hover:bg-white/10"
                        >
                          Previous
                        </button>
                        <span className="flex items-center px-3 py-1 text-sm text-slate-300">
                          Page {auditLogsPage + 1}
                        </span>
                        <button
                          onClick={() => loadAuditLogs(auditLogsPage + 1)}
                          disabled={(auditLogsPage + 1) * 50 >= auditLogsTotal || auditLogsLoading}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm disabled:opacity-50 hover:bg-white/10"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              ) : null}
            </>
          )}
        </div>
      </Container>
      {cvEditing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit CV</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setCvEditing(false)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">Cancel</button>
                <button onClick={handleCvSaveEdit} className="rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Save as PDF</button>
              </div>
            </div>
            <textarea value={cvEditContent} onChange={(e) => setCvEditContent(e.target.value)} rows={20} className="mt-4 w-full rounded-xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white" />
          </div>
        </div>
      ) : null}
      {cvPreviewing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-4xl rounded-2xl bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Current CV Preview</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setCvPreviewing(false)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 hover:bg-white/10">Close</button>
                <button onClick={() => { setCvPreviewing(false); setCvEditing(true); setCvEditContent(cvPreviewContent); }} className="rounded-xl border border-white/10 bg-indigo-600/10 px-3 py-1 text-xs text-indigo-200 hover:bg-indigo-600/20">Edit</button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">Preview opens the database-stored CV text. For DOCX files, the text is extracted automatically.</p>
            <pre className="mt-4 max-h-[70vh] overflow-auto rounded-xl border border-white/10 bg-slate-950/35 p-4 text-sm whitespace-pre-wrap text-slate-100">{cvPreviewContent || "No content available."}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
