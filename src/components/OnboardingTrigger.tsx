import React, { useState } from 'react';
import { Button, Card, Title, Text, Container, Alert } from './ui';
import OnboardingView from '../views/OnboardingView';
import { OnboardingData } from './onboarding/OnboardingFlow';

interface OnboardingTriggerProps {
  isConnected: boolean;
  onOnboardingComplete?: (data: OnboardingData) => void;
  className?: string;
}

export const OnboardingTrigger: React.FC<OnboardingTriggerProps> = ({
  isConnected,
  onOnboardingComplete,
  className = '',
}) => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleStartOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = (data: OnboardingData) => {
    setShowOnboarding(false);
    if (onOnboardingComplete) {
      onOnboardingComplete(data);
    }
    // Optionally reload the page or update the dashboard state
    window.location.reload();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-background-primary z-50">
        <OnboardingView
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          showSkipOption={true}
        />
      </div>
    );
  }

  if (isConnected) {
    return (
      <Card className={`p-4 bg-background-secondary border-l-4 border-support-success ${className}`}>
        <Container containerType="flex" align="center" justify="between">
          <div>
            <Text size={14} weight={600} color="success" className="mb-1">
              ✅ SureFeedback is Connected
            </Text>
            <Text size={12} color="secondary">
              Your feedback system is active and ready to use.
            </Text>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStartOnboarding}
          >
            Reconfigure
          </Button>
        </Container>
      </Card>
    );
  }

  return (
    <Alert
      variant="warning"
      design="stack"
      title="Setup Required"
      content={
        <div>
          <Text size={14} className="mb-3">
            SureFeedback is not connected yet. Run the setup wizard to get started quickly.
          </Text>
          <Text size={12} color="secondary">
            This will take about 5 minutes and will enable feedback collection on your website.
          </Text>
        </div>
      }
      action={{
        label: 'Start Setup Wizard',
        onClick: () => handleStartOnboarding(),
        type: 'button',
      }}
      className={className}
    />
  );
};

export default OnboardingTrigger;