import React from 'react';
import { Card, Button, Title, Text, Container, Badge, Alert } from '../../ui';

interface CompletionStepProps {
  serviceType: 'admin' | 'saas' | null;
  onComplete: () => void;
  onPrevious: () => void;
  loading: boolean;
}

const NEXT_STEPS = [
  {
    icon: '🎨',
    title: 'Customize Appearance',
    description: 'Configure white label settings and branding options',
    action: 'Go to White Label Settings',
  },
  {
    icon: '👥',
    title: 'Set User Permissions',
    description: 'Choose which user roles can create and view feedback',
    action: 'Configure User Roles',
  },
  {
    icon: '📊',
    title: 'View Dashboard',
    description: 'Monitor feedback activity and project status',
    action: 'Open Dashboard',
  },
];

const FEATURES_ENABLED = [
  {
    icon: '💬',
    title: 'Visual Feedback',
    description: 'Users can now click anywhere on your site to leave feedback',
  },
  {
    icon: '🔗',
    title: 'Real-time Sync',
    description: 'All feedback is automatically synced with SureFeedback',
  },
  {
    icon: '🔔',
    title: 'Notifications',
    description: 'Get notified when new feedback is submitted',
  },
  {
    icon: '📱',
    title: 'Mobile Support',
    description: 'Feedback system works perfectly on all devices',
  },
];

export default function CompletionStep({
  serviceType,
  onComplete,
  onPrevious,
  loading,
}: CompletionStepProps) {
  const getServiceBadge = () => {
    if (serviceType === 'saas') {
      return <Badge variant="blue" size="sm" label="SureFeedback SaaS" />;
    } else if (serviceType === 'admin') {
      return <Badge variant="green" size="sm" label="Self-Hosted" />;
    }
    return null;
  };

  return (
    <Container containerType="flex" direction="column" gap="lg" className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-support-success to-support-success rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-white">🎉</span>
        </div>
        
        <Title
          title="Setup Complete!"
          description="Your SureFeedback connection is now active and ready to use"
          size="lg"
        />
        
        <Container containerType="flex" justify="center" className="mt-4">
          {getServiceBadge()}
        </Container>
      </div>

      {/* Features Enabled */}
      <Card className="p-6">
        <Container containerType="flex" direction="column" gap="md">
          <Text size={16} weight={600} className="text-center mb-4">
            What's Now Available
          </Text>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES_ENABLED.map((feature, index) => (
              <Container key={index} containerType="flex" gap="md" className="p-4 bg-background-secondary rounded-lg">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <Text size={14} weight={600} className="mb-1">
                    {feature.title}
                  </Text>
                  <Text size={12} color="secondary">
                    {feature.description}
                  </Text>
                </div>
              </Container>
            ))}
          </div>
        </Container>
      </Card>

      {/* Next Steps */}
      <Card className="p-6">
        <Container containerType="flex" direction="column" gap="md">
          <Text size={16} weight={600} className="mb-4">
            Recommended Next Steps
          </Text>
          
          <div className="space-y-4">
            {NEXT_STEPS.map((step, index) => (
              <Container key={index} containerType="flex" align="center" justify="between" className="p-4 border rounded-lg hover:bg-background-secondary transition-colors">
                <Container containerType="flex" align="center" gap="md">
                  <div className="text-2xl">{step.icon}</div>
                  <div>
                    <Text size={14} weight={600} className="mb-1">
                      {step.title}
                    </Text>
                    <Text size={12} color="secondary">
                      {step.description}
                    </Text>
                  </div>
                </Container>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                >
                  {step.action}
                </Button>
              </Container>
            ))}
          </div>
        </Container>
      </Card>

      {/* Important Information */}
      <Alert
        variant="info"
        design="stack"
        title="Important Information"
        content={
          <div className="space-y-3">
            <div>
              <Text size={14} weight={600} className="mb-2">
                Testing Your Setup:
              </Text>
              <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Visit any page on your website</li>
                <li>Look for the SureFeedback feedback widget</li>
                <li>Try creating a test feedback to ensure everything works</li>
              </ul>
            </div>
            
            <div>
              <Text size={14} weight={600} className="mb-2">
                Need Help?
              </Text>
              <Text size={12} color="secondary">
                You can always modify these settings later in the WordPress admin under SureFeedback settings.
                Visit our documentation or contact support if you need assistance.
              </Text>
            </div>
          </div>
        }
      />

      {/* Test Widget Preview */}
      <Card className="p-6 bg-gradient-to-r from-brand-background-50 to-background-secondary border-l-4 border-brand-primary-600">
        <Container containerType="flex" gap="md">
          <div className="text-3xl">🔍</div>
          <div className="flex-1">
            <Text size={16} weight={600} className="mb-2">
              Want to See It in Action?
            </Text>
            <Text size={14} color="secondary" className="mb-4">
              Open a new tab and visit your website to see the SureFeedback widget in action. 
              The feedback tool should now be available for you and your users.
            </Text>
            <Container containerType="flex" gap="sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(window.location.origin, '_blank')}
              >
                Visit My Site
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled
              >
                View Documentation
              </Button>
            </Container>
          </div>
        </Container>
      </Card>

      {/* Final Actions */}
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
          size="md"
          onClick={onComplete}
          loading={loading}
          className="px-8"
        >
          Finish & Go to Dashboard
        </Button>
      </Container>
    </Container>
  );
}