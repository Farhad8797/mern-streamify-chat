import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const BackgroundLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-0 right-0 w-112.5 h-112.5 bg-purple-600/25 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-112.5 h-112.5 bg-cyan-600/25 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="relative z-10 min-h-screen">{children}</div>
    </div>
  );
};
