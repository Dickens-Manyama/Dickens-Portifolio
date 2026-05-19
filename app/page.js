"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import BackgroundBlobs from "@/components/BackgroundBlobs";
import { HeroSection } from "@/sections/HeroSection";
import { AboutSection } from "@/sections/AboutSection";
import { SkillsSection } from "@/sections/SkillsSection";
import { ProjectsSection } from "@/sections/ProjectsSection";
import { EducationSection } from "@/sections/EducationSection";
import { ContactSection } from "@/sections/ContactSection";
import { useFetchPortfolioData } from "@/hooks/useFetchPortfolioData";

export default function HomePage() {
  const { loading, profile, skills, projects, education } = useFetchPortfolioData();

  return (
    <div className="relative min-h-screen">
      <BackgroundBlobs />
      <Navbar loading={loading} />

      <main className="relative z-10">
        <HeroSection profile={profile} />
        <AboutSection profile={profile} />
        <SkillsSection skills={skills} loading={loading} />
        <ProjectsSection projects={projects} loading={loading} />
        <EducationSection education={education} loading={loading} />
        <ContactSection profile={profile} />
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}

