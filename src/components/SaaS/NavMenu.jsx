import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { HelpCircle, FileText, Headset, User, MessageSquare, Settings as SettingsIcon, LayoutGrid, Palette } from "lucide-react";
import { NavLink, useRouter } from "../../utils/Router";

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

// Get icon path from PHP localization or use default
const getMenuIcon = () => {
  return window.sureFeedbackAdmin?.pluginUrl + 'assets/images/settings/surefeedback.svg';
};

// Create icon components that accept className prop
const ConnectionIcon = ({ className }) => (
  <MessageSquare className={className} />
);
const SettingsIconComponent = ({ className }) => (
  <SettingsIcon className={className} />
);
const WidgetControlIcon = ({ className }) => (
  <LayoutGrid className={className} />
);

const NavMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentRoute } = useRouter();

  const isActive = (path) => currentRoute === path;

  const handleRedirect = (url) => {
    window.open(url, "_blank");
    setIsDropdownOpen(false);
  };

  // Check if website is connected
  const isConnected = window.sureFeedbackAdmin?.connection?.connected || false;

  // Determine connection type preference to show correct nav items
  const connectionTypePreference = window.sureFeedbackAdmin?.connectionTypePreference || '';
  
  // Filter nav items based on connection type
  let allNavItems = [];
  
  // White Label Icon
  const WhiteLabelIcon = ({ className }) => (
    <Palette className={className} />
  );

  if (connectionTypePreference === 'plugin') {
    // Plugin (Legacy) nav items - 3 tabs: Connection, Settings, White Label
    allNavItems = [
      { label: __("Connection", "surefeedback"), path: "plugin-connection", icon: ConnectionIcon, showWhenConnected: true },
      { label: __("Settings", "surefeedback"), path: "settings", icon: SettingsIconComponent, showWhenConnected: true },
      { label: __("White Label", "surefeedback"), path: "white-label", icon: WhiteLabelIcon, showWhenConnected: true },
    ];
  } else {
    // SaaS nav items
    allNavItems = [
      { label: __("Connections", "surefeedback"), path: "connections", icon: ConnectionIcon, showWhenConnected: true },
      { label: __("Widget Control", "surefeedback"), path: "widget-control", icon: WidgetControlIcon, showWhenConnected: true },
      { label: __("Settings", "surefeedback"), path: "settings", icon: SettingsIconComponent, showWhenConnected: true },
    ];
  }

  const navItems = allNavItems.filter(item =>
    isConnected ? item.showWhenConnected : true
  );

  return (
    <div
      className="surefeedback-nav-menu w-full px-6 py-3 grid grid-cols-3 items-center bg-white border-b border-gray-200"
      style={{ zIndex: 9 }}
    >
      {/* Left: Logo */}
      <div className="flex items-center justify-start min-w-0">
        <NavLink 
          to={connectionTypePreference === 'plugin' ? 'plugin-connection' : 'connections'} 
          className="focus:outline-none flex-shrink-0"
        >
          <img
            src={getMenuIcon()}
            alt="SureFeedback"
            className="h-[25px] w-auto cursor-pointer focus:outline-none"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = 'none';
            }}
          />
        </NavLink>
      </div>

      {/* Center: Navigation Tabs */}
      <div className="flex items-center justify-center min-w-0">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-4 justify-center">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavigationMenuItem key={path}>
                <NavLink to={path} className="focus:outline-none">
                  <NavigationMenuLink
                    className={cn(
                      "px-2 py-1.5 text-sm font-medium transition-colors border-b-2 focus:outline-none focus-visible:outline-none whitespace-nowrap flex items-center gap-1.5",
                      isActive(path)
                        ? "text-gray-900 border-[#455AFB]"
                        : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </NavigationMenuLink>
                </NavLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-3 min-w-0">

        {/* Help Dropdown */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <HelpCircle className="cursor-pointer flex-shrink-0 w-5 h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-white">
            <DropdownMenuLabel>
              {__("Useful Resources", "surefeedback")}
            </DropdownMenuLabel>
            {[
              {
                label: __("Getting Started", "surefeedback"),
                url: "https://surefeedback.com/docs/plugin-set-up-guide/",
                icon: <FileText />,
              },
              {
                label: __("Start adding comments", "surefeedback"),
                url: "https://surefeedback.com/docs/start-adding-comments/",
                icon: <FileText />,
              },
              {
                label: __("Contact us", "surefeedback"),
                url: "https://surefeedback.com/contact-us/",
                icon: <Headset />,
              },
            ].map(({ label, url, icon }) => (
              <DropdownMenuItem
                key={label}
                onClick={() => handleRedirect(url)}
                className="flex items-center gap-2 text-gray-800 cursor-pointer"
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
};

export default NavMenu;
