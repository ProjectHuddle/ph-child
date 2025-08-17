import React, { useState, useEffect } from 'react';
import { Card, Button, Title, Text, Container, Input, Alert, Badge, Tooltip } from '../../ui';
import type { ConnectionSettings } from '@/types';

interface ConnectionSetupStepProps {
  serviceType: 'admin' | 'saas' | null;
  connectionSettings: Partial<ConnectionSettings>;
  onSettingsChange: (settings: Partial<ConnectionSettings>) => void;
  onNext: () => void;
  onPrevious: () => void;
  errors: Record<string, string>;
  loading: boolean;
}

const DEFAULT_SAAS_URL = 'https://app.surefeedback.com';

export default function ConnectionSetupStep({
  serviceType,
  connectionSettings,
  onSettingsChange,
  onNext,
  onPrevious,
  errors,
  loading,
}: ConnectionSetupStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    parent_url: serviceType === 'saas' ? DEFAULT_SAAS_URL : '',
    access_token: '',
    api_key: '',
    project_id: '',
    signature: '',
    ...connectionSettings,
  });

  useEffect(() => {
    // Auto-fill parent URL for SaaS
    if (serviceType === 'saas' && !formData.parent_url) {
      setFormData(prev => ({ ...prev, parent_url: DEFAULT_SAAS_URL }));
    }
  }, [serviceType]);

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
    
    // Map form fields to connection settings
    const settingsMap: Record<string, keyof ConnectionSettings> = {
      parent_url: 'ph_child_parent_url',
      access_token: 'ph_child_access_token',
      api_key: 'ph_child_api_key',
      project_id: 'ph_child_id',
      signature: 'ph_child_signature',
    };

    if (settingsMap[field]) {
      onSettingsChange({
        [settingsMap[field]]: field === 'project_id' ? parseInt(value) || '' : value,
      });
    }
  };

  const isFormValid = () => {
    return formData.parent_url && formData.access_token;
  };

  const getInstructions = () => {
    if (serviceType === 'saas') {
      return {
        title: 'Connect to SureFeedback SaaS',
        description: 'Enter your SureFeedback account credentials to connect',
        steps: [
          'Log in to your SureFeedback account at app.surefeedback.com',
          'Go to Settings > API Tokens',
          'Generate a new access token for this website',
          'Copy the token and paste it below',
        ],
      };
    } else {
      return {
        title: 'Connect to SureFeedback Admin',
        description: 'Enter your self-hosted SureFeedback installation details',
        steps: [
          'Log in to your SureFeedback admin panel',
          'Navigate to API Settings or Integration settings',
          'Generate API credentials for this WordPress site',
          'Copy the URL and credentials below',
        ],
      };
    }
  };

  const instructions = getInstructions();

  return (
    <Container containerType="flex" direction="column" gap="lg" className="max-w-3xl mx-auto">
      <div className="text-center">
        <Title
          title={instructions.title}
          description={instructions.description}
          size="md"
        />
      </div>

      {/* Instructions */}
      <Card className="p-6 bg-background-secondary">
        <Container containerType="flex" gap="md">
          <div className="text-2xl">📋</div>
          <div className="flex-1">
            <Text size={14} weight={600} className="mb-3">
              Before you continue:
            </Text>
            <ol className="space-y-2 text-sm text-text-secondary list-decimal list-inside">
              {instructions.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </Container>
      </Card>

      {/* Connection Form */}
      <Card className="p-6">
        <Container containerType="flex" direction="column" gap="md">
          <Text size={16} weight={600}>
            Connection Details
          </Text>

          {/* Parent URL */}
          <div>
            <Container containerType="flex" align="center" gap="xs" className="mb-2">
              <Text size={14} weight={500}>
                {serviceType === 'saas' ? 'SureFeedback URL' : 'Admin URL'}
              </Text>
              {serviceType === 'saas' && (
                <Badge variant="green" size="xs" label="Auto-filled" />
              )}
            </Container>
            <Input
              value={formData.parent_url}
              onChange={(value) => handleInputChange('parent_url', value)}
              placeholder={serviceType === 'saas' ? 'https://app.surefeedback.com' : 'https://your-surefeedback-domain.com'}
              disabled={serviceType === 'saas'}
              error={!!errors.parent_url}
              size="md"
            />
            {errors.parent_url && (
              <Text size={12} color="error" className="mt-1">
                {errors.parent_url}
              </Text>
            )}
          </div>

          {/* Access Token */}
          <div>
            <Container containerType="flex" align="center" gap="xs" className="mb-2">
              <Text size={14} weight={500}>
                Access Token
              </Text>
              <Tooltip
                content="This token authenticates your WordPress site with SureFeedback"
                placement="top"
              >
                <span className="text-icon-secondary cursor-help">ⓘ</span>
              </Tooltip>
            </Container>
            <Input
              type="password"
              value={formData.access_token}
              onChange={(value) => handleInputChange('access_token', value)}
              placeholder="Enter your access token"
              error={!!errors.access_token}
              size="md"
            />
            {errors.access_token && (
              <Text size={12} color="error" className="mt-1">
                {errors.access_token}
              </Text>
            )}
          </div>

          {/* Advanced Settings Toggle */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon={<span>{showAdvanced ? '▼' : '▶'}</span>}
              iconPosition="left"
            >
              Advanced Settings (Optional)
            </Button>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <Container containerType="flex" direction="column" gap="md" className="pt-4 border-t bg-field-primary-background p-4 rounded-lg">
              <Text size={14} color="secondary">
                These fields are usually auto-populated after connection. Only fill them if you have specific values.
              </Text>

              {/* API Key */}
              <div>
                <Text size={14} weight={500} className="mb-2">
                  API Key
                </Text>
                <Input
                  value={formData.api_key}
                  onChange={(value) => handleInputChange('api_key', value)}
                  placeholder="Optional: API key if different from token"
                  size="md"
                />
              </div>

              {/* Project ID */}
              <div>
                <Text size={14} weight={500} className="mb-2">
                  Project ID
                </Text>
                <Input
                  type="text"
                  value={formData.project_id}
                  onChange={(value) => handleInputChange('project_id', value)}
                  placeholder="Optional: Specific project ID"
                  size="md"
                />
              </div>

              {/* Signature */}
              <div>
                <Text size={14} weight={500} className="mb-2">
                  Signature
                </Text>
                <Input
                  type="password"
                  value={formData.signature}
                  onChange={(value) => handleInputChange('signature', value)}
                  placeholder="Optional: HMAC signature"
                  size="md"
                />
              </div>
            </Container>
          )}
        </Container>
      </Card>

      {/* Help Section */}
      <Alert
        variant="info"
        design="inline"
        title="Need Help?"
        content={
          <div>
            <Text size={12} color="secondary" className="mb-2">
              If you're having trouble finding your credentials:
            </Text>
            <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
              <li>Check your SureFeedback account settings or admin panel</li>
              <li>Look for "API", "Integration", or "WordPress" sections</li>
              <li>Contact your SureFeedback administrator if needed</li>
            </ul>
          </div>
        }
      />

      {/* Navigation */}
      <Container containerType="flex" justify="between" className="mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={loading}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!isFormValid() || loading}
          loading={loading}
        >
          Test Connection
        </Button>
      </Container>
    </Container>
  );
}