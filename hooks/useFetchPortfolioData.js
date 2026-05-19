"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getEducation, getProfile, getProjects, getSkills } from "@/services/api";

export function useFetchPortfolioData() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(null);
  const [projects, setProjects] = useState(null);
  const [education, setEducation] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, pr, ed] = await Promise.all([
        getProfile(),
        getSkills(),
        getProjects(),
        getEducation(),
      ]);
      setProfile(p);
      setSkills(s);
      setProjects(pr);
      setEducation(ed);
    } catch (err) {
      console.error("[portfolio] Failed to load data:", err?.message || err);
      setProfile(null);
      setSkills(null);
      setProjects(null);
      setEducation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const normalized = useMemo(() => {
    return {
      loading,
      profile,
      skills,
      projects,
      education,
      refresh,
    };
  }, [loading, profile, skills, projects, education, refresh]);

  return normalized;
}

