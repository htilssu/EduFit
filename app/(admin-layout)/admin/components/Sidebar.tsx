"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  Calendar,
  School,
  ChevronDown,
  ChevronRight,
  Ticket,
  Ban,
  Star,
  Package,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils/TwMerge";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: { title: string; href: string }[];
};

const sidebarItems: SidebarItem[] = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Quản lý Mã",
    href: "/admin/codes",
    icon: Ticket,
  },
  {
    title: "Quản lý Từ Cấm",
    href: "/admin/badwords",
    icon: Ban,
  },
  {
    title: "Quản lý lịch học",
    href: "/admin/schedules",
    icon: Calendar,
    submenu: [
      { title: "Thời khóa biểu", href: "/admin/schedules/timetables" },
      { title: "Lịch thi", href: "/admin/schedules/exams" },
    ],
  },
  {
    title: "Quản lý lớp học",
    href: "/admin/classes",
    icon: School,
  },
  {
    title: "Quản lý Đánh giá",
    href: "/admin/feedbacks",
    icon: Star,
  },
  {
    title: "Quản lý dịch vụ",
    href: "/admin/services",
    icon: Package,
  },
  {
    title: "Quản lý Mail",
    href: "/admin/mail",
    icon: Mail,
  },
  {
    title: "Thống kê",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Báo cáo",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (itemTitle: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [itemTitle]: !prev[itemTitle],
    }));
  };

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r bg-background">
      <nav className="space-y-1 px-3 py-5">
        {sidebarItems.map((item) => (
          <div key={item.href} className="space-y-1">
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.title)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md py-2 px-3 text-left text-sm font-medium transition-colors hover:bg-muted/50",
                    pathname === item.href && "bg-muted text-primary"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                  {openSubmenus[item.title] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {openSubmenus[item.title] && (
                  <div className="pl-8 space-y-1">
                    {item.submenu.map((subitem) => (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className={cn(
                          "block rounded-md py-2 px-3 text-sm transition-colors hover:bg-muted/50",
                          pathname === subitem.href && "bg-muted text-primary"
                        )}
                      >
                        {subitem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center rounded-md py-2 px-3 text-sm font-medium transition-colors hover:bg-muted/50",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
