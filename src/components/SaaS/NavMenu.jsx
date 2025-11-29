import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../ui/dropdown-menu";
import { Topbar } from "../ui/topbar";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";
import { HelpCircle, FileText, Headphones, BookOpen } from "lucide-react";
import { useRouter } from "../../utils/Router";

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

// Get logo path
const getMenuIcon = () => {
  return window.sureFeedbackAdmin?.pluginUrl + 'assets/images/settings/surefeedback-logo-img.svg';
};

const NavMenu = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { currentRoute, navigate } = router;

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

  if (connectionTypePreference === 'plugin') {
    // Plugin nav items - Dashboard and Settings (White Label is now in Settings tab)
    allNavItems = [
      { label: __("Dashboard", "surefeedback"), path: "plugin-dashboard", showWhenConnected: true },
      { label: __("Settings", "surefeedback"), path: "settings", showWhenConnected: true },
    ];
  } else {
    // SaaS nav items - Dashboard, Settings (Widget Control is now in Settings tab)
    allNavItems = [
      { label: __("Dashboard", "surefeedback"), path: "dashboard", showWhenConnected: true },
      { label: __("Settings", "surefeedback"), path: "settings", showWhenConnected: true },
    ];
  }

  const navItems = allNavItems.filter(item =>
    isConnected ? item.showWhenConnected : true
  );

  const pluginVersion = window.sureFeedbackAdmin?.version || '1.2.10';

  return (
    <div className="top-8 z-[1]">
      <Topbar className="py-0 px-4 min-h-0 h-14 gap-4 shadow-sm bg-white/75 backdrop-blur-[5px]">
        <Topbar.Left className="gap-3">
          <Topbar.Item>
            <a
              href={`#${connectionTypePreference === 'plugin' ? 'plugin-dashboard' : 'dashboard'}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(connectionTypePreference === 'plugin' ? 'plugin-dashboard' : 'dashboard');
              }}
              className="focus:outline-none shrink-0"
            >
              <img
                src={window.sureFeedbackAdmin?.surefeedback_icon || getMenuIcon()}
                alt="SureFeedback"
                className="h-[25px] w-auto cursor-pointer focus:outline-none"
                onError={(e) => {
                  // Fallback if image fails to load
                  e.target.style.display = 'none';
                }}
              />
            </a>
          </Topbar.Item>
        </Topbar.Left>
        <Topbar.Middle align="left" className="h-full hidden lg:flex">
          <Topbar.Item className="h-full">
            <nav className="flex items-center gap-4 h-full">
              {navItems.map(({ label, path }) => (
                <a
                  key={path}
                  href={`#${path}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(path);
                  }}
                  className={cn(
                    "h-full flex items-center text-gray-600 text-sm font-medium no-underline px-1 relative focus:outline-none hover:text-gray-900 focus:[box-shadow:none] transition-colors",
                    isActive(path) &&
                      "text-gray-900 before:content-[''] before:absolute before:h-[1px] before:bg-[#4253ff] before:bottom-0 before:left-0 before:right-0 before:w-full"
                  )}
                >
                  {label}
                </a>
              ))}
            </nav>
          </Topbar.Item>
        </Topbar.Middle>
        <Topbar.Right>
          <Topbar.Item className="flex gap-3 items-center">
            <Label
              className="text-xs text-gray-500"
            >
              {pluginVersion}
            </Label>
            <Badge
              variant="outline"
              className="text-xs text-gray-500 border-gray-300"
            >
              {__("Core", "surefeedback")}
            </Badge>
          </Topbar.Item>
          <Topbar.Item className="p-1 gap-2">
            <button
              onClick={() => window.open('https://surefeedback.com/docs/', '_blank', 'noopener noreferrer')}
              className="p-0 focus:[box-shadow:none] [box-shadow:none] text-gray-500 hover:text-gray-700 focus:outline-none"
              title={__("Knowledge Base", "surefeedback")}
            >
              <BookOpen className="size-4" />
            </button>
          </Topbar.Item>
          <Topbar.Item className="p-1 gap-2">
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-0 focus:[box-shadow:none] [box-shadow:none] text-gray-500 hover:text-gray-700 focus:outline-none"
                  title={__("Help", "surefeedback")}
                >
                  <HelpCircle className="size-4" />
                </button>
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
                    icon: <Headphones />,
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
          </Topbar.Item>
        </Topbar.Right>
      </Topbar>
    </div>
  );
};

export default NavMenu;
