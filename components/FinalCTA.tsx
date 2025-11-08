"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");

  return (
    <section ref={ref} className="py-32 px-6 md:px-12 relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-90" />
      
      {/* Abstract White Circles - Globe POV */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circle - top left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white rounded-full opacity-20 blur-3xl" />
        {/* Medium circle - top right */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white rounded-full opacity-20 blur-3xl" />
        {/* Small circle - bottom left */}
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white rounded-full opacity-20 blur-3xl" />
        {/* Medium circle - center right */}
        <div className="absolute top-1/2 -right-16 w-80 h-80 bg-white rounded-full opacity-20 blur-3xl" />
        {/* Small circle - bottom right */}
        <div className="absolute -bottom-24 right-1/3 w-56 h-56 bg-white rounded-full opacity-20 blur-3xl" />
        {/* Medium circle - center left */}
        <div className="absolute top-1/3 -left-24 w-72 h-72 bg-white rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-6 text-white">
            Download your new superpower today
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who are already working smarter with
            FlowNote
          </p>

          {/* Email Input */}
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle signup logic here
                console.log("Form submitted with email:", email);
              }}
              className="flex items-center bg-white/90 backdrop-blur-[20px] border border-white/50 rounded-full pr-2 focus-within:bg-white focus-within:border-purple-300 transition-all duration-300 ease-out"
              action="#"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle signup logic here
                    console.log("Form submitted with email:", email);
                  }
                }}
              />
              <motion.button
                type="button"
                className="px-6 py-2.5 rounded-full font-semibold text-white text-sm bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25 transition-all duration-300 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Handle signup logic here
                  console.log("Form submitted with email:", email);
                }}
              >
                Get Started
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
