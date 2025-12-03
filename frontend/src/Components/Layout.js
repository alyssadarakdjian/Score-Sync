import {
  BarChart3,
  BookOpen,
  Calendar as CalendarIcon,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/Dashboard", icon: LayoutDashboard },
  { title: "Courses", url: "/Courses", icon: BookOpen },
  { title: "Grades", url: "/Grades", icon: GraduationCap },
  { title: "Calendar", url: "/Calendar", icon: CalendarIcon },
  { title: "Messages", url: "/Messages", icon: MessageSquare },
  { title: "Reports", url: "/Reports", icon: BarChart3 },
];

export default function Layout({ children, currentPageName, fullname, email, onLogout, isAdmin = false }) {
  const location = useLocation();
  const filteredItems = isAdmin
    ? navigationItems.filter(item => item.title !== 'Dashboard')
    : navigationItems;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-[#ECEFF1] to-[#CFD8DC]">
        <Sidebar className="border-r border-gray-200 bg-white">
          <SidebarHeader className="border-b border-gray-200 p-6 text-center">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68fd3d9da4c6796c04141382/5c35e26a2_ScoreSync-Picsart-BackgroundRemover.png"
              alt="ScoreSync"
              className="h-24 w-auto mx-auto"
            />
            <p className="text-xs text-[#78909C] mt-3">Student Grade Management</p>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-[#78909C] uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-[#E0F2F1] hover:text-[#00796B] transition-all duration-200 rounded-lg mb-1 ${location.pathname === item.url
                            ? "bg-[#E0F2F1] text-[#00796B] shadow-sm"
                            : "text-[#546E7A]"
                          }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {fullname?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#37474F] text-sm truncate">
                    {fullname || "User"}
                  </p>
                  <p className="text-xs text-[#78909C] truncate">
                    {email || "user@example.com"}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#78909C] hover:text-[#D32F2F] hover:bg-[#FFEBEE] rounded-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b px-6 py-4 flex items-center gap-4 shadow-sm">
            <SidebarTrigger className="lg:hidden hover:bg-[#E0F2F1] p-2 rounded-lg transition-colors duration-200">
              <Menu className="w-5 h-5 text-[#546E7A]" />
            </SidebarTrigger>
            <h1 className="text-2xl font-bold text-[#1A4D5E]">{currentPageName}</h1>
          </header>
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}