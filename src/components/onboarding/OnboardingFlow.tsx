import React, { useState, useEffect } from 'react';
import { ProgressSteps, Card, Button, Title, Text, Container, toast } from '../ui';
import WelcomeStep from './steps/WelcomeStep';
import ServiceSelectionStep from './steps/ServiceSelectionStep';
import ConnectionSetupStep from './steps/ConnectionSetupStep';
import TestConnectionStep from './steps/TestConnectionStep';
import CompletionStep from './steps/CompletionStep';
import type { ConnectionSettings } from '@/types';
import { settingsService } from '@/services/settings';

export interface OnboardingData {
  serviceType: 'admin' | 'saas' | null;
  connectionSettings: Partial<ConnectionSettings>;
  isComplete: boolean;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  onSkip?: () => void;
  className?: string;
}

const ONBOARDING_STEPS = [
  { id: 'welcome', label: 'Welcome', icon: '👋' },
  { id: 'service', label: 'Choose Service', icon: '🎯' },
  { id: 'connection', label: 'Setup Connection', icon: '🔗' },
  { id: 'test', label: 'Test & Verify', icon: '✅' },
  { id: 'complete', label: 'Complete', icon: '🎉' },
];

export default function OnboardingFlow({ onComplete, onSkip, className }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    serviceType: null,
    connectionSettings: {},
    isComplete: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      // Validate current step before proceeding
      const isValid = await validateCurrentStep();
      if (isValid) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // Complete onboarding
      await handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    setErrors({});

    switch (currentStep) {
      case 1: // Service selection
        if (!onboardingData.serviceType) {
          setErrors({ service: 'Please select a service type' });
          return false;
        }
        break;
      
      case 2: // Connection setup
        if (!onboardingData.connectionSettings.ph_child_parent_url) {
          setErrors({ parent_url: 'Parent URL is required' });
          return false;
        }
        if (!onboardingData.connectionSettings.ph_child_access_token) {
          setErrors({ access_token: 'Access token is required' });
          return false;
        }
        break;
      
      case 3: // Test connection
        setLoading(true);
        try {
          const response = await settingsService.testConnection(
            onboardingData.connectionSettings as ConnectionSettings
          );
          if (!response.success) {
            setErrors({ connection: response.message || 'Connection test failed' });
            return false;
          }
        } catch (error) {
          setErrors({ connection: 'Failed to test connection' });
          return false;
        } finally {
          setLoading(false);
        }
        break;
    }

    return true;
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save connection settings
      const response = await settingsService.saveConnectionSettings(
        onboardingData.connectionSettings as ConnectionSettings
      );

      if (response.success) {
        const completedData = { ...onboardingData, isComplete: true };
        setOnboardingData(completedData);
        onComplete(completedData);
        toast.success('Onboarding completed successfully!');
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('An error occurred while completing setup');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <WelcomeStep
            onNext={handleNext}
            onSkip={onSkip}
          />
        );
      case 1:
        return (
          <ServiceSelectionStep
            selectedService={onboardingData.serviceType}
            onServiceSelect={(serviceType) => updateOnboardingData({ serviceType })}
            onNext={handleNext}
            onPrevious={handlePrevious}
            error={errors.service}
          />
        );
      case 2:
        return (
          <ConnectionSetupStep
            serviceType={onboardingData.serviceType}
            connectionSettings={onboardingData.connectionSettings}
            onSettingsChange={(settings) => 
              updateOnboardingData({ connectionSettings: { ...onboardingData.connectionSettings, ...settings } })
            }
            onNext={handleNext}
            onPrevious={handlePrevious}
            errors={errors}
            loading={loading}
          />
        );
      case 3:
        return (
          <TestConnectionStep
            connectionSettings={onboardingData.connectionSettings}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onRetry={() => validateCurrentStep()}
            loading={loading}
            error={errors.connection}
          />
        );
      case 4:
        return (
          <CompletionStep
            serviceType={onboardingData.serviceType}
            onComplete={handleComplete}
            onPrevious={handlePrevious}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className || ''}`}>
      <Container containerType="flex" direction="column" gap="lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Title
            title="SureFeedback Setup"
            description="Let's get your feedback system connected and ready to use"
            size="lg"
            className="mb-6"
          />
          
          {/* Progress Steps */}
          <ProgressSteps
            currentStep={currentStep}
            variant="icon"
            size="md"
            type="inline"
            className="max-w-2xl mx-auto"
          >
            {ONBOARDING_STEPS.map((step, index) => (
              <ProgressSteps.Step
                key={step.id}
                labelText={step.label}
                icon={<span className="text-lg">{step.icon}</span>}
              />
            ))}
          </ProgressSteps>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation (only show on non-first step if not using step-specific navigation) */}
        {currentStep > 0 && currentStep < 4 && (
          <Container containerType="flex" justify="between" className="mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={loading}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              loading={loading}
              disabled={loading}
            >
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
            </Button>
          </Container>
        )}
      </Container>
    </div>
  );
}