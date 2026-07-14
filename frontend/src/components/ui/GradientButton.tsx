import { ReactNode, ButtonHTMLAttributes } from "react";
import { motion } from "framer-motion";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "ghost";
  loading?: boolean;
}

export default function GradientButton({
  children,
  className = "",
  variant = "primary",
  loading = false,
  disabled = false,
  ...props
}: Props) {
  const variants = {
    primary: {
      gradient:
        "from-blue-600 via-sky-500 to-cyan-400",
      glow:
        "hover:shadow-[0_0_35px_rgba(59,130,246,0.45)]",
      border:
        "border-blue-400/20",
      text:
        "text-white",
    },

    secondary: {
      gradient:
        "from-violet-600 via-fuchsia-500 to-purple-400",
      glow:
        "hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]",
      border:
        "border-violet-400/20",
      text:
        "text-white",
    },

    success: {
      gradient:
        "from-emerald-600 via-green-500 to-lime-400",
      glow:
        "hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]",
      border:
        "border-emerald-400/20",
      text:
        "text-white",
    },

    danger: {
      gradient:
        "from-rose-600 via-red-500 to-orange-400",
      glow:
        "hover:shadow-[0_0_35px_rgba(239,68,68,0.45)]",
      border:
        "border-red-400/20",
      text:
        "text-white",
    },

    ghost: {
      gradient:
        "from-slate-800 to-slate-700",
      glow:
        "hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]",
      border:
        "border-white/10",
      text:
        "text-slate-200",
    },
  };

  const current = variants[variant];

  return (
    <motion.button
      whileHover={{
        scale: 1.03,
        y: -2,
      }}
      whileTap={{
        scale: 0.97,
      }}
      transition={{
        duration: 0.2,
      }}
      disabled={disabled || loading}
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        px-6
        py-3
        border
        backdrop-blur-xl
        bg-gradient-to-r
        ${current.gradient}
        ${current.border}
        ${current.text}
        ${current.glow}
        transition-all
        duration-300
        font-semibold
        tracking-wide
        uppercase
        flex
        items-center
        justify-center
        gap-2
        ${
          disabled || loading
            ? "opacity-40 cursor-not-allowed"
            : "cursor-pointer"
        }
        ${className}
      `}
      {...props}
    >
      {/* Glass highlight */}
      <motion.div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent
          -translate-x-full
        "
        animate={{
          x: ["-120%", "220%"],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "linear",
        }}
      />

      {/* Glow */}
      <div
        className="
          absolute
          inset-0
          opacity-0
          group-hover:opacity-100
          transition-opacity
          duration-300
          bg-white/10
        "
      />

      {loading ? (
        <motion.div
          className="
            w-5
            h-5
            border-2
            border-white/30
            border-t-white
            rounded-full
          "
          animate={{
            rotate: 360,
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "linear",
          }}
        />
      ) : (
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      )}
    </motion.button>
  );
}