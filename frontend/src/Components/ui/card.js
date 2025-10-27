import React from "react";

export function Card({ className = "", children }) {
  return (
    <div
      className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={`p-4 border-b border-gray-200 ${className}`}>{children}</div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}