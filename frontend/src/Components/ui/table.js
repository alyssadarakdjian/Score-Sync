import React from "react";

export function Table({ children, className = "" }) {
  return (
    <table className={`min-w-full border-collapse ${className}`}>
      {children}
    </table>
  );
}

export function TableHeader({ children }) {
  return <thead className="bg-gray-100">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "" }) {
  return <tr className={`border-b last:border-none ${className}`}>{children}</tr>;
}

export function TableHead({ children, className = "" }) {
  return (
    <th className={`text-left px-6 py-3 text-sm font-semibold text-gray-700 ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return <td className={`px-6 py-4 text-sm text-gray-700 ${className}`}>{children}</td>;
}