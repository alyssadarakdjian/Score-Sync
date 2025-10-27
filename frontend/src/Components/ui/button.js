import React from "react";

export function Button({
  children,
  onClick,
  className = "",
  variant = "default",
  size = "md",
  type = "button",
}) {
  const base = "rounded-lg font-medium transition duration-150";

  const variants = {
    default:
      "bg-[#00796B] text-white hover:bg-[#00695C] focus:ring-2 focus:ring-offset-2 focus:ring-[#00796B]",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
    icon: "p-2",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}