import { apiGet, apiPost } from "@/lib/api";

const ENDPOINTS = {
  profile: "/api/profile",
  skills: "/api/skills",
  projects: "/api/projects",
  education: "/api/education",
  contact: "/api/contact",
};

export async function getProfile() {
  return apiGet(ENDPOINTS.profile);
}

export async function getSkills() {
  // Expected backend: GET /api/skills
  return apiGet(ENDPOINTS.skills);
}

export async function getProjects() {
  // Expected backend: GET /api/projects
  return apiGet(ENDPOINTS.projects);
}

export async function getEducation() {
  return apiGet(ENDPOINTS.education);
}

export async function submitContact({ name, email, message }) {
  // Expected backend: POST /api/contact
  return apiPost(ENDPOINTS.contact, { name, email, message });
}

