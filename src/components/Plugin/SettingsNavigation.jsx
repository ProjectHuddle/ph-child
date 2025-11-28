import React from 'react';
import { ShieldCheck, Users, Palette } from 'lucide-react';
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
    name: __('User Permissions', 'surefeedback'),
    slug: 'permissions',
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    name: __('Commenting', 'surefeedback'),
    slug: 'commenting',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: __('White Label', 'surefeedback'),
    slug: 'white-label',
    icon: <Palette className="w-5 h-5" />,
  },
];

const NavLink = ({ label, path, icon: Icon, isActive }) => {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    // Navigate based on path
    if (path === 'permissions') {
      router.navigate('#settings?tab=permissions');
      window.location.hash = '#settings?tab=permissions';
    } else if (path === 'commenting') {
      router.navigate('#settings?tab=commenting');
      window.location.hash = '#settings?tab=commenting';
    } else if (path === 'white-label') {
      router.navigate('#settings?tab=white-label');
      window.location.hash = '#settings?tab=white-label';
    }
  };

  const getHref = () => {
    return `#settings?tab=${path}`;
  };

  return (
    <a
      href={getHref()}
      onClick={handleClick}
      className={`flex items-start gap-3.5 px-2.5 py-2 rounded-md transition-colors text-gray-600 hover:bg-gray-50 no-underline hover:no-underline focus:outline-none focus:ring-1 focus:ring-blue-500 w-full ${
        isActive ? 'bg-gray-50 text-gray-900' : ''
      }`}
    >
      <span
        className={`flex-shrink-0 mt-0.5 ${
          isActive ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        {Icon}
      </span>
      <span className="text-base font-normal break-words">{label}</span>
    </a>
  );
};

const SettingsNavigation = ({ activeTab = 'permissions' }) => {
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

export default SettingsNavigation;

