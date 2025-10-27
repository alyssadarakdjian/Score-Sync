import React from "react";

export function Badge({ children, className = "", variant = "default" }) {
  const variants = {
    default:
      "bg-[#E0F2F1] text-[#00796B]",
    outline:
      "border border-[#00796B] text-[#00796B] bg-white",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}