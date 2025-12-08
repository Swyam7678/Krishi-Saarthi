import { Home, CloudSun, Sprout, Store, BookOpen, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import { useLanguage } from "@/lib/i18n";

export function AppSidebar() {
  const { t } = useLanguage();
  const location = useLocation();

  const items = [
    {
      title: t('dashboard') || "Overview",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: t('feature_weather') || "Weather",
      url: "/dashboard/weather",
      icon: CloudSun,
    },
    {
      title: t('feature_soil') || "Soil Health",
      url: "/dashboard/soil",
      icon: Sprout,
    },
    {
      title: t('feature_market') || "Market Prices",
      url: "/dashboard/market",
      icon: Store,
    },
    {
      title: t('feature_ai') || "Advisory",
      url: "/dashboard/advisory",
      icon: BookOpen,
    },
    {
      title: t('schemes_title') || "Schemes",
      url: "/dashboard/schemes",
      icon: FileText,
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url || (item.url !== "/dashboard" && location.pathname.startsWith(item.url))}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}