import React from 'react';
import { Users, Settings, AlertTriangle } from 'lucide-react';
import { useRouter } from '../../utils/Router.jsx';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

const getNavigation = () => [
  {
    name: __('User Roles', 'surefeedback'),
    slug: 'user-roles',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: __('Widget Control', 'surefeedback'),
    slug: 'widget-control',
    icon: <Settings className="w-5 h-5" />,
  },
  {
    name: __('Danger Zone', 'surefeedback'),
    slug: 'danger-zone',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
];

const NavLink = ({ label, path, icon: Icon, isActive }) => {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    // Navigate to settings with the sub-tab
    router.navigate(`#settings?tab=${path}`);
    window.location.hash = `#settings?tab=${path}`;
  };

  const getHref = () => {
    return `#settings?tab=${path}`;
  };

  return (
    <a
      href={getHref()}
      onClick={handleClick}
      className={`flex items-start gap-3.5 px-2.5 py-2 rounded-md transition-colors text-gray-600 hover:bg-[#4253ff]/10 no-underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-[#4253ff] w-full ${
        isActive ? 'bg-[#4253ff]/10 text-gray-900' : ''
      }`}
    >
      <span
        className={`flex-shrink-0 mt-0.5 ${
          isActive ? 'text-[#4253ff]' : 'text-gray-500'
        }`}
      >
        {Icon}
      </span>
      <span className="text-base font-normal break-words">{label}</span>
    </a>
  );
};

const SaaSSettingsNavigation = ({ activeTab = 'user-roles' }) => {
  const navigation = getNavigation();
  
  return (
    <div className="flex-shrink-0 bg-white">
      <div className="px-4 pb-4 pt-2">
        <nav className="space-y-2 w-[215px]">
          {navigation.map((item) => (
            <NavLink
              key={item.slug}
              label={item.name}
              path={item.slug}
              icon={item.icon}
              isActive={activeTab === item.slug}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SaaSSettingsNavigation;

