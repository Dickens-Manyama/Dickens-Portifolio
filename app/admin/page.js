"use client";

import { useEffect, useMemo, useState } from "react";
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
  getAdminToken,
  setAdminToken,
  clearAdminToken,
} from "@/services/adminApi";

const TABS = ["Profile", "Projects", "Skills", "Education", "Contacts"];

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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "idle", text: "" });

  const [profileForm, setProfileForm] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const saved = getAdminToken();
    if (saved) setToken(saved);
  }, []);

  useEffect(() => {
    if (!token) return;
    void refreshAll();
  }, [token]);

  async function refreshAll() {
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
              careerObjective: "",
              strengthsText: "",
            }
      );

      setProjects(
        (projectRows || []).map((p) => ({
          ...p,
          techStackText: mapTechStackToText(p.techStack),
        }))
      );
      setSkills(skillRows || []);
      setEducation(educationRows || []);
      setContacts(contactRows || []);
    } catch (err) {
      if (err?.status === 401) {
        clearAdminToken();
        setToken(null);
        setAuthError("Session expired. Please log in again.");
        return;
      }
      setStatus({ type: "error", text: err?.message || "Failed to load admin data." });
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError("");
    setStatus({ type: "idle", text: "" });

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      setAdminToken(res.token);
      setToken(res.token);
    } catch (err) {
      setAuthError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    clearAdminToken();
    setToken(null);
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
      setStatus({ type: "success", text: "Profile updated." });
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Failed to update profile." });
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

  const showAuth = !token;

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
                  onClick={handleLogout}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

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
                {authError ? (
                  <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                    {authError}
                  </div>
                ) : null}
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

              <div className={`rounded-2xl border px-4 py-3 text-sm ${statusClass}`}>
                {status.text || "Ready"}
              </div>

              {activeTab === "Profile" && profileForm ? (
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-white/95">Profile</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
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
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}
