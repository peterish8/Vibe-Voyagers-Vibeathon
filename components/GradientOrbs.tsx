"use client";

export default function GradientOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Purple orb - top right - Subtle */}
      <div
        className="gradient-orb w-[600px] h-[600px] bg-purple-400 top-[-200px] right-[-200px] animate-float"
        style={{
          background: "radial-gradient(circle, rgba(196, 181, 253, 0.15) 0%, transparent 70%)",
          willChange: "transform",
          transform: "translateZ(0)",
          filter: "blur(60px)",
        }}
      />
      
      {/* Blue orb - bottom left - Subtle */}
      <div
        className="gradient-orb w-[700px] h-[700px] bg-blue-300 bottom-[-300px] left-[-300px] animate-float-slow"
        style={{
          background: "radial-gradient(circle, rgba(147, 197, 253, 0.12) 0%, transparent 70%)",
          willChange: "transform",
          transform: "translateZ(0)",
          filter: "blur(60px)",
        }}
      />
      
      {/* Pink accent orb - center - Subtle */}
      <div
        className="gradient-orb w-[800px] h-[800px] md:w-[1000px] md:h-[1000px] lg:w-[1200px] lg:h-[1200px] bg-pink-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(251, 182, 206, 0.06) 30%, rgba(219, 39, 119, 0.04) 60%, transparent 80%)",
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}

