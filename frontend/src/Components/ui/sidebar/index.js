import React from "react";
import clsx from "clsx";

export const SidebarProvider = ({ children }) => <>{children}</>;

export const Sidebar = ({ children, className }) => (
  <aside className={clsx("w-64 flex flex-col", className)}>{children}</aside>
);

export const SidebarHeader = ({ children, className }) => (
  <div className={clsx("p-4 border-b", className)}>{children}</div>
);

export const SidebarContent = ({ children, className }) => (
  <div className={clsx("flex-1 overflow-y-auto", className)}>{children}</div>
);

export const SidebarFooter = ({ children, className }) => (
  <div className={clsx("border-t p-4", className)}>{children}</div>
);

export const SidebarGroup = ({ children, className }) => (
  <div className={clsx("mb-4", className)}>{children}</div>
);

export const SidebarGroupLabel = ({ children, className }) => (
  <div className={clsx("uppercase text-xs font-semibold mb-2", className)}>{children}</div>
);

export const SidebarGroupContent = ({ children, className }) => (
  <div className={clsx("", className)}>{children}</div>
);

export const SidebarMenu = ({ children, className }) => (
  <ul className={clsx("space-y-1", className)}>{children}</ul>
);

export const SidebarMenuItem = ({ children, className }) => (
  <li className={clsx("", className)}>{children}</li>
);

export const SidebarMenuButton = ({ children, className, asChild }) => {
  const Comp = asChild ? "div" : "button";
  return (
    <Comp className={clsx("w-full text-left", className)}>
      {children}
    </Comp>
  );
};

export const SidebarTrigger = ({ children, className }) => (
  <button className={clsx("lg:hidden", className)}>{children}</button>
);