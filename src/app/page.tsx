"use client";
export const dynamic = "force-dynamic";

import FloatingPapers from "@/components/landing/FloatingPapers";
import HeroSection from "@/components/landing/HeroSection";
import FeatureCards from "@/components/landing/FeatureCards";
import HowItWorks from "@/components/landing/HowItWorks";
import PrintProgress from "@/components/landing/PrintProgress";
import ProductCapabilities from "@/components/landing/Counters";
import LoginPanel from "@/components/landing/LoginPanel";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
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
      <HeroSection />
      <FeatureCards />
      <HowItWorks />
      <PrintProgress />
      <ProductCapabilities />
      <LoginPanel />
      <LandingFooter />
    </main>
  );
}
