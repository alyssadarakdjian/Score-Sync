import React from "react";

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00796B] focus:outline-none ${className}`}
      {...props}
    />
  );
}