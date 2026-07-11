import {
  Activity,
  LayoutDashboard,
  Salad,
  Settings,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Nutrition", href: "/nutrition", icon: Salad },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Profile", href: "/profile", icon: UserCircle2 },
  { label: "Settings", href: "/settings", icon: Settings },
];
