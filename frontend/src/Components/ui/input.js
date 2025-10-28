import React from "react";

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00796B] ${className}`}
      {...props}
    />
  );
}