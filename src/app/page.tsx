"use client";
export const dynamic = "force-dynamic";

import { useState, useCallback } from "react";
import FloatingPapers from "@/components/landing/FloatingPapers";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import WhyStudents from "@/components/landing/WhyStudents";
import ProductCapabilities from "@/components/landing/Counters";
import LoginPanel from "@/components/landing/LoginPanel";
import LandingFooter from "@/components/landing/LandingFooter";
import HelpSupportModal from "@/components/landing/HelpSupportModal";

export default function LandingPage() {
  const [helpOpen, setHelpOpen] = useState(false);

  const openHelp = useCallback(() => setHelpOpen(true), []);
  const closeHelp = useCallback(() => setHelpOpen(false), []);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#F9F9F6",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <FloatingPapers />
      <LandingNavbar onHelpClick={openHelp} />
      <HeroSection />
      <HowItWorks />
      <WhyStudents />
      <ProductCapabilities />
      <LoginPanel />
      <LandingFooter />
      <HelpSupportModal open={helpOpen} onClose={closeHelp} />
    </main>
  );
}
