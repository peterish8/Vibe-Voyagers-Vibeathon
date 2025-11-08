"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 pt-32 pb-20 overflow-hidden">
      {/* Gradient Sphere Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            x: "-50%",
            y: "-50%",
          }}
          transition={{
            opacity: { duration: 1, ease: "easeOut" },
            scale: { duration: 1, ease: "easeOut" },
          }}
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
          }}
        >
          {/* Main Gradient Sphere - Purple to Blue to Pink */}
          <motion.div 
            className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full"
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -30, 20, 0],
            }}
            transition={{
              x: {
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
              },
              y: {
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{
              background: "radial-gradient(circle, rgba(196, 181, 253, 0.4) 0%, rgba(147, 197, 253, 0.3) 30%, rgba(251, 182, 206, 0.2) 60%, transparent 100%)",
              filter: "blur(80px)",
              transform: "translateZ(0)",
              willChange: "transform",
            }}
          />
          {/* Overlay gradient for depth */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
              filter: "blur(60px)",
              transform: "translateZ(0)",
            }}
          />
        </motion.div>
      </div>

      <motion.div
        className="max-w-6xl mx-auto w-full text-center relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-purple-700">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Coming soon to Windows
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-tight"
        >
          A <span className="italic font-normal">truly</span>{" "}
          <span className="font-semibold">personalized</span> AI
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          FlowNote is a personalized AI powered by everything you&apos;ve seen, said, or heard.
          Your colleagues will wonder how you do it all.
        </motion.p>

        {/* Email Input */}
        <motion.div
          variants={itemVariants}
          className="max-w-xl mx-auto mb-8"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle signup logic here
              console.log("Form submitted with email:", email);
            }}
            className="flex items-center bg-white/50 backdrop-blur-[20px] border border-white/50 rounded-full pr-2 focus-within:bg-white/70 focus-within:border-purple-500 transition-all duration-300 ease-out"
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

        {/* Platform Badge */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-16"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h14V7l-7-5z" />
            </svg>
            Mac
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h14V7l-7-5z" />
            </svg>
            iPhone
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11h14V7l-7-5z" />
            </svg>
            iPad
          </span>
        </motion.div>

        {/* Product Mockup */}
        <motion.div
          variants={itemVariants}
          className="relative max-w-5xl mx-auto"
        >
          {/* Laptop Mockup */}
          <motion.div
            className="relative mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="relative bg-gray-900 rounded-t-3xl p-2 shadow-2xl">
              <div className="bg-white rounded-t-2xl overflow-hidden aspect-video">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Replace with screenshot</p>
                </div>
              </div>
            </div>
            {/* Laptop base */}
            <div className="h-2 bg-gray-800 rounded-b-lg mx-auto w-[95%] shadow-lg" />
          </motion.div>

          {/* Floating Phone Mockup */}
          <motion.div
            className="hidden lg:block absolute -right-20 top-1/4"
            initial={{ opacity: 0, x: 50, rotate: -10 }}
            animate={{ opacity: 1, x: 0, rotate: -10 }}
            transition={{ delay: 1, duration: 0.8 }}
            whileHover={{ rotate: -5, scale: 1.05 }}
          >
            <div className="relative bg-white rounded-[2.5rem] p-3 shadow-2xl">
              <div className="bg-gray-900 rounded-[2rem] overflow-hidden aspect-[9/19] w-48">
                <div className="w-full h-full bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 flex items-center justify-center">
                  <p className="text-gray-400 text-xs text-center px-4">
                    Replace with screenshot
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

