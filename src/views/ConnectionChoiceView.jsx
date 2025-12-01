import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plug, Cloud, Loader2, CheckCircle2 } from 'lucide-react';
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

  const getLogoPath = () => {
    return (window.sureFeedbackAdmin?.pluginUrl || '') + 'assets/images/settings/surefeedback-logo-img.svg';
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
      // Update the preference in window object for immediate effect
      if (window.sureFeedbackAdmin) {
        window.sureFeedbackAdmin.connectionTypePreference = 'saas';
      }
      
      // Navigate to SaaS welcome/setup screen
      // The DashboardContent will detect the preference change and show SaasDashboard
      // which will route to 'setup' showing the Welcome component
      if (router && router.navigate) {
        router.navigate('setup');
      } else {
        window.location.hash = 'setup';
      }
      
      // Force a re-render by triggering a custom event
      window.dispatchEvent(new CustomEvent('connectionTypeChanged', { detail: { type: 'saas' } }));
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src={getLogoPath()}
              alt="SureFeedback"
              className="h-8 w-auto"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-0 leading-tight text-center" style={{ fontFamily: "'Figtree', sans-serif" }}>
            {__('Welcome to SureFeedback', 'surefeedback')}
          </h1>
        </div>

        {/* Description */}
        <div className="text-center mb-8">
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed text-center" style={{ fontFamily: "'Figtree', sans-serif" }}>
            {__('Choose how you want to connect your site to SureFeedback', 'surefeedback')}
          </p>
        </div>

        {/* Connection Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 mx-auto">
          {/* SaaS Connection Option - First (Left Side) */}
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-[#4253ff] relative overflow-hidden bg-white">
            <div className="absolute top-3 right-3 z-10">
              <Badge className="bg-[#4253ff] text-white border-0 text-xs font-semibold px-2.5 py-1 shadow-sm">
                {__('Preferred', 'surefeedback')}
              </Badge>
            </div>
            <CardHeader className="pb-3 pt-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-[#4253ff]/10 rounded-full flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-[#4253ff]" />
                </div>
              </div>
              <CardTitle className="text-center text-lg font-semibold text-gray-900 mb-1.5">
                {__('Connect with SaaS', 'surefeedback')}
              </CardTitle>
              <CardDescription className="text-center text-sm text-gray-600">
                {__('Use the modern SureFeedback SaaS platform', 'surefeedback')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6 px-6">
              <ul className="space-y-2.5 mb-5 text-sm text-gray-600">
                <li className="flex items-center gap-2.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#4253ff] flex-shrink-0" />
                  <span className="leading-relaxed text-center">{__('OAuth-based secure connection', 'surefeedback')}</span>
                </li>
                <li className="flex items-center gap-2.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#4253ff] flex-shrink-0" />
                  <span className="leading-relaxed text-center">{__('Cloud-based management', 'surefeedback')}</span>
                </li>
                <li className="flex items-center gap-2.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#4253ff] flex-shrink-0" />
                  <span className="leading-relaxed text-center">{__('Recommended for new users', 'surefeedback')}</span>
                </li>
              </ul>
              <Button
                onClick={handleSaaSChoice}
                className="w-full bg-[#4253ff] hover:bg-[#3142ef] text-white h-11 text-sm font-medium shadow-sm"
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

          {/* Plugin Connection Option - Second (Right Side) */}
          <Card className="cursor-pointer hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 bg-white">
            <CardHeader className="pb-3 pt-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Plug className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <CardTitle className="text-center text-lg font-semibold text-gray-900 mb-1.5">
                {__('Connect with Plugin', 'surefeedback')}
              </CardTitle>
              <CardDescription className="text-center text-sm text-gray-600">
                {__('Use the legacy SureFeedback plugin connection method', 'surefeedback')}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6 px-6">
              <ul className="space-y-2.5 mb-5 text-sm text-gray-600">
                <li className="flex items-center gap-2.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="leading-relaxed text-center">{__('Manual connection setup', 'surefeedback')}</span>
                </li>
                <li className="flex items-center gap-2.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="leading-relaxed text-center">{__('Direct plugin-to-plugin connection', 'surefeedback')}</span>
                </li>
                <li className="flex items-center gap-2.5 justify-center">
                  <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="leading-relaxed text-center">{__('Traditional setup method', 'surefeedback')}</span>
                </li>
              </ul>
              <Button
                onClick={handlePluginChoice}
                variant="outline"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-11 text-sm font-medium"
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
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500" style={{ fontFamily: "'Figtree', sans-serif" }}>
            {__('Not sure which to choose?', 'surefeedback')}{' '}
            <a
              href="https://surefeedback.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4253ff] hover:underline font-medium"
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

