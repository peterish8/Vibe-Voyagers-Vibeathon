"use client";

import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Privacy from "@/components/Privacy";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import GradientOrbs from "@/components/GradientOrbs";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <GradientOrbs />
      <Navigation />
      <Hero />
      <HowItWorks />
      <Features />
      <Testimonials />
      <Privacy />
      <FinalCTA />
      <Footer />
    </main>
  );
}

