import React from "react";

export function Select({ value, onValueChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#00796B] focus:outline-none"
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children }) {
  return <>{children}</>;
}
export function SelectContent({ children }) {
  return <>{children}</>;
}
export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
export function SelectValue() {
  return null;
}