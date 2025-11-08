"use client";

import { memo } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Privacy from "@/components/Privacy";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import GradientOrbs from "@/components/GradientOrbs";

// Memoize components to prevent unnecessary re-renders
const MemoizedNavigation = memo(Navigation);
const MemoizedHero = memo(Hero);
const MemoizedHowItWorks = memo(HowItWorks);
const MemoizedFeatures = memo(Features);
const MemoizedTestimonials = memo(Testimonials);
const MemoizedPrivacy = memo(Privacy);
const MemoizedFinalCTA = memo(FinalCTA);
const MemoizedFooter = memo(Footer);
const MemoizedGradientOrbs = memo(GradientOrbs);

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <MemoizedGradientOrbs />
      <MemoizedNavigation />
      <MemoizedHero />
      <MemoizedHowItWorks />
      <MemoizedFeatures />
      <MemoizedTestimonials />
      <MemoizedPrivacy />
      <MemoizedFinalCTA />
      <MemoizedFooter />
    </main>
  );
}

