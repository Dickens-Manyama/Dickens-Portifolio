"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getProfile, getProjects, getSkills } from "@/services/api";

export function useFetchPortfolioData() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(null);
  const [projects, setProjects] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [p, s, pr] = await Promise.all([getProfile(), getSkills(), getProjects()]);
      setProfile(p);
      setSkills(s);
      setProjects(pr);
    } catch (err) {
      console.error("[portfolio] Failed to load data:", err?.message || err);
      setProfile(null);
      setSkills(null);
      setProjects(null);
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
      refresh,
    };
  }, [loading, profile, skills, projects, refresh]);

  return normalized;
}

