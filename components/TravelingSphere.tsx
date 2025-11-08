"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export default function TravelingSphere() {
  const [currentSection, setCurrentSection] = useState(0);
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Wait for DOM to be ready
    const initSphere = () => {
      // Get all section elements by ID or querySelector
      const getSection = (id: string | null, index: number) => {
        if (id) {
          return document.getElementById(id) || document.querySelector(`#${id}`);
        }
        return document.querySelectorAll("section")[index] || null;
      };

      const sections = [
        document.querySelector("section:first-of-type") || null, // Hero
        getSection("learn", 1) || document.querySelectorAll("section")[1] || null, // HowItWorks
        getSection("features", 2) || document.querySelectorAll("section")[2] || null, // Features
        getSection("testimonials", 3) || document.querySelectorAll("section")[3] || null, // Testimonials
        getSection("privacy", 4) || document.querySelectorAll("section")[4] || null, // Privacy
        document.querySelectorAll("section")[5] || null, // FinalCTA
        document.querySelectorAll("section")[6] || null, // Footer
      ];

      sectionsRef.current = sections;

      const observerOptions = {
        root: null,
        rootMargin: "-40% 0px -40% 0px", // Trigger when section is 40% visible
        threshold: 0,
      };

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = sections.findIndex((section) => section === entry.target);
            if (index !== -1) {
              setCurrentSection(index);
            }
          }
        });
      };

      const observer = new IntersectionObserver(observerCallback, observerOptions);

      sections.forEach((section) => {
        if (section) observer.observe(section);
      });

      // Fallback: check initial scroll position
      const handleScroll = () => {
        const scrollPosition = window.scrollY + window.innerHeight * 0.4;
        sections.forEach((section, index) => {
          if (section) {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
              setCurrentSection(index);
            }
          }
        });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll(); // Initial check

      // Return cleanup function
      return () => {
        observer.disconnect();
        window.removeEventListener("scroll", handleScroll);
      };
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      cleanupRef.current = initSphere();
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Define positions for each section
  const sectionPositions = [
    { x: "50%", y: "50%" },      // Hero - center
    { x: "20%", y: "50%" },      // HowItWorks - left
    { x: "80%", y: "50%" },      // Features - right
    { x: "25%", y: "50%" },      // Testimonials - left
    { x: "75%", y: "50%" },      // Privacy - right
    { x: "50%", y: "50%" },      // FinalCTA - center
    { x: "50%", y: "50%" },      // Footer - center
  ];

  const currentPos = sectionPositions[currentSection] || sectionPositions[0];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        className="absolute w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] lg:w-[1200px] lg:h-[1200px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          left: currentPos.x,
          top: currentPos.y,
          x: "-50%",
          y: "-50%",
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 1.2,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{ willChange: "transform" }}
      >
        {/* Purple-Pink-Blue Gradient Sphere - More Vibrant */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 opacity-50 blur-3xl" />
        {/* Overlay gradient for better blend */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-600/40 via-transparent to-blue-600/40 blur-2xl" />
        {/* Additional color layer */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-pink-500/40 via-transparent to-purple-600/40 blur-xl" />
        {/* Extra vibrant center glow */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl" 
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(236, 72, 153, 0.4) 50%, transparent 100%)'
          }}
        />
      </motion.div>
    </div>
  );
}

