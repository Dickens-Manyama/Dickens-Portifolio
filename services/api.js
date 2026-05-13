import mockData from "@/data/mockData.json";
import { apiGet, apiPost } from "@/lib/api";

const ENDPOINTS = {
  profile: "/profile",
  skills: "/skills",
  projects: "/projects",
  contact: "/contact",
};

function shouldUseRemote() {
  return Boolean(process.env.NEXT_PUBLIC_API_BASE_URL);
}

async function tryRemoteOrMock(remoteFn, mockValue) {
  if (!shouldUseRemote()) return mockValue;
  try {
    const data = await remoteFn();
    return data ?? mockValue;
  } catch (err) {
    // Keep portfolio usable even if backend isn't up yet.
    console.warn("[portfolio] Remote API failed, falling back to mock:", err?.message || err);
    return mockValue;
  }
}

export async function getProfile() {
  return tryRemoteOrMock(() => apiGet(ENDPOINTS.profile), mockData.profile);
}

export async function getSkills() {
  // Expected backend: GET /skills
  return tryRemoteOrMock(() => apiGet(ENDPOINTS.skills), mockData.skills);
}

export async function getProjects() {
  // Expected backend: GET /projects
  return tryRemoteOrMock(() => apiGet(ENDPOINTS.projects), mockData.projects);
}

export async function submitContact({ name, email, message }) {
  // Expected backend: POST /contact
  return tryRemoteOrMock(
    () => apiPost(ENDPOINTS.contact, { name, email, message }),
    { ok: true, message: "Thanks! Your message was received." }
  );
}

