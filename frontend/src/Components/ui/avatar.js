import React from "react";

export function Avatar({ className = "", children }) {
  return (
    <div
      className={`w-10 h-10 rounded-full bg-gradient-to-br from-[#00796B] to-[#004D40] flex items-center justify-center text-white font-semibold ${className}`}
    >
      {children}
    </div>
  );
}

export function AvatarImage({ src, alt = "", className = "" }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`w-10 h-10 rounded-full object-cover ${className}`}
    />
  );
}

export function AvatarFallback({ initials, className = "" }) {
  return (
    <div
      className={`w-10 h-10 rounded-full bg-[#B0BEC5] flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
}