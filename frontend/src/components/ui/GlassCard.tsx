import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface Props extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
  variant = "default",
  ...props
}: Props) {
  const variants = {
    default: {
      border: "border-slate-200/80",
      glow: "hover:shadow-[0_20px_40px_rgba(15,23,42,0.05)]",
      accent: "from-slate-50 to-slate-100/30",
    },

    primary: {
      border: "border-blue-200",
      glow: "hover:shadow-[0_20px_40px_rgba(37,99,235,0.06)]",
      accent: "from-blue-50/80 to-slate-50/30",
    },

    success: {
      border: "border-emerald-200",
      glow: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.06)]",
      accent: "from-emerald-50/60 to-slate-50/30",
    },

    warning: {
      border: "border-amber-200",
      glow: "hover:shadow-[0_20px_40px_rgba(245,158,11,0.06)]",
      accent: "from-amber-50/60 to-slate-50/30",
    },

    danger: {
      border: "border-red-200",
      glow: "hover:shadow-[0_20px_40px_rgba(239,68,68,0.06)]",
      accent: "from-red-50/60 to-slate-50/30",
    },
  };

  const current = variants[variant];

  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -4,
              scale: 1.01,
            }
          : undefined
      }
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      className={`
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        ${current.border}
        ${current.glow}
        bg-white/80
        backdrop-blur-2xl
        shadow-[0_8px_30px_rgba(15,23,42,0.04)]
        transition-all
        duration-500
        ${className}
      `}
      {...props}
    >
      {/* Ambient gradient */}
      <div
        className={`
          absolute
          inset-0
          bg-gradient-to-br
          ${current.accent}
          opacity-60
        `}
      />

      {/* Glass reflection */}
      <motion.div
        className="
          absolute
          -top-1/2
          left-[-40%]
          h-[220%]
          w-[45%]
          rotate-12
          bg-gradient-to-r
          from-transparent
          via-white/15
          to-transparent
          blur-2xl
        "
        animate={{
          x: ["-120%", "260%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "linear",
        }}
      />

      {/* Animated border */}
      <div
        className="
          absolute
          inset-0
          rounded-3xl
          border
          border-slate-200/20
          pointer-events-none
        "
      />

      {/* Noise texture */}
      <div
        className="
          absolute
          inset-0
          opacity-[0.03]
          mix-blend-overlay
          pointer-events-none
        "
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "6px 6px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
}