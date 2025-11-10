import React from "react";

export const Textarea = React.forwardRef(({ className = "", ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00796B] focus:outline-none ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";