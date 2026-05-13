import { apiGet, apiPost } from "@/lib/api";

const ENDPOINTS = {
  profile: "/profile",
  skills: "/skills",
  projects: "/projects",
  contact: "/contact",
};

export async function getProfile() {
  return apiGet(ENDPOINTS.profile);
}

export async function getSkills() {
  // Expected backend: GET /skills
  return apiGet(ENDPOINTS.skills);
}

export async function getProjects() {
  // Expected backend: GET /projects
  return apiGet(ENDPOINTS.projects);
}

export async function submitContact({ name, email, message }) {
  // Expected backend: POST /contact
  return apiPost(ENDPOINTS.contact, { name, email, message });
}

