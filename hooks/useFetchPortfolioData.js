"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getEducation, getProfile, getProjects, getSkills } from "@/services/api";

const REFRESH_INTERVAL_MS = 20_000;

export function useFetchPortfolioData() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState(null);
  const [projects, setProjects] = useState(null);
  const [education, setEducation] = useState(null);

  const refresh = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoading(true);
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
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh({ showLoading: true });

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_INTERVAL_MS);

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
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

