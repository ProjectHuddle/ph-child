import React, { useState } from 'react';
import OnboardingFlow, { OnboardingData } from '../components/onboarding/OnboardingFlow';
import { Card, Button, Title, Text, Container } from '../components/ui';

interface OnboardingViewProps {
  onComplete?: (data: OnboardingData) => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
  className?: string;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onComplete,
  onSkip,
  showSkipOption = true,
  className = '',
}) => {
  const [isStarted, setIsStarted] = useState(false);

  const handleComplete = (data: OnboardingData) => {
    if (onComplete) {
      onComplete(data);
    } else {
      // Default behavior - reload page or navigate to dashboard
      console.log('Onboarding completed:', data);
      window.location.reload();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      // Default behavior - skip onboarding
      console.log('Onboarding skipped');
      window.location.reload();
    }
  };

  if (!isStarted) {
    return (
      <div className={`min-h-screen bg-background-primary flex items-center justify-center p-6 ${className}`}>
        <Container containerType="flex" direction="column" align="center" gap="lg" className="max-w-2xl">
          <Card className="p-8 text-center" variant="elevated">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary-600 to-brand-hover-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl text-white">🚀</span>
            </div>
            
            <Title
              title="Welcome to SureFeedback"
              description="Let's get your feedback system set up quickly and easily"
              size="lg"
              className="mb-6"
            />
            
            <Text size={16} color="secondary" className="mb-8">
              We'll guide you through connecting your WordPress site to SureFeedback in just a few minutes. 
              This enables you to collect visual feedback, manage projects, and collaborate with your team.
            </Text>

            <Container containerType="flex" gap="md" justify="center" className="mb-6">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsStarted(true)}
                className="px-8"
              >
                Start Setup
              </Button>
              
              {showSkipOption && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleSkip}
                >
                  Skip for Now
                </Button>
              )}
            </Container>

            <Text size={12} color="tertiary">
              You can always run this setup later from the SureFeedback settings page.
            </Text>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background-primary ${className}`}>
      <OnboardingFlow
        onComplete={handleComplete}
        onSkip={showSkipOption ? handleSkip : undefined}
        className="py-8"
      />
    </div>
  );
};

export default OnboardingView;