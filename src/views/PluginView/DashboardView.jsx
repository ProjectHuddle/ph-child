import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import { CheckCircle, AlertTriangle, ExternalLink, Users, MessageSquare, Settings as SettingsIcon, Palette, BarChart3, Shield, Check, Ticket, HelpCircle, Star, Plus, X, Sparkles, RefreshCw, LogOut } from 'lucide-react';
import { getConnectionType } from '../../utils/connectionType.js';
import { NavLink, useRouter } from '../../utils/Router.jsx';
import { toast } from '../../components/ui/toast.jsx';
import apiGateway from '../../api/gateway.js';
import { WORDPRESS_API } from '../../api/apiurls.js';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

/**
 * Plugin Dashboard View - Similar to SureForms Dashboard
 * Two-column layout with left sidebar content and right sidebar actions
 */
const PluginDashboardView = () => {
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [isLoading, setIsLoading] = useState(true);
  const [popupVideo, setPopupVideo] = useState(null);
  const [showSaaSNotice, setShowSaaSNotice] = useState(true);
  const [pluginStatuses, setPluginStatuses] = useState({
    suremail: 'activated',
    ottokit: 'activated',
    ultimate_addons: 'install',
    starter_templates: 'install'
  });

  // Plugin data configuration
  const pluginsData = [
    {
      key: 'suremail',
      name: 'SureMail',
      description: __('Free and easy SMTP mails plugin.', 'surefeedback'),
      icon: 'assets/images/plugins/suremail.svg',
      iconType: 'svg'
    },
    {
      key: 'ottokit',
      name: 'OttoKit',
      description: __('No-code automation tool for WordPress.', 'surefeedback'),
      icon: 'assets/images/settings/ottokit.png',
      iconType: 'png'
    },
    {
      key: 'ultimate_addons',
      name: 'Ultimate Addons for Elementor',
      description: __('Build modern websites with elementor addons.', 'surefeedback'),
      icon: 'assets/images/plugins/ultimate-addons.svg',
      iconType: 'svg'
    },
    {
      key: 'starter_templates',
      name: 'Starter Templates',
      description: __('Build your dream website in minutes with AI.', 'surefeedback'),
      icon: 'assets/images/plugins/starter-templates.svg',
      iconType: 'svg'
    }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPopupVideo(null);
      }
    };
    if (popupVideo) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [popupVideo]);

  const loadDashboardData = async () => {
    try {
      const status = getConnectionType();
      setConnectionStatus(status);
      
      // Load plugin statuses
      await loadPluginStatuses();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setConnectionStatus('none');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPluginStatuses = async () => {
    try {
      const response = await apiGateway.get(
        WORDPRESS_API.BASE() + '/plugins/status',
        { useWpNonce: true }
      );
      
      if (response.success) {
        setPluginStatuses(response.data);
      }
    } catch (error) {
      console.error('Error loading plugin statuses:', error);
    }
  };

  const handlePluginAction = async (pluginKey, action) => {
    try {
      // Determine the action based on current status
      let actionToPerform = action;
      const currentStatus = pluginStatuses[pluginKey];
      
      // If action is 'activate' but plugin is not installed, try install first
      if (action === 'activate' && currentStatus === 'install') {
        actionToPerform = 'install';
      }
      
      const response = await apiGateway.post(
        WORDPRESS_API.BASE() + '/plugins/action',
        {
          plugin: pluginKey,
          action: actionToPerform
        },
        { useWpNonce: true }
      );

      if (response.success) {
        const newStatus = response.data.new_status || currentStatus;
        setPluginStatuses(prev => ({
          ...prev,
          [pluginKey]: newStatus
        }));
        toast.success(response.message);
        
        // If install was successful and plugin is now installed but not activated, try to activate
        if (actionToPerform === 'install' && newStatus === 'installed') {
          // Auto-activate after install
          setTimeout(async () => {
            try {
              const activateResponse = await apiGateway.post(
                WORDPRESS_API.BASE() + '/plugins/action',
                {
                  plugin: pluginKey,
                  action: 'activate'
                },
                { useWpNonce: true }
              );
              
              if (activateResponse.success) {
                setPluginStatuses(prev => ({
                  ...prev,
                  [pluginKey]: activateResponse.data.new_status || 'activated'
                }));
                toast.success(activateResponse.message);
              }
            } catch (err) {
              console.error('Error activating plugin:', err);
            }
          }, 500);
        }
      } else {
        toast.error(response.message || __('Plugin action failed', 'surefeedback'));
      }
    } catch (error) {
      console.error('Error performing plugin action:', error);
      toast.error(__('An error occurred while performing the action', 'surefeedback'));
    }
  };

  const isConnected = connectionStatus !== 'none';
  const connectionData = window.sureFeedbackAdmin?.connection || {};
  const router = useRouter();

  const handleDisconnect = () => {
    if (confirm(__('Are you sure you want to disconnect? This will remove all connection settings.', 'surefeedback'))) {
      const disconnectUrl = window.sureFeedbackAdmin?.adminUrl + 
        '?page=feedback-connection-options&ph-child-site-disconnect=1&ph-child-site-disconnect-nonce=' +
        (window.sureFeedbackAdmin?.disconnect_nonce || '');
      window.location.href = disconnectUrl;
    }
  };

  const handleReconnect = () => {
    router.navigate('plugin-connection');
    window.location.hash = 'plugin-connection';
  };

  const getStatusInfo = () => {
    if (connectionStatus === 'legacy') {
      return {
        status: 'connected',
        title: __('Website Connected Successfully!', 'surefeedback'),
        description: __('Your site is connected using the legacy plugin method. Start gathering client feedback without friction.', 'surefeedback'),
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        status: 'not_connected',
        title: __('Connect to SureFeedback', 'surefeedback'),
        description: __('Connect your site to start collecting valuable feedback from your clients and visitors.', 'surefeedback'),
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4253ff]"></div>
      </div>
    );
  }

  // Left sidebar content
  const leftSidebarContent = (
    <>
      {/* Welcome Section - Similar to SureForms */}
      <div className="w-full bg-white p-4 gap-8 shadow-sm rounded-xl border border-gray-200" style={{ fontFamily: "'Figtree', sans-serif" }}>
        <div className="grid grid-cols-12 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-4 p-2 col-span-12 md:col-span-7 lg:col-span-7">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold p-0 m-0 text-xl [&>*]:text-xl gap-1.5">
                {__('Welcome to SureFeedback!', 'surefeedback')}
              </h3>
              <p className="text-base font-normal text-gray-600" style={{ fontFamily: "'Figtree', sans-serif" }}>
                SureFeedback makes it easy to collect and manage customer feedback, helping you take action and improve satisfaction with less effort, driving smarter decisions and continuous product or service improvement.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <NavLink to="plugin-connection" className="no-underline">
                <Button 
                  size="default" 
                  className="bg-[#4253ff] hover:bg-[#3142ef] text-white shadow-sm gap-1 px-6 py-2.5"
                >
                  <span>{isConnected ? __('Manage Connection', 'surefeedback') : __('Connect Now', 'surefeedback')}</span>
                  <Plus className="w-4 h-4" />
                </Button>
              </NavLink>
              <Button 
                variant="ghost" 
                size="default"
                className="gap-1 text-gray-700 hover:text-gray-900 hover:bg-transparent px-6 py-2.5"
                onClick={() => window.open('https://surefeedback.com/docs/', '_blank')}
              >
                <span>{__('Read Full Guide', 'surefeedback')}</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Column - Video Thumbnail */}
          <div className="col-span-12 md:col-span-5 lg:col-span-5 p-2">
            <div
              className="relative aspect-video cursor-pointer group rounded-lg border border-gray-200 overflow-hidden"
              onClick={() => {
                setPopupVideo('https://www.youtube.com/embed/it16jGnZBus?showinfo=0&rel=0&autoplay=1');
              }}
            >
              <img
                src="https://img.youtube.com/vi/it16jGnZBus/hqdefault.jpg"
                alt={__('SureFeedback Video Thumbnail', 'surefeedback')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 flex items-center justify-center bg-black bg-opacity-50 group-hover:bg-opacity-80 transition-all duration-300 rounded-full">
                  <svg
                    className="w-8 h-8 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M8 5v14l11-7L8 5z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Popup Modal */}
      {popupVideo && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 cursor-pointer z-[9999] w-full"
          onClick={() => setPopupVideo(null)}
        >
          {/* Close Button */}
          <div className="absolute top-10 right-8 text-white cursor-pointer">
            <X
              size={24}
              onClick={(e) => {
                e.stopPropagation();
                setPopupVideo(null);
              }}
            />
          </div>

          <div
            className="relative rounded-lg shadow-lg cursor-default w-full max-w-[80%] h-[760px]"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full aspect-video rounded-lg"
              src={popupVideo}
              title={__('SureFeedback: Customer Feedback Made Simple', 'surefeedback')}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <Card className="bg-white border-2 border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm border border-gray-200">
              <StatusIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-1.5">
                {statusInfo.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                {statusInfo.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        {isConnected && (
          <CardContent className="pt-0 pb-4 px-6">
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="text-gray-600 font-medium flex-shrink-0">{__('Parent Site URL:', 'surefeedback')}</span>
                <span className="font-mono text-gray-900 break-all text-right">{connectionData.site_data?.site_url || '--'}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-gray-600 font-medium">{__('Project ID:', 'surefeedback')}</span>
                <span className="font-mono text-gray-900">{connectionData.site_id || '--'}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600 font-medium">{__('Last verified:', 'surefeedback')}</span>
                <Badge className="bg-[#4253ff] text-white border-0 text-xs font-medium px-2.5 py-0.5">
                  {__('Active', 'surefeedback')}
                </Badge>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleReconnect}
                  className="h-10 px-6 border-[#4253ff] text-[#4253ff] hover:bg-[#4253ff]/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {__('Reconnect', 'surefeedback')}
                </Button>
                <Button
                  variant="outline"
                  size="default"
                  onClick={handleDisconnect}
                  className="h-10 px-6 border-red-300 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {__('Disconnect', 'surefeedback')}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

    </>
  );

  // Right sidebar content - copying SureForms structure
  const rightSidebarContent = (
    <>
      {/* 1. Extend Your Website - Similar to SureForms ExtendTab */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-3 gap-2 shadow-sm">
        <div className="p-1 gap-2">
          <div className="text-sm font-semibold text-gray-900">
            {__('Extend Your Website', 'surefeedback')}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-50 rounded-lg">
          {pluginsData.map((plugin) => {
            const status = pluginStatuses[plugin.key];
            const getButtonStyles = () => {
              if (status === 'activated') {
                return 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200';
              } else if (status === 'installed') {
                return 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200';
              }
              return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';
            };

            const getButtonText = () => {
              if (status === 'activated') {
                return __('Activated', 'surefeedback');
              } else if (status === 'installed') {
                return __('Activate', 'surefeedback');
              }
              return __('Install & Activate', 'surefeedback');
            };

            const handleButtonClick = () => {
              if (status === 'activated') {
                handlePluginAction(plugin.key, 'deactivate');
              } else if (status === 'installed') {
                handlePluginAction(plugin.key, 'activate');
              } else {
                handlePluginAction(plugin.key, 'install');
              }
            };

            return (
              <div key={plugin.key} className="flex shadow-sm rounded-md bg-white flex-1">
                <div className="flex flex-col gap-1 p-2">
                  <div className="flex flex-col gap-1 pb-1">
                    <div className="flex items-center gap-1.5 p-1">
                      <img
                        className="w-6 h-6"
                        src={window.sureFeedbackAdmin?.pluginUrl + plugin.icon}
                        alt={plugin.name}
                      />
                      <div className="text-sm font-medium">{plugin.name}</div>
                    </div>
                    <div className="flex flex-col gap-0.5 text-gray-800 p-1">
                      <span className="font-normal text-xs leading-5">
                        {plugin.description}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 pt-1 px-1 mt-auto pb-1">
                    <Button
                      className={`w-fit text-xs ${getButtonStyles()}`}
                      variant="outline"
                      size="xs"
                      onClick={handleButtonClick}
                    >
                      {getButtonText()}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Quick Access - Exact copy from SureForms */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-3 gap-2 shadow-sm">
        <div className="p-1 gap-2">
          <div className="text-sm font-semibold text-gray-900">
            {__('Quick Access', 'surefeedback')}
          </div>
        </div>
        <div className="flex flex-col bg-gray-50 gap-1 p-1 rounded-lg">
          {/* Guided Setup */}
          <div className="flex items-center gap-1 p-3 rounded-md bg-white shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                <SettingsIcon className="w-4 h-4" />
              </div>
              <div className="flex px-1 gap-2">
                <NavLink to="settings" className="no-underline hover:underline">
                  <div className="text-sm cursor-pointer">
                    {__('Guided Setup', 'surefeedback')}
                  </div>
                </NavLink>
              </div>
            </div>
          </div>

          {/* Open Support Ticket */}
          <div className="flex items-center gap-1 p-3 rounded-md bg-white shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                <Ticket className="w-4 h-4" />
              </div>
              <div className="flex px-1 gap-2">
                <a
                  className="no-underline hover:underline"
                  href="https://surefeedback.com/contact/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-sm cursor-pointer">
                    {__('Open Support Ticket', 'surefeedback')}
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Help Center */}
          <div className="flex items-center gap-1 p-3 rounded-md bg-white shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="flex px-1 gap-2">
                <a
                  className="no-underline hover:underline"
                  href="https://surefeedback.com/docs/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-sm cursor-pointer">
                    {__('Help Center', 'surefeedback')}
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Join Community */}
          <div className="flex items-center gap-1 p-3 rounded-md bg-white shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="flex px-1 gap-2">
                <a
                  className="no-underline hover:underline"
                  href="https://www.facebook.com/groups/surecrafted"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-sm cursor-pointer">
                    {__('Join our Community on Facebook', 'surefeedback')}
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Leave Review */}
          <div className="flex items-center gap-1 p-3 rounded-md bg-white shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                <Star className="w-4 h-4" />
              </div>
              <div className="flex px-1 gap-2">
                <a
                  className="no-underline hover:underline"
                  href="https://wordpress.org/support/plugin/surefeedback/reviews/?rate=5#new-post"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="text-sm cursor-pointer">
                    {__('Leave Us a Review', 'surefeedback')}
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );

  return (
    <div className="p-5 pb-8 xl:p-8 w-full bg-gray-50 min-h-screen">
      {/* SaaS Platform Launch Notice */}
      {showSaaSNotice && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert className="bg-gradient-to-r from-[#4253ff] to-[#3142ef] border-[#4253ff] text-white shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
            <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <p className="font-semibold text-base mb-1">
                  {__('🎉 Exciting News: We\'ve Launched Our SaaS Platform!', 'surefeedback')}
                </p>
                <p className="text-sm text-white/90">
                  {__('Experience enhanced features, better performance, and seamless collaboration with our new SaaS platform.', 'surefeedback')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => window.open('https://surefeedback.com/saas', '_blank', 'noopener noreferrer')}
                  className="bg-white text-[#4253ff] hover:bg-gray-100 font-medium px-4 py-2 h-auto"
                  size="sm"
                >
                  {__('Learn More', 'surefeedback')}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
                <button
                  onClick={() => setShowSaaSNotice(false)}
                  className="text-white/80 hover:text-white focus:outline-none p-1"
                  aria-label={__('Dismiss notice', 'surefeedback')}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Two-column grid layout similar to SureForms */}
      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
        {/* Left Column - Main Content (8/12) */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
          {leftSidebarContent}
        </div>

        {/* Right Column - Sidebar Actions (4/12) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
          {rightSidebarContent}
        </div>
      </div>
    </div>
  );
};

export default PluginDashboardView;
