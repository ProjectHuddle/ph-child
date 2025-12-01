import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { CheckCircle, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { toast } from '../../components/ui/toast.jsx';
import apiGateway from '../../api/gateway.js';
import { WORDPRESS_API } from '../../api/apiurls.js';

const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

const PluginConnectionView = () => {
  const [formData, setFormData] = useState({
    parent_url: '',
    project_id: '',
    api_key: '',
    access_token: '',
    signature: '',
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionData, setConnectionData] = useState(null);

  useEffect(() => {
    loadConnectionData();
  }, []);

  const loadConnectionData = async () => {
    try {
      setIsLoading(true);
      const connection = window.sureFeedbackAdmin?.connection || {};
      
      if (connection.site_id && connection.api_key) {
        setFormData({
          parent_url: connection.site_data?.site_url || '',
          project_id: connection.site_id || '',
          api_key: connection.api_key || '',
          access_token: connection.access_token || '',
          signature: connection.signature || '',
        });
        setIsConnected(true);
        setConnectionData(connection);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const canConnect = () => {
    return formData.parent_url &&
           formData.project_id &&
           formData.api_key &&
           formData.access_token &&
           formData.signature;
  };

  const handleConnect = async () => {
    if (!canConnect()) {
      toast.error(__('Please fill in all required fields', 'surefeedback'));
      return;
    }

    try {
      setIsSaving(true);

      const response = await apiGateway.post('settings/connection', {
        ph_child_parent_url: formData.parent_url,
        ph_child_id: parseInt(formData.project_id),
        ph_child_api_key: formData.api_key,
        ph_child_access_token: formData.access_token,
        ph_child_signature: formData.signature,
      });

      if (response.success) {
        toast.success(__('Site connected successfully!', 'surefeedback'));
        setIsConnected(true);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(response.message || __('Failed to connect', 'surefeedback'));
      }
    } catch (error) {
      toast.error(__('An error occurred while connecting', 'surefeedback'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsLoading(true);
      const response = await apiGateway.post(WORDPRESS_API.BASE() + '/connection/test', {
        parent_url: formData.parent_url,
        access_token: formData.access_token,
      });

      if (response.success) {
        toast.success(__('Connection test successful!', 'surefeedback'));
      } else {
        toast.error(response.message || __('Connection test failed', 'surefeedback'));
      }
    } catch (error) {
      toast.error(__('Failed to test connection', 'surefeedback'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm(__('Are you sure you want to disconnect? This will remove all connection settings.', 'surefeedback'))) {
      const disconnectUrl = window.sureFeedbackAdmin?.adminUrl + 
        '?page=feedback-connection-options&ph-child-site-disconnect=1&ph-child-site-disconnect-nonce=' +
        (window.sureFeedbackAdmin?.disconnect_nonce || '');
      window.location.href = disconnectUrl;
    }
  };

  const visitDashboard = () => {
    if (connectionData?.site_data?.site_url && connectionData?.site_id) {
      const dashboardUrl = `${connectionData.site_data.site_url}/wp-admin/post.php?post=${connectionData.site_id}&action=edit`;
      window.open(dashboardUrl, '_blank');
    }
  };

  if (isLoading && !isConnected) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 bg-white min-h-screen">
      {isConnected && connectionData ? (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {__('Website Connected Successfully!', 'surefeedback')}
              </h1>
              <p className="text-base text-gray-600">
                {__('Your site is now linked with SureFeedback. Start gathering client feedback without friction.', 'surefeedback')}
              </p>
            </div>
          </div>

          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {__('Connection Site', 'surefeedback')}
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    {formData.parent_url || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {__('Project ID', 'surefeedback')}
                  </span>
                  <span className="text-sm font-mono text-gray-900">
                    {formData.project_id || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {__('Status', 'surefeedback')}
                  </span>
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    {__('Active', 'surefeedback')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="default"
              onClick={visitDashboard}
              className="h-10 px-6"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {__('Reconnect', 'surefeedback')}
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={handleDisconnect}
              className="h-10 px-6 border-red-300 text-red-600 hover:bg-red-50"
            >
              {__('Disconnect', 'surefeedback')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-orange-100 rounded-md flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-orange-900">
                  {__('Connect to SureFeedback', 'surefeedback')}
                </h3>
                <p className="text-xs text-orange-700">
                  {__('Enter your connection details to link this site', 'surefeedback')}
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{__('Connection Details', 'surefeedback')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="parent_url" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  {__('Parent Site URL', 'surefeedback')}
                </Label>
                <Input
                  id="parent_url"
                  type="url"
                  value={formData.parent_url}
                  onChange={(e) => handleInputChange('parent_url', e.target.value)}
                  disabled={isSaving}
                  placeholder="https://your-dashboard-site.com"
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {__('The URL of your SureFeedback dashboard site.', 'surefeedback')}
                </p>
              </div>

              <div>
                <Label htmlFor="project_id" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  {__('Project ID', 'surefeedback')}
                </Label>
                <Input
                  id="project_id"
                  type="number"
                  value={formData.project_id}
                  onChange={(e) => handleInputChange('project_id', e.target.value)}
                  disabled={isSaving}
                  placeholder="123"
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {__('The project ID from your SureFeedback dashboard.', 'surefeedback')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="api_key" className="text-xs font-medium text-gray-700 mb-1.5 block">
                    {__('API Key', 'surefeedback')}
                  </Label>
                  <Input
                    id="api_key"
                    value={formData.api_key}
                    onChange={(e) => handleInputChange('api_key', e.target.value)}
                    disabled={isSaving}
                    placeholder="your-api-key"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {__('The public API key for script loading.', 'surefeedback')}
                  </p>
                </div>

                <div>
                  <Label htmlFor="access_token" className="text-xs font-medium text-gray-700 mb-1.5 block">
                    {__('Access Token', 'surefeedback')}
                  </Label>
                  <Input
                    id="access_token"
                    type="password"
                    value={formData.access_token}
                    onChange={(e) => handleInputChange('access_token', e.target.value)}
                    disabled={isSaving}
                    placeholder="your-access-token"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {__('The access token for API authentication.', 'surefeedback')}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="signature" className="text-xs font-medium text-gray-700 mb-1.5 block">
                  {__('Signature', 'surefeedback')}
                </Label>
                <Input
                  id="signature"
                  type="password"
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  disabled={isSaving}
                  placeholder="your-signature"
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {__('The secret signature for identity verification.', 'surefeedback')}
                </p>
              </div>
            </CardContent>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                <p className="text-sm text-gray-600">
                  {__('All fields are required to establish a connection.', 'surefeedback')}
                </p>
              </div>
              <Button
                onClick={handleConnect}
                disabled={!canConnect() || isSaving}
                size="lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {__('Connecting...', 'surefeedback')}
                  </>
                ) : (
                  __('Connect Site', 'surefeedback')
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PluginConnectionView;

