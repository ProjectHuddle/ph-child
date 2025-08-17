import React, { useState } from 'react';
import { Card, Button, Title, Text, Container, RadioButton, Badge, Alert } from '../../ui';

interface ServiceSelectionStepProps {
  selectedService: 'admin' | 'saas' | null;
  onServiceSelect: (service: 'admin' | 'saas') => void;
  onNext: () => void;
  onPrevious: () => void;
  error?: string;
}

const SERVICE_OPTIONS = [
  {
    id: 'admin',
    value: 'admin',
    title: 'SureFeedback Admin',
    description: 'Self-hosted or on-premise SureFeedback installation',
    icon: '🏢',
    features: [
      'Full control over your data',
      'Custom hosting environment',
      'Enterprise-grade security',
      'Advanced customization options',
    ],
    badge: { label: 'Self-Hosted', variant: 'blue' as const },
    recommended: false,
  },
  {
    id: 'saas',
    value: 'saas',
    title: 'SureFeedback SaaS',
    description: 'Cloud-hosted SureFeedback platform (recommended)',
    icon: '☁️',
    features: [
      'No setup or maintenance required',
      'Automatic updates and backups',
      'Scalable infrastructure',
      'Quick deployment',
    ],
    badge: { label: 'Recommended', variant: 'green' as const },
    recommended: true,
  },
];

export default function ServiceSelectionStep({ 
  selectedService, 
  onServiceSelect, 
  onNext, 
  onPrevious,
  error 
}: ServiceSelectionStepProps) {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const handleServiceSelect = (value: string) => {
    onServiceSelect(value as 'admin' | 'saas');
  };

  return (
    <Container containerType="flex" direction="column" gap="lg" className="max-w-4xl mx-auto">
      <div className="text-center">
        <Title
          title="Choose Your SureFeedback Service"
          description="Select how you want to connect to SureFeedback"
          size="md"
        />
      </div>

      {error && (
        <Alert
          variant="error"
          design="inline"
          content={error}
          className="mb-4"
        />
      )}

      <RadioButton.Group
        value={selectedService || ''}
        onChange={(value) => handleServiceSelect(value as string)}
        style="tile"
        size="md"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        vertical
      >
        {SERVICE_OPTIONS.map((option) => (
          <div
            key={option.id}
            className="relative"
            onMouseEnter={() => setHoveredService(option.id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            <RadioButton.Button
              value={option.value}
              label={{
                heading: option.title,
                description: option.description,
              }}
              icon={<span className="text-3xl">{option.icon}</span>}
              className={`
                h-full p-6 transition-all duration-200 
                ${selectedService === option.value ? 'ring-2 ring-brand-primary-600 border-brand-primary-600' : ''}
                ${hoveredService === option.id ? 'shadow-soft-shadow-md' : 'shadow-soft-shadow-sm'}
              `}
              borderOn
              borderOnActive
            />
            
            {/* Badge */}
            {option.badge && (
              <div className="absolute top-4 right-4">
                <Badge
                  variant={option.badge.variant}
                  size="xs"
                  label={option.badge.label}
                />
              </div>
            )}

            {/* Features List */}
            <Card className="mt-4 p-4 bg-field-primary-background">
              <Text size={14} weight={600} className="mb-3">
                Key Features:
              </Text>
              <div className="space-y-2">
                {option.features.map((feature, index) => (
                  <Container key={index} containerType="flex" align="center" gap="sm">
                    <span className="text-support-success text-sm">✓</span>
                    <Text size={12} color="secondary">
                      {feature}
                    </Text>
                  </Container>
                ))}
              </div>
            </Card>

            {/* Connection Info */}
            <div className="mt-3 p-3 bg-background-secondary rounded-lg">
              <Text size={12} color="tertiary">
                <strong>Connection:</strong> {option.id === 'admin' 
                  ? 'You\'ll need your SureFeedback admin URL and credentials'
                  : 'You\'ll connect to app.surefeedback.com with your account'
                }
              </Text>
            </div>
          </div>
        ))}
      </RadioButton.Group>

      {/* Additional Information */}
      <Card className="p-6 bg-background-secondary border-l-4 border-support-info">
        <Container containerType="flex" gap="md">
          <span className="text-2xl">💡</span>
          <div>
            <Text size={14} weight={600} className="mb-2">
              Not sure which option to choose?
            </Text>
            <Text size={12} color="secondary" className="mb-3">
              If you're using SureFeedback for the first time or don't have a self-hosted installation, 
              choose <strong>SureFeedback SaaS</strong>. It's the fastest way to get started.
            </Text>
            <Text size={12} color="tertiary">
              You can always change this later in your connection settings.
            </Text>
          </div>
        </Container>
      </Card>

      {/* Navigation */}
      <Container containerType="flex" justify="between" className="mt-8 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!selectedService}
        >
          Continue Setup
        </Button>
      </Container>
    </Container>
  );
}