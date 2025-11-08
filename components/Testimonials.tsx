"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    quote:
      "FlowNote has completely transformed how I work. The AI understands my context so well that it feels like having a personal assistant who knows everything about my projects.",
    author: "Sarah Chen",
    role: "Product Manager at TechCorp",
    gradient: "from-purple-400 to-pink-400",
  },
  {
    quote:
      "I can't imagine going back to manual note-taking. FlowNote captures everything automatically and makes it instantly searchable. It's like having a perfect memory.",
    author: "Michael Rodriguez",
    role: "Software Engineer",
    gradient: "from-blue-400 to-purple-400",
  },
  {
    quote:
      "The personalized insights have helped me identify patterns in my work I never noticed. My productivity has increased significantly since using FlowNote.",
    author: "Emily Johnson",
    role: "Design Director",
    gradient: "from-pink-400 to-orange-400",
  },
  {
    quote:
      "FlowNote's AI is incredibly smart. It doesn't just store information—it helps me make connections and find answers to questions I didn't even know I had.",
    author: "David Kim",
    role: "Research Scientist",
    gradient: "from-green-400 to-blue-400",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px", amount: 0.3 });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="py-32 px-6 md:px-12 relative"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          <h2 className="text-4xl md:text-6xl font-serif mb-6 gradient-text">
            For people who want to work smarter, better, faster
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="card-glass">
                {/* Quote Icon */}
                <div className="mb-6">
                  <svg
                    className="w-12 h-12 text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.996 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.984zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {/* Quote Text */}
                <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
                  {testimonial.quote}
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex-shrink-0`}
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <button className="btn-glass">Read more testimonials</button>
        </motion.div>
      </div>
    </section>
  );
}

