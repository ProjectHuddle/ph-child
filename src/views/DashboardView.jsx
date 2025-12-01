import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Button } from '../components/ui/button.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Alert, AlertDescription } from '../components/ui/alert.jsx';
import { CheckCircle, AlertTriangle, ExternalLink, MessageSquare, Settings as SettingsIcon, Ticket, HelpCircle, Star, Plus, X, RefreshCw, LogOut, ChevronRight, Link2, Sparkles } from 'lucide-react';
import { getConnectionType } from '../utils/connectionType.js';
import { NavLink, useRouter } from '../utils/Router.jsx';
import { toast } from '../components/ui/toast.jsx';
import apiGateway from '../api/gateway.js';
import { WORDPRESS_API, CONNECTION_API } from '../api/apiurls.js';
import connectionService from '../services/connectionService.js';

const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

const PLUGINS_CONFIG = [
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

const VIDEO_ID = 'it16jGnZBus';
const VIDEO_URL = `https://www.youtube.com/embed/${VIDEO_ID}?showinfo=0&rel=0&autoplay=1`;
const VIDEO_THUMBNAIL = `https://img.youtube.com/vi/${VIDEO_ID}/hqdefault.jpg`;

const DashboardView = () => {
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [isLoading, setIsLoading] = useState(true);
  const [popupVideo, setPopupVideo] = useState(null);

  const [showSaaSNotice, setShowSaaSNotice] = useState(() => {
    try {
      const dismissed = localStorage.getItem('surefeedback_saas_notice_dismissed');
      return dismissed !== 'true';
    } catch (e) {
      return true;
    }
  });
  
  const [pluginStatuses, setPluginStatuses] = useState({
    suremail: 'activated',
    ottokit: 'activated',
    ultimate_addons: 'install',
    starter_templates: 'install'
  });
  const [saasConnectionStatus, setSaasConnectionStatus] = useState(null);

  const router = useRouter();

  const connectionTypePreference = window.sureFeedbackAdmin?.connectionTypePreference || '';
  const isSaaS = useMemo(() =>
    connectionStatus === 'saas' || connectionTypePreference === 'saas',
    [connectionStatus, connectionTypePreference]
  );
  const isPlugin = useMemo(() => 
    connectionStatus === 'legacy' || connectionTypePreference === 'plugin',
    [connectionStatus, connectionTypePreference]
  );
  const isConnected = useMemo(() => connectionStatus !== 'none', [connectionStatus]);

  const getSaaSConnectionData = useCallback(() => {
    if (saasConnectionStatus) return saasConnectionStatus;
    
    const storedConnection = window.sureFeedbackAdmin?.connection;
    if (storedConnection?.type === 'saas' || storedConnection?.is_saas) {
      return storedConnection;
    }
    return null;
  }, [saasConnectionStatus]);

  const getSaaSSiteUrl = useCallback(() => {
    const connectionData = getSaaSConnectionData();
    if (connectionData?.site_url) return connectionData.site_url;
    return window.sureFeedbackAdmin?.siteUrl || window.location.origin;
  }, [getSaaSConnectionData]);

  const connectionData = useMemo(() => {
    const pluginConnectionData = window.sureFeedbackAdmin?.connection || {};
    return isSaaS ? (getSaaSConnectionData() || pluginConnectionData) : pluginConnectionData;
  }, [isSaaS, getSaaSConnectionData]);

  const loadSaaSConnectionStatus = useCallback(async () => {
    try {
      const response = await connectionService.getConnectionStatus();
      setSaasConnectionStatus(response);
    } catch (error) {
      setSaasConnectionStatus(null);
    }
  }, []);

  const loadPluginStatuses = useCallback(async () => {
    try {
      const response = await apiGateway.get(
        WORDPRESS_API.BASE() + '/plugins/status',
        { useWpNonce: true }
      );
      
      if (response.success && response.data) {
        setPluginStatuses(response.data);
      }
    } catch (error) {
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const status = getConnectionType();
      setConnectionStatus(status);

      if (status === 'saas' || connectionTypePreference === 'saas') {
        await loadSaaSConnectionStatus();
      }

      await loadPluginStatuses();
    } catch (error) {
      setConnectionStatus('none');
    } finally {
      setIsLoading(false);
    }
  }, [loadSaaSConnectionStatus, loadPluginStatuses, connectionTypePreference]);

  const handlePluginAction = useCallback(async (pluginKey, action) => {
    try {
      const currentStatus = pluginStatuses[pluginKey];
      let actionToPerform = action;
      
      if (action === 'activate' && currentStatus === 'install') {
        actionToPerform = 'install';
      }
      
      const response = await apiGateway.post(
        WORDPRESS_API.BASE() + '/plugins/action',
        { plugin: pluginKey, action: actionToPerform },
        { useWpNonce: true }
      );

      if (response.success) {
        const newStatus = response.data.new_status || currentStatus;
        setPluginStatuses(prev => ({ ...prev, [pluginKey]: newStatus }));
        toast.success(response.message);

        if (actionToPerform === 'install' && newStatus === 'installed') {
          setTimeout(async () => {
            try {
              const activateResponse = await apiGateway.post(
                WORDPRESS_API.BASE() + '/plugins/action',
                { plugin: pluginKey, action: 'activate' },
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
            }
          }, 500);
        }
      } else {
        toast.error(response.message || __('Plugin action failed', 'surefeedback'));
      }
    } catch (error) {
      toast.error(__('An error occurred while performing the action', 'surefeedback'));
    }
  }, [pluginStatuses]);

  const handleDisconnect = useCallback(async () => {
    const confirmed = confirm(__('Are you sure you want to disconnect? This will remove all connection settings.', 'surefeedback'));
    if (!confirmed) return;

    if (isSaaS) {
      try {
        connectionService.disconnect();

        try {
          await apiGateway.post('connection/reset', {}, { useWpNonce: true });
        } catch (e) {
        }

        toast.success(__('Site disconnected successfully! Redirecting...', 'surefeedback'));
        setTimeout(() => {
          window.location.href = window.sureFeedbackAdmin.admin_url + 'admin.php?page=feedback-connection-options';
        }, 1500);
      } catch (error) {
        toast.error(__('An error occurred while disconnecting. Please try again.', 'surefeedback'));
      }
    } else {
      const disconnectUrl = window.sureFeedbackAdmin?.adminUrl + 
        '?page=feedback-connection-options&ph-child-site-disconnect=1&ph-child-site-disconnect-nonce=' +
        (window.sureFeedbackAdmin?.disconnect_nonce || '');
      window.location.href = disconnectUrl;
    }
  }, [isSaaS]);

  const handleGenerateMagicLink = useCallback(async () => {
    try {
      // Get site_id from connection data
      const siteId = saasConnectionStatus?.site_id || 
                     window.sureFeedbackAdmin?.connection?.saas_site_id ||
                     window.sureFeedbackAdmin?.saas_site_id;
      
      if (!siteId) {
        toast.error(__('Site ID not found. Please reconnect your site.', 'surefeedback'));
        return;
      }

      // Get bearer token
      const bearerToken = connectionService.getBearerToken() || 
                          window.sureFeedbackAdmin?.bearerToken;
      
      if (!bearerToken) {
        toast.error(__('Authentication token not found. Please reconnect your site.', 'surefeedback'));
        return;
      }

      // Call API to generate magic link
      const response = await fetch(CONNECTION_API.GENERATE_MAGIC_LINK(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          site_id: siteId,
          expiration_minutes: 60, // 1 hour
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate magic link');
      }

      // Get redirect URL from response
      const redirectUrl = data.data?.redirect_url;
      
      if (!redirectUrl) {
        throw new Error('Redirect URL not found in response');
      }

      // Open redirect URL in new tab
      window.open(redirectUrl, '_blank', 'noopener,noreferrer');
      
      toast.success(__('Magic link generated! Opening in new tab...', 'surefeedback'));
    } catch (error) {
      console.error('Failed to generate magic link:', error);
      toast.error(error.message || __('Failed to generate magic link. Please try again.', 'surefeedback'));
    }
  }, [saasConnectionStatus]);

  const handleConnectWebsite = useCallback(() => {
    // Initiate SaaS connection
    connectionService.initiateConnection();
  }, []);

  const handleGoToDashboard = useCallback(() => {
    if (isSaaS) {
      const appUrl = window.sureFeedbackAdmin?.appBaseUrl || 'https://app.surefeedback.com';
      window.open(appUrl, '_blank');
    } else if (isPlugin && connectionData?.site_data?.site_url && connectionData?.site_id) {
      const dashboardUrl = `${connectionData.site_data.site_url}/wp-admin/post.php?post=${connectionData.site_id}&action=edit`;
      window.open(dashboardUrl, '_blank');
    }
  }, [isSaaS, isPlugin, connectionData]);

  const statusInfo = useMemo(() => {
    if (connectionStatus === 'legacy' || connectionStatus === 'saas') {
      return {
        status: 'connected',
        title: __('Website Connected Successfully!', 'surefeedback'),
        description: isSaaS 
          ? __('Your site is connected to the SureFeedback SaaS platform. Manage your feedback and projects from your dashboard.', 'surefeedback')
          : __('Your site is connected using the legacy plugin method. Start gathering client feedback without friction.', 'surefeedback'),
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    }
    
    return {
      status: 'not_connected',
      title: __('Connect to SureFeedback', 'surefeedback'),
      description: __('Connect your site to start collecting valuable feedback from your clients and visitors.', 'surefeedback'),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    };
  }, [connectionStatus, isSaaS]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (connectionTypePreference === 'saas') {
      const timer = setTimeout(() => {
        loadSaaSConnectionStatus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [connectionTypePreference, loadSaaSConnectionStatus]);

  useEffect(() => {
    if (!popupVideo) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPopupVideo(null);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [popupVideo]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4253ff]"></div>
      </div>
    );
  }

  const StatusIcon = statusInfo.icon;

  return (
    <div className="p-3 pb-8 xl:p-8 w-full bg-gray-50 min-h-screen">
      {showSaaSNotice && (
        <SaaSLaunchNotice onDismiss={() => setShowSaaSNotice(false)} />
      )}

      <div className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-8">
          <WelcomeSection
            isSaaS={isSaaS}
            isConnected={isConnected}
            saasConnectionStatus={saasConnectionStatus}
            onVideoClick={() => setPopupVideo(VIDEO_URL)}
            onConnect={handleConnectWebsite}
            onManageConnection={handleGenerateMagicLink}
          />
          <VideoModal videoUrl={popupVideo} onClose={() => setPopupVideo(null)} />
          {isSaaS && (connectionTypePreference === 'saas' || connectionStatus === 'saas') && !saasConnectionStatus ? (
            <NotConnectedCard onConnect={handleConnectWebsite} />
          ) : (
            <ConnectionStatusCard
              statusInfo={statusInfo}
              StatusIcon={StatusIcon}
              isConnected={isConnected}
              isSaaS={isSaaS}
              connectionData={connectionData}
              getSaaSSiteUrl={getSaaSSiteUrl}
              onReconnect={handleGenerateMagicLink}
              onGoToDashboard={handleGoToDashboard}
              onDisconnect={handleDisconnect}
            />
          )}
        </div>

        <div className="col-span-12 xl:col-span-4 flex flex-col gap-8">
          <ExtendWebsiteSection
            plugins={PLUGINS_CONFIG}
            pluginStatuses={pluginStatuses}
            onPluginAction={handlePluginAction}
          />
          <QuickAccessSection />
        </div>
      </div>
    </div>
  );
};

const SaaSLaunchNotice = ({ onDismiss }) => {
  const handleDismiss = () => {
    try {
      localStorage.setItem('surefeedback_saas_notice_dismissed', 'true');
    } catch (e) {
    }
    onDismiss();
  };

  return (
    <div className="max-w-7xl mx-auto mb-6">
      <Alert className="bg-gradient-to-r from-[#4253ff] to-[#3142ef] border-[#4253ff] text-white shadow-lg">
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
              onClick={handleDismiss}
              className="text-white/80 hover:text-white focus:outline-none p-1"
              aria-label={__('Dismiss notice', 'surefeedback')}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

const WelcomeSection = ({ isSaaS, isConnected, saasConnectionStatus, onVideoClick, onConnect, onManageConnection }) => {
  const actuallyConnected = isSaaS ? (saasConnectionStatus !== null) : isConnected;
  
  return (
    <div className="w-full bg-white p-4 gap-8 shadow-sm rounded-xl border border-gray-200" style={{ fontFamily: "'Figtree', sans-serif" }}>
      <div className="grid grid-cols-12 gap-8 items-center">
        <div className="flex flex-col gap-4 p-2 col-span-12 md:col-span-7 lg:col-span-7">
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold p-0 m-0 text-xl [&>*]:text-xl gap-1.5">
              {__('Welcome to SureFeedback!', 'surefeedback')}
            </h3>
            <p className="text-base font-normal text-gray-600" style={{ fontFamily: "'Figtree', sans-serif" }}>
              {__('SureFeedback makes it easy to collect and manage customer feedback, helping you take action and improve satisfaction with less effort, driving smarter decisions and continuous product or service improvement.', 'surefeedback')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {actuallyConnected ? (
              <Button 
                size="default" 
                className="bg-[#4253ff] hover:bg-[#3142ef] text-white shadow-sm gap-1 px-6 py-2.5"
                onClick={onManageConnection}
              >
                <span>{__('Generate Magic Link', 'surefeedback')}</span>
                <Link2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                size="default" 
                className="bg-[#4253ff] hover:bg-[#3142ef] text-white shadow-sm gap-1 px-6 py-2.5"
                onClick={onConnect}
              >
                <span>{__('Connect Now', 'surefeedback')}</span>
                <Plus className="w-4 h-4" />
              </Button>
            )}
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
      <div className="col-span-12 md:col-span-5 lg:col-span-5 p-2">
        <div
          className="relative aspect-video cursor-pointer group rounded-lg border border-gray-200 overflow-hidden"
          onClick={onVideoClick}
        >
          <img
            src={VIDEO_THUMBNAIL}
            alt={__('SureFeedback Video Thumbnail', 'surefeedback')}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 flex items-center justify-center bg-black bg-opacity-50 group-hover:bg-opacity-80 transition-all duration-300 rounded-full">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};


const VideoModal = ({ videoUrl, onClose }) => {
  if (!videoUrl) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 cursor-pointer z-[9999] w-full"
      onClick={onClose}
    >
      <div className="absolute top-10 right-8 text-white cursor-pointer">
        <X size={24} onClick={(e) => { e.stopPropagation(); onClose(); }} />
      </div>
      <div
        className="relative rounded-lg shadow-lg cursor-default w-full max-w-[80%] h-[760px]"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          className="w-full h-full aspect-video rounded-lg"
          src={videoUrl}
          title={__('SureFeedback: Customer Feedback Made Simple', 'surefeedback')}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

const ConnectionStatusCard = ({
  statusInfo,
  StatusIcon,
  isConnected,
  isSaaS,
  connectionData,
  getSaaSSiteUrl,
  onReconnect,
  onGoToDashboard,
  onDisconnect
}) => (
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
          <ConnectionDetails isSaaS={isSaaS} connectionData={connectionData} getSaaSSiteUrl={getSaaSSiteUrl} />
          <StatusBadge />
          <ConnectionActions
            isSaaS={isSaaS}
            onReconnect={onReconnect}
            onGoToDashboard={onGoToDashboard}
            onDisconnect={onDisconnect}
          />
        </div>
      </CardContent>
    )}
  </Card>
);

const ConnectionDetails = ({ isSaaS, connectionData, getSaaSSiteUrl }) => {
  if (isSaaS) {
    return (
      <>
        <div className="flex items-start justify-between gap-4 text-sm">
          <span className="text-gray-600 font-medium flex-shrink-0">{__('Connection Site:', 'surefeedback')}</span>
          <span className="font-mono text-gray-900 break-all text-right">
            {getSaaSSiteUrl()}
          </span>
        </div>
        {(connectionData?.connection_id || connectionData?.uuid) && (
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-gray-600 font-medium">{__('Connection ID:', 'surefeedback')}</span>
            <span className="font-mono text-gray-900">{connectionData.connection_id || connectionData.uuid}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-600 font-medium">{__('Connection Type:', 'surefeedback')}</span>
          <Badge className="bg-[#4253ff]/10 text-[#4253ff] border-0 text-xs font-medium px-2.5 py-0.5">
            {__('SaaS', 'surefeedback')}
          </Badge>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 text-sm">
        <span className="text-gray-600 font-medium flex-shrink-0">{__('Parent Site URL:', 'surefeedback')}</span>
        <span className="font-mono text-gray-900 break-all text-right">
          {connectionData.site_data?.site_url || '--'}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-gray-600 font-medium">{__('Project ID:', 'surefeedback')}</span>
        <span className="font-mono text-gray-900">{connectionData.site_id || '--'}</span>
      </div>
    </>
  );
};

const StatusBadge = () => (
  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
    <span className="text-sm text-gray-600 font-medium">{__('Status:', 'surefeedback')}</span>
    <Badge className="bg-[#4253ff] text-white border-0 text-xs font-medium px-2.5 py-0.5">
      {__('Active', 'surefeedback')}
    </Badge>
  </div>
);

const ConnectionActions = ({ isSaaS, onReconnect, onGoToDashboard, onDisconnect }) => (
  <div className="flex items-center justify-center gap-4 pt-4">
    <Button
      variant="outline"
      size="default"
      onClick={onReconnect}
      className="h-10 px-6 border-[#4253ff] text-[#4253ff] hover:bg-[#4253ff]/10"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      {__('Reconnect', 'surefeedback')}
    </Button>
    {isSaaS && (
      <Button
        variant="outline"
        size="default"
        onClick={onGoToDashboard}
        className="h-10 px-6 border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        {__('Go to Dashboard', 'surefeedback')}
      </Button>
    )}
    <Button
      variant="outline"
      size="default"
      onClick={onDisconnect}
      className="h-10 px-6 border-red-300 text-red-600 hover:bg-red-50"
    >
      <LogOut className="w-4 h-4 mr-2" />
      {__('Disconnect', 'surefeedback')}
    </Button>
  </div>
);

const NotConnectedCard = ({ onConnect }) => {
  return (
    <Card className="bg-white border-2 border-gray-200 rounded-xl shadow-sm">
      <CardContent className="flex flex-col justify-center items-center space-y-3 px-6 py-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <X className="w-7 h-7 text-red-600" />
        </div>

        <div className="space-y-1.5 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {__('SureFeedback Not Connected!', 'surefeedback')}
          </h2>
          <p className="text-gray-600 text-sm max-w-[400px] mx-auto leading-relaxed">
            {__(
              'Click "Connect Website" to authorize this website with SureFeedback and start collecting valuable feedback from your clients and visitors.',
              'surefeedback'
            )}
          </p>
        </div>

        <Button
          onClick={onConnect}
          className="bg-[#4253ff] hover:bg-[#3142ef] text-white px-6 py-2 text-sm rounded-lg font-medium shadow-sm mt-1"
        >
          {__('Connect Website', 'surefeedback')}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const ExtendWebsiteSection = ({ plugins, pluginStatuses, onPluginAction }) => {
  const getPluginButtonConfig = (status) => {
    const configs = {
      activated: {
        styles: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
        text: __('Activated', 'surefeedback'),
        action: 'deactivate',
        disabled: false
      },
      installed: {
        styles: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-200',
        text: __('Activate', 'surefeedback'),
        action: 'activate',
        disabled: false
      },
      default: {
        styles: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
        text: __('Install & Activate', 'surefeedback'),
        action: 'install',
        disabled: false
      }
    };
    return configs[status] || configs.default;
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-3 gap-2 shadow-sm">
      <div className="p-1 gap-2">
        <div className="text-sm font-semibold text-gray-900">
          {__('Extend Your Website', 'surefeedback')}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-50 rounded-lg">
        {plugins.map((plugin) => {
          const status = pluginStatuses[plugin.key] || 'install';
          const config = getPluginButtonConfig(status);

          return (
            <div key={plugin.key} className="flex shadow-sm rounded-md bg-white flex-1">
              <div className="flex flex-col gap-1 p-2 w-full">
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
                    className={`w-fit text-xs ${config.styles}`}
                    variant="outline"
                    size="xs"
                    onClick={() => onPluginAction(plugin.key, config.action)}
                    disabled={config.disabled}
                  >
                    {config.text}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const QuickAccessSection = () => {
  const quickLinks = [
    {
      icon: Ticket,
      label: __('Open Support Ticket', 'surefeedback'),
      href: 'https://surefeedback.com/contact/',
      isInternal: false
    },
    {
      icon: HelpCircle,
      label: __('Help Center', 'surefeedback'),
      href: 'https://surefeedback.com/docs/',
      isInternal: false
    },
    {
      icon: Star,
      label: __('Leave Us a Review', 'surefeedback'),
      href: 'https://wordpress.org/support/plugin/surefeedback/reviews/?rate=5#new-post',
      isInternal: false
    }
  ];

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-3 gap-2 shadow-sm">
      <div className="p-1 gap-2">
        <div className="text-sm font-semibold text-gray-900">
          {__('Quick Access', 'surefeedback')}
        </div>
      </div>
      <div className="flex flex-col bg-gray-50 gap-1 p-1 rounded-lg">
        {quickLinks.map((link) => (
          <div key={link.label} className="flex items-center gap-1 p-3 rounded-md bg-white shadow-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                <link.icon className="w-4 h-4" />
              </div>
              <div className="flex px-1 gap-2">
                {link.isInternal ? (
                  <NavLink to={link.href.replace('#', '')} className="no-underline hover:underline">
                    <div className="text-sm cursor-pointer">{link.label}</div>
                  </NavLink>
                ) : (
                  <a
                    className="no-underline hover:underline"
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="text-sm cursor-pointer">{link.label}</div>
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;
