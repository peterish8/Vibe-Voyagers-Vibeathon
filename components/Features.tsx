"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";

const features = [
  {
    title: "Automate Note-Taking",
    description:
      "Never miss important details. FlowNote automatically captures and organizes your notes from meetings, calls, and conversations.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    color: "purple",
    size: "1x1",
  },
  {
    title: "Avoid Ever Repeating Lost Work",
    description:
      "Your work is automatically saved and indexed. Find anything instantly, even if you forgot where you saved it.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    color: "blue",
    size: "1x1",
  },
  {
    title: "Leverage AI to Find Details",
    description:
      "Ask natural language questions and get instant answers from your entire knowledge base. Draft emails, summarize content, and more.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
    color: "green",
    size: "1x1",
  },
  {
    title: "Smart Task Prioritization",
    description:
      "AI analyzes your deadlines, context, and work patterns to automatically prioritize tasks and suggest the best time to tackle them.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    color: "orange",
    size: "1x1",
  },
  {
    title: "Intelligent Insights",
    description:
      "Get personalized analytics and insights about your productivity patterns, helping you work smarter and more efficiently.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    color: "pink",
    size: "2x1",
    featured: true,
  },
];

const colorClasses = {
  purple: "from-purple-500 to-purple-600",
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  orange: "from-orange-500 to-orange-600",
  pink: "from-pink-500 to-pink-600",
};

export default function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section
      id="features"
      ref={ref}
      className="py-32 px-6 md:px-12 relative"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-6 gradient-text">
            Maximize Productivity with AI-Driven Planning
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered planning for smarter, faster task management
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const isFeatured = feature.featured;
            const colSpan = feature.size === "2x1" ? "md:col-span-2" : "";
            const rowSpan = feature.size === "1x2" ? "md:row-span-2" : "";

            return (
              <motion.div
                key={feature.title}
                className={`${colSpan} ${rowSpan} ${isFeatured ? "relative" : ""}`}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {isFeatured ? (
                  <motion.div 
                    className="relative h-full rounded-[32px] overflow-hidden group"
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                  >
                    {/* Transparent glass background */}
                    <div className="absolute inset-0 bg-white/30 backdrop-blur-[20px] border border-white/40 rounded-[32px]" />
                    
                    {/* Gradient Color Spheres */}
                    <div className="absolute inset-0 overflow-hidden">
                      {/* Purple sphere - top left */}
                      <motion.div
                        className="absolute -top-16 -left-16 w-48 h-48 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full blur-2xl"
                        style={{ willChange: "transform, opacity" }}
                        animate={{
                          y: [0, 30, 0],
                          x: isHovered ? [0, 40, 0] : [0, 25, 0],
                          scale: isHovered ? 1.15 : 1,
                          opacity: isHovered ? 0.7 : 0.6,
                        }}
                        transition={{
                          x: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          y: {
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          scale: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                          opacity: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                        }}
                      />
                      {/* Blue sphere - top right */}
                      <motion.div
                        className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full blur-2xl"
                        style={{ willChange: "transform, opacity" }}
                        animate={{
                          y: [0, 35, 0],
                          x: isHovered ? [0, -35, 0] : [0, -20, 0],
                          scale: isHovered ? 1.15 : 1,
                          opacity: isHovered ? 0.7 : 0.6,
                        }}
                        transition={{
                          x: {
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          y: {
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          scale: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                          opacity: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                        }}
                      />
                      {/* Pink sphere - bottom left */}
                      <motion.div
                        className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full blur-2xl"
                        style={{ willChange: "transform, opacity" }}
                        animate={{
                          y: [0, -30, 0],
                          x: isHovered ? [0, 45, 0] : [0, 30, 0],
                          scale: isHovered ? 1.2 : 1,
                          opacity: isHovered ? 0.6 : 0.5,
                        }}
                        transition={{
                          x: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          y: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          scale: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                          opacity: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                        }}
                      />
                      {/* Cyan sphere - bottom right */}
                      <motion.div
                        className="absolute -bottom-8 -right-8 w-44 h-44 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full blur-2xl"
                        style={{ willChange: "transform, opacity" }}
                        animate={{
                          y: [0, -25, 0],
                          x: isHovered ? [0, -40, 0] : [0, -25, 0],
                          scale: isHovered ? 1.15 : 1,
                          opacity: isHovered ? 0.65 : 0.55,
                        }}
                        transition={{
                          x: {
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          y: {
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                          scale: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                          opacity: {
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                          },
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 p-8 md:p-12 h-full">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 bg-white/30 backdrop-blur-md">
                        <div className="text-purple-700">
                          {feature.icon}
                        </div>
                      </div>

                      <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                        {feature.title}
                      </h3>

                      <p className="leading-relaxed text-gray-700">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="card-glass h-full">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${colorClasses[feature.color as keyof typeof colorClasses]}`}
                    >
                      <div className="text-white">
                        {feature.icon}
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                      {feature.title}
                    </h3>

                    <p className="leading-relaxed text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

