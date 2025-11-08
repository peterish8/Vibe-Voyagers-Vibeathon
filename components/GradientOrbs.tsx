"use client";

export default function GradientOrbs() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Purple orb - top right */}
      <div
        className="gradient-orb w-[600px] h-[600px] bg-purple-400 top-[-200px] right-[-200px] animate-float"
        style={{
          background: "radial-gradient(circle, rgba(196, 181, 253, 0.6) 0%, transparent 70%)",
        }}
      />
      
      {/* Blue orb - bottom left */}
      <div
        className="gradient-orb w-[700px] h-[700px] bg-blue-300 bottom-[-300px] left-[-300px] animate-float-slow"
        style={{
          background: "radial-gradient(circle, rgba(147, 197, 253, 0.5) 0%, transparent 70%)",
        }}
      />
      
      {/* Pink accent orb - center */}
      <div
        className="gradient-orb w-[500px] h-[500px] bg-pink-300 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-soft"
        style={{
          background: "radial-gradient(circle, rgba(251, 182, 206, 0.4) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

