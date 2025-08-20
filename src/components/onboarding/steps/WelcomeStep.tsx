import React from 'react';
import { Card, Button, Title, Text, Container, Badge } from '../../ui';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip?: () => void;
}

export default function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <Container containerType="flex" direction="column" align="center" gap="lg" className="text-center">
      <Card className="max-w-2xl p-8">
        <Container containerType="flex" direction="column" gap="md" align="center">
          {/* Welcome Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-brand-primary-600 to-brand-hover-700 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl text-white">🎯</span>
          </div>

          <Title
            title="Welcome to SureFeedback"
            description="The powerful feedback and collaboration platform for WordPress"
            size="lg"
          />

          <Text size={16} color="secondary" className="max-w-lg">
            We'll help you connect your WordPress site to SureFeedback in just a few simple steps. 
            This will enable you to collect feedback, manage projects, and collaborate with your team.
          </Text>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 w-full">
            <div className="p-4 bg-field-primary-background rounded-lg border">
              <div className="text-2xl mb-2">💬</div>
              <Text size={14} weight={600} className="mb-1">Visual Feedback</Text>
              <Text size={12} color="secondary">
                Point-and-click feedback directly on your designs
              </Text>
            </div>
            
            <div className="p-4 bg-field-primary-background rounded-lg border">
              <div className="text-2xl mb-2">👥</div>
              <Text size={14} weight={600} className="mb-1">Team Collaboration</Text>
              <Text size={12} color="secondary">
                Work together with clients and team members
              </Text>
            </div>
            
            <div className="p-4 bg-field-primary-background rounded-lg border">
              <div className="text-2xl mb-2">📊</div>
              <Text size={14} weight={600} className="mb-1">Project Management</Text>
              <Text size={12} color="secondary">
                Track progress and manage feedback efficiently
              </Text>
            </div>
          </div>

          {/* What you'll need */}
          <Container containerType="flex" direction="column" gap="sm" className="mt-6 p-4 bg-background-secondary rounded-lg w-full">
            <Text size={14} weight={600} color="primary">
              What you'll need to get started:
            </Text>
            <div className="space-y-2">
              <Container containerType="flex" align="center" gap="sm">
                <span className="text-support-success">✓</span>
                <Text size={12} color="secondary">
                  Access to your SureFeedback account (Admin or SaaS)
                </Text>
              </Container>
              <Container containerType="flex" align="center" gap="sm">
                <span className="text-support-success">✓</span>
                <Text size={12} color="secondary">
                  Your site URL and access credentials
                </Text>
              </Container>
              <Container containerType="flex" align="center" gap="sm">
                <span className="text-support-success">✓</span>
                <Text size={12} color="secondary">
                  About 5 minutes of your time
                </Text>
              </Container>
            </div>
          </Container>

          {/* Action Buttons */}
          <Container containerType="flex" gap="md" className="mt-8">
            <Button
              variant="primary"
              size="md"
              onClick={onNext}
              className="px-8"
            >
              Get Started
            </Button>
            {onSkip && (
              <Button
                variant="ghost"
                size="md"
                onClick={onSkip}
              >
                Skip Setup
              </Button>
            )}
          </Container>

          <Container containerType="flex" align="center" gap="xs" className="mt-4">
            <Badge variant="blue" size="xs">
              <span className="mr-1">⚡</span>
              Quick Setup
            </Badge>
            <Badge variant="green" size="xs">
              <span className="mr-1">🔒</span>
              Secure
            </Badge>
            <Badge variant="neutral" size="xs">
              <span className="mr-1">🚀</span>
              Easy to Use
            </Badge>
          </Container>
        </Container>
      </Card>
    </Container>
  );
}