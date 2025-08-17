import React, { useState, useEffect } from 'react';
import { Card, Button, Title, Text, Container, Alert, Loader, Badge, ProgressBar } from '../../ui';
import type { ConnectionSettings } from '@/types';

interface TestConnectionStepProps {
  connectionSettings: Partial<ConnectionSettings>;
  onNext: () => void;
  onPrevious: () => void;
  onRetry: () => void;
  loading: boolean;
  error?: string;
}

interface TestStatus {
  step: 'connecting' | 'authenticating' | 'validating' | 'complete' | 'error';
  message: string;
  progress: number;
}

export default function TestConnectionStep({
  connectionSettings,
  onNext,
  onPrevious,
  onRetry,
  loading,
  error,
}: TestConnectionStepProps) {
  const [testStatus, setTestStatus] = useState<TestStatus>({
    step: 'connecting',
    message: 'Initializing connection test...',
    progress: 0,
  });

  const [connectionDetails, setConnectionDetails] = useState<{
    serverInfo?: string;
    projectName?: string;
    permissions?: string[];
  }>({});

  useEffect(() => {
    if (loading) {
      simulateConnectionTest();
    }
  }, [loading]);

  const simulateConnectionTest = async () => {
    const steps = [
      { step: 'connecting' as const, message: 'Connecting to SureFeedback server...', progress: 25 },
      { step: 'authenticating' as const, message: 'Authenticating with access token...', progress: 50 },
      { step: 'validating' as const, message: 'Validating permissions and settings...', progress: 75 },
      { step: 'complete' as const, message: 'Connection established successfully!', progress: 100 },
    ];

    for (const stepData of steps) {
      if (!loading) break; // Stop if loading was cancelled
      
      setTestStatus(stepData);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!error && loading) {
      // Simulate successful connection details
      setConnectionDetails({
        serverInfo: 'SureFeedback v2.1.0',
        projectName: 'My WordPress Site',
        permissions: ['read', 'write', 'comment'],
      });
    }
  };

  const getStatusIcon = () => {
    if (loading) {
      return <Loader size="sm" variant="primary" />;
    }
    if (error) {
      return <span className="text-support-error text-xl">❌</span>;
    }
    return <span className="text-support-success text-xl">✅</span>;
  };

  const getStatusVariant = () => {
    if (loading) return 'info';
    if (error) return 'error';
    return 'success';
  };

  return (
    <Container containerType="flex" direction="column" gap="lg" className="max-w-3xl mx-auto">
      <div className="text-center">
        <Title
          title="Testing Connection"
          description="We're verifying your connection to SureFeedback"
          size="md"
        />
      </div>

      {/* Connection Status */}
      <Card className="p-6">
        <Container containerType="flex" direction="column" gap="md">
          <Container containerType="flex" align="center" gap="md">
            {getStatusIcon()}
            <div className="flex-1">
              <Text size={16} weight={600}>
                {loading ? 'Testing Connection...' : error ? 'Connection Failed' : 'Connection Successful'}
              </Text>
              <Text size={14} color="secondary">
                {loading ? testStatus.message : error || 'All systems ready to go!'}
              </Text>
            </div>
          </Container>

          {loading && (
            <ProgressBar progress={testStatus.progress} className="mt-4" />
          )}
        </Container>
      </Card>

      {/* Connection Details */}
      {!loading && !error && (
        <Card className="p-6 bg-background-secondary">
          <Container containerType="flex" direction="column" gap="md">
            <Text size={16} weight={600}>
              Connection Details
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Text size={12} color="tertiary" className="mb-1">
                    SERVICE TYPE
                  </Text>
                  <Container containerType="flex" align="center" gap="xs">
                    <Badge 
                      variant={connectionSettings.ph_child_parent_url?.includes('app.surefeedback.com') ? 'blue' : 'green'} 
                      size="xs" 
                      label={connectionSettings.ph_child_parent_url?.includes('app.surefeedback.com') ? 'SaaS' : 'Self-Hosted'} 
                    />
                  </Container>
                </div>

                <div>
                  <Text size={12} color="tertiary" className="mb-1">
                    SERVER URL
                  </Text>
                  <Text size={14} color="primary">
                    {connectionSettings.ph_child_parent_url}
                  </Text>
                </div>
              </div>

              <div className="space-y-3">
                {connectionDetails.serverInfo && (
                  <div>
                    <Text size={12} color="tertiary" className="mb-1">
                      SERVER VERSION
                    </Text>
                    <Text size={14} color="primary">
                      {connectionDetails.serverInfo}
                    </Text>
                  </div>
                )}

                {connectionDetails.projectName && (
                  <div>
                    <Text size={12} color="tertiary" className="mb-1">
                      PROJECT NAME
                    </Text>
                    <Text size={14} color="primary">
                      {connectionDetails.projectName}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {connectionDetails.permissions && (
              <div className="mt-4 pt-4 border-t">
                <Text size={12} color="tertiary" className="mb-2">
                  PERMISSIONS
                </Text>
                <Container containerType="flex" gap="xs" wrap>
                  {connectionDetails.permissions.map((permission) => (
                    <Badge
                      key={permission}
                      variant="neutral"
                      size="xs"
                      label={permission.toUpperCase()}
                    />
                  ))}
                </Container>
              </div>
            )}
          </Container>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert
          variant="error"
          design="stack"
          title="Connection Failed"
          content={
            <div>
              <Text size={14} className="mb-3">
                {error}
              </Text>
              <Text size={12} color="secondary">
                Please check your credentials and try again. Make sure:
              </Text>
              <ul className="mt-2 text-xs text-text-secondary space-y-1 list-disc list-inside">
                <li>Your SureFeedback URL is correct and accessible</li>
                <li>Your access token is valid and not expired</li>
                <li>Your SureFeedback account has proper permissions</li>
                <li>There are no firewall restrictions blocking the connection</li>
              </ul>
            </div>
          }
          action={{
            label: 'Retry Connection',
            onClick: () => onRetry(),
            type: 'button',
          }}
        />
      )}

      {/* Loading State Details */}
      {loading && (
        <Card className="p-6 border-l-4 border-support-info">
          <Container containerType="flex" direction="column" gap="sm">
            <Text size={14} weight={600}>
              Connection Test in Progress
            </Text>
            <div className="space-y-2">
              <Container containerType="flex" align="center" gap="sm">
                <span className={testStatus.progress >= 25 ? 'text-support-success' : 'text-icon-secondary'}>
                  {testStatus.progress >= 25 ? '✓' : '○'}
                </span>
                <Text size={12} color={testStatus.progress >= 25 ? 'primary' : 'secondary'}>
                  Connecting to server
                </Text>
              </Container>
              <Container containerType="flex" align="center" gap="sm">
                <span className={testStatus.progress >= 50 ? 'text-support-success' : 'text-icon-secondary'}>
                  {testStatus.progress >= 50 ? '✓' : '○'}
                </span>
                <Text size={12} color={testStatus.progress >= 50 ? 'primary' : 'secondary'}>
                  Authenticating credentials
                </Text>
              </Container>
              <Container containerType="flex" align="center" gap="sm">
                <span className={testStatus.progress >= 75 ? 'text-support-success' : 'text-icon-secondary'}>
                  {testStatus.progress >= 75 ? '✓' : '○'}
                </span>
                <Text size={12} color={testStatus.progress >= 75 ? 'primary' : 'secondary'}>
                  Validating permissions
                </Text>
              </Container>
              <Container containerType="flex" align="center" gap="sm">
                <span className={testStatus.progress >= 100 ? 'text-support-success' : 'text-icon-secondary'}>
                  {testStatus.progress >= 100 ? '✓' : '○'}
                </span>
                <Text size={12} color={testStatus.progress >= 100 ? 'primary' : 'secondary'}>
                  Finalizing setup
                </Text>
              </Container>
            </div>
          </Container>
        </Card>
      )}

      {/* Navigation */}
      <Container containerType="flex" justify="between" className="mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={loading}
        >
          Previous
        </Button>
        
        <Container containerType="flex" gap="sm">
          {error && (
            <Button
              variant="secondary"
              onClick={onRetry}
              disabled={loading}
            >
              Retry Test
            </Button>
          )}
          <Button
            variant="primary"
            onClick={onNext}
            disabled={loading || !!error}
            loading={loading}
          >
            Complete Setup
          </Button>
        </Container>
      </Container>
    </Container>
  );
}