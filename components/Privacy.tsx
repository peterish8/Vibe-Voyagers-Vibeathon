"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const privacyFeatures = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
        />
      </svg>
    ),
    title: "Stored Locally",
    description:
      "Your data stays on your device. We never send your personal information to our servers.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: "Full Encryption",
    description:
      "All your data is encrypted end-to-end. Only you have access to your information.",
  },
  {
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
    title: "Private Browsing Not Captured",
    description:
      "We respect your privacy. Private browsing sessions are never recorded or analyzed.",
  },
];

export default function Privacy() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="privacy"
      ref={ref}
      className="py-32 px-6 md:px-12 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden"
    >
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

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-serif mb-6 text-white">
              Private by design
            </h2>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              Your privacy is our top priority. FlowNote is built with privacy-first principles,
              ensuring your data remains secure and under your control at all times.
            </p>
            <motion.button
              className="btn-glass bg-white/10 border-white/20 text-white hover:bg-white/20"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95, y: 0 }}
            >
              Learn more about privacy
            </motion.button>
          </motion.div>

          {/* Right Side - Feature Cards */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {privacyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-strong rounded-3xl p-6 bg-white/5 border-white/10"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

