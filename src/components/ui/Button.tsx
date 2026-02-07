"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  gold: "bg-gradient-to-r from-gold-start to-gold-end text-gray-900 font-bold shadow-lg hover:brightness-110",
  outline: "border border-gray-600 text-gray-300 hover:bg-gray-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-gray-400 hover:text-white hover:bg-gray-800",
};

const sizes = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-12 px-5 text-base rounded-xl",
  lg: "h-14 px-6 text-lg rounded-xl",
};

export default function Button({
  variant = "gold",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
