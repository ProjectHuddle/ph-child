import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Plug, Cloud, Loader2 } from 'lucide-react';
import { useRouter } from '../utils/Router';
import apiGateway from '../api/gateway.js';
import { toast } from '../components/ui/toast';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

/**
 * Connection Choice View
 * 
 * Root view that asks user to choose between Plugin (legacy) and SaaS connection
 */
const ConnectionChoiceView = () => {
  // Hooks must be called unconditionally at the top level
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const getMenuIcon = () => {
    return (window.sureFeedbackAdmin?.pluginUrl || '') + 'assets/images/settings/surefeedback-icon.svg';
  };

  const saveConnectionType = async (type) => {
    try {
      setSaving(true);
      const response = await apiGateway.post('connection/type', { type });
      
      if (response.success) {
        toast.success(__('Connection type saved successfully', 'surefeedback'));
        return true;
      } else {
        toast.error(__('Failed to save connection type', 'surefeedback'));
        return false;
      }
    } catch (error) {
      console.error('Error saving connection type:', error);
      toast.error(__('Failed to save connection type', 'surefeedback'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handlePluginChoice = async () => {
    // Save connection type preference
    const saved = await saveConnectionType('plugin');
    
    if (saved) {
      // Redirect to legacy plugin connection screen
      if (router && router.navigate) {
        router.navigate('plugin-connection');
      } else {
        window.location.hash = 'plugin-connection';
      }
    }
  };

  const handleSaaSChoice = async () => {
    // Save connection type preference
    const saved = await saveConnectionType('saas');
    
    if (saved) {
      // Redirect to SaaS welcome/setup screen
      if (router && router.navigate) {
        router.navigate('setup');
      } else {
        window.location.hash = 'setup';
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={getMenuIcon()}
            alt="SureFeedback"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {__('Welcome to SureFeedback', 'surefeedback')}
          </h1>
          <p className="text-lg text-gray-600">
            {__('Choose how you want to connect your site', 'surefeedback')}
          </p>
        </div>

        {/* Connection Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plugin Connection Option */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plug className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-center text-xl">
                {__('Connect with Plugin', 'surefeedback')}
              </CardTitle>
              <CardDescription className="text-center">
                {__('Use the legacy SureFeedback plugin connection method', 'surefeedback')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{__('Manual connection setup', 'surefeedback')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{__('Direct plugin-to-plugin connection', 'surefeedback')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{__('Traditional setup method', 'surefeedback')}</span>
                </li>
              </ul>
              <Button
                onClick={handlePluginChoice}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {__('Saving...', 'surefeedback')}
                  </>
                ) : (
                  __('Connect with Plugin', 'surefeedback')
                )}
              </Button>
            </CardContent>
          </Card>

          {/* SaaS Connection Option */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-green-500">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-center text-xl">
                {__('Connect with SaaS', 'surefeedback')}
              </CardTitle>
              <CardDescription className="text-center">
                {__('Use the modern SureFeedback SaaS platform', 'surefeedback')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{__('OAuth-based secure connection', 'surefeedback')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{__('Cloud-based management', 'surefeedback')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>{__('Recommended for new users', 'surefeedback')}</span>
                </li>
              </ul>
              <Button
                onClick={handleSaaSChoice}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {__('Saving...', 'surefeedback')}
                  </>
                ) : (
                  __('Connect with SaaS', 'surefeedback')
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {__('Not sure which to choose?', 'surefeedback')}{' '}
            <a
              href="https://surefeedback.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {__('Learn more', 'surefeedback')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionChoiceView;

