const DEFAULT_TIMEOUT_MS = 12000;
const TOKEN_KEY = "portfolio_admin_token";

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

async function adminFetch(path, { method = "GET", body, token } = {}) {
  const baseUrl = getBaseUrl();
  if (!baseUrl) throw new Error("Missing NEXT_PUBLIC_API_URL");

  const url = `${baseUrl.replace(/\/$/, "")}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      const message = data?.message || `Request failed: ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function adminLogin(email, password) {
  return adminFetch("/api/admin/auth/login", { method: "POST", body: { email, password } });
}

export async function adminGetProfile(token) {
  return adminFetch("/api/admin/profile", { token });
}

export async function adminSaveProfile(payload, token) {
  return adminFetch("/api/admin/profile", { method: "PUT", body: payload, token });
}

export async function adminGetProjects(token) {
  return adminFetch("/api/admin/projects", { token });
}

export async function adminCreateProject(payload, token) {
  return adminFetch("/api/admin/projects", { method: "POST", body: payload, token });
}

export async function adminUpdateProject(id, payload, token) {
  return adminFetch(`/api/admin/projects/${id}`, { method: "PUT", body: payload, token });
}

export async function adminDeleteProject(id, token) {
  return adminFetch(`/api/admin/projects/${id}`, { method: "DELETE", token });
}

export async function adminGetSkills(token) {
  return adminFetch("/api/admin/skills", { token });
}

export async function adminCreateSkill(payload, token) {
  return adminFetch("/api/admin/skills", { method: "POST", body: payload, token });
}

export async function adminUpdateSkill(id, payload, token) {
  return adminFetch(`/api/admin/skills/${id}`, { method: "PUT", body: payload, token });
}

export async function adminDeleteSkill(id, token) {
  return adminFetch(`/api/admin/skills/${id}`, { method: "DELETE", token });
}

export async function adminGetEducation(token) {
  return adminFetch("/api/admin/education", { token });
}

export async function adminCreateEducation(payload, token) {
  return adminFetch("/api/admin/education", { method: "POST", body: payload, token });
}

export async function adminUpdateEducation(id, payload, token) {
  return adminFetch(`/api/admin/education/${id}`, { method: "PUT", body: payload, token });
}

export async function adminDeleteEducation(id, token) {
  return adminFetch(`/api/admin/education/${id}`, { method: "DELETE", token });
}

export async function adminGetContacts(token) {
  return adminFetch("/api/admin/contacts", { token });
}
