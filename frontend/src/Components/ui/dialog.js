import React from "react";

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogHeader({ className = "", children }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function DialogTitle({ className = "", children }) {
  return (
    <h2 className={`text-xl font-semibold text-gray-800 ${className}`}>
      {children}
    </h2>
  );
}

export function DialogFooter({ className = "", children }) {
  return <div className={`mt-6 flex justify-end gap-2 ${className}`}>{children}</div>;
}