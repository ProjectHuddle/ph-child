import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ConnectionSettings } from '@/types';

// Onboarding flow state
export interface OnboardingState {
  // Current state
  currentStep: number;
  isStarted: boolean;
  isComplete: boolean;
  isVisible: boolean;
  
  // Service selection
  serviceType: 'admin' | 'saas' | null;
  
  // Connection settings
  connectionSettings: Partial<ConnectionSettings>;
  
  // UI state
  loading: boolean;
  errors: Record<string, string>;
  
  // Validation state
  stepValidation: Record<number, boolean>;
  
  // Progress tracking
  completedSteps: number[];
  
  // Actions
  setCurrentStep: (step: number) => void;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  hideOnboarding: () => void;
  showOnboarding: () => void;
  setServiceType: (type: 'admin' | 'saas') => void;
  updateConnectionSettings: (settings: Partial<ConnectionSettings>) => void;
  setLoading: (loading: boolean) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  setStepValidation: (step: number, isValid: boolean) => void;
  markStepCompleted: (step: number) => void;
  resetOnboarding: () => void;
  
  // Navigation actions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  
  // Validation
  validateCurrentStep: () => Promise<boolean>;
  isStepValid: (step: number) => boolean;
  canProceedToStep: (step: number) => boolean;
}

const TOTAL_STEPS = 5;

const DEFAULT_CONNECTION_SETTINGS: Partial<ConnectionSettings> = {
  ph_child_parent_url: '',
  ph_child_access_token: '',
  ph_child_api_key: '',
  ph_child_id: '',
  ph_child_signature: '',
  ph_child_installed: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      currentStep: 0,
      isStarted: false,
      isComplete: false,
      isVisible: false,
      serviceType: null,
      connectionSettings: { ...DEFAULT_CONNECTION_SETTINGS },
      loading: false,
      errors: {},
      stepValidation: {},
      completedSteps: [],

      // Basic actions
      setCurrentStep: (step: number) =>
        set((state) => {
          state.currentStep = Math.max(0, Math.min(step, TOTAL_STEPS - 1));
        }),

      startOnboarding: () =>
        set((state) => {
          state.isStarted = true;
          state.isVisible = true;
          state.currentStep = 0;
          state.isComplete = false;
          state.errors = {};
        }),

      completeOnboarding: () =>
        set((state) => {
          state.isComplete = true;
          state.isStarted = false;
          state.completedSteps = Array.from({ length: TOTAL_STEPS }, (_, i) => i);
        }),

      hideOnboarding: () =>
        set((state) => {
          state.isVisible = false;
        }),

      showOnboarding: () =>
        set((state) => {
          state.isVisible = true;
        }),

      setServiceType: (type: 'admin' | 'saas') =>
        set((state) => {
          state.serviceType = type;
          // Auto-fill parent URL for SaaS
          if (type === 'saas') {
            state.connectionSettings.ph_child_parent_url = 'https://app.surefeedback.com';
          } else if (type === 'admin') {
            state.connectionSettings.ph_child_parent_url = '';
          }
          // Clear validation errors when service type changes
          delete state.errors.service;
        }),

      updateConnectionSettings: (settings: Partial<ConnectionSettings>) =>
        set((state) => {
          state.connectionSettings = { ...state.connectionSettings, ...settings };
          // Clear related errors when settings change
          if (settings.ph_child_parent_url !== undefined) {
            delete state.errors.parent_url;
          }
          if (settings.ph_child_access_token !== undefined) {
            delete state.errors.access_token;
          }
        }),

      setLoading: (loading: boolean) =>
        set((state) => {
          state.loading = loading;
        }),

      setErrors: (errors: Record<string, string>) =>
        set((state) => {
          state.errors = errors;
        }),

      clearErrors: () =>
        set((state) => {
          state.errors = {};
        }),

      setStepValidation: (step: number, isValid: boolean) =>
        set((state) => {
          state.stepValidation[step] = isValid;
        }),

      markStepCompleted: (step: number) =>
        set((state) => {
          if (!state.completedSteps.includes(step)) {
            state.completedSteps.push(step);
          }
        }),

      resetOnboarding: () =>
        set((state) => {
          state.currentStep = 0;
          state.isStarted = false;
          state.isComplete = false;
          state.isVisible = false;
          state.serviceType = null;
          state.connectionSettings = { ...DEFAULT_CONNECTION_SETTINGS };
          state.loading = false;
          state.errors = {};
          state.stepValidation = {};
          state.completedSteps = [];
        }),

      // Navigation actions
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < TOTAL_STEPS - 1) {
          set((state) => {
            state.currentStep += 1;
          });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set((state) => {
            state.currentStep -= 1;
          });
        }
      },

      goToStep: (step: number) => {
        const state = get();
        if (state.canProceedToStep(step)) {
          set((draft) => {
            draft.currentStep = step;
          });
        }
      },

      // Validation logic
      validateCurrentStep: async (): Promise<boolean> => {
        const { currentStep, serviceType, connectionSettings } = get();
        
        set((state) => {
          state.errors = {};
        });

        switch (currentStep) {
          case 1: // Service selection
            if (!serviceType) {
              set((state) => {
                state.errors.service = 'Please select a service type';
              });
              return false;
            }
            break;

          case 2: // Connection setup
            const errors: Record<string, string> = {};
            
            if (!connectionSettings.ph_child_parent_url) {
              errors.parent_url = 'Parent URL is required';
            }
            
            if (!connectionSettings.ph_child_access_token) {
              errors.access_token = 'Access token is required';
            }

            if (Object.keys(errors).length > 0) {
              set((state) => {
                state.errors = errors;
              });
              return false;
            }
            break;

          case 3: // Connection test
            // This step handles validation through API calls
            // The actual validation is done in the component
            break;
        }

        // Mark step as valid and completed
        set((state) => {
          state.stepValidation[currentStep] = true;
          if (!state.completedSteps.includes(currentStep)) {
            state.completedSteps.push(currentStep);
          }
        });

        return true;
      },

      isStepValid: (step: number): boolean => {
        const { stepValidation } = get();
        return stepValidation[step] === true;
      },

      canProceedToStep: (step: number): boolean => {
        const { completedSteps, currentStep } = get();
        // Can always go back
        if (step <= currentStep) return true;
        // Can only go forward one step at a time
        if (step === currentStep + 1) return true;
        // Can go to any completed step
        return completedSteps.includes(step - 1);
      },
    }))
  )
);

// Derived state selectors for performance
export const useOnboardingProgress = () => {
  return useOnboardingStore((state) => ({
    currentStep: state.currentStep,
    totalSteps: TOTAL_STEPS,
    progress: Math.round((state.currentStep / (TOTAL_STEPS - 1)) * 100),
    completedSteps: state.completedSteps,
    isComplete: state.isComplete,
  }));
};

export const useOnboardingNavigation = () => {
  return useOnboardingStore((state) => ({
    currentStep: state.currentStep,
    canGoNext: state.currentStep < TOTAL_STEPS - 1,
    canGoPrevious: state.currentStep > 0,
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    goToStep: state.goToStep,
    canProceedToStep: state.canProceedToStep,
  }));
};

export const useOnboardingData = () => {
  return useOnboardingStore((state) => ({
    serviceType: state.serviceType,
    connectionSettings: state.connectionSettings,
    isComplete: state.isComplete,
  }));
};

export const useOnboardingUI = () => {
  return useOnboardingStore((state) => ({
    isVisible: state.isVisible,
    isStarted: state.isStarted,
    loading: state.loading,
    errors: state.errors,
    showOnboarding: state.showOnboarding,
    hideOnboarding: state.hideOnboarding,
    startOnboarding: state.startOnboarding,
    setLoading: state.setLoading,
    clearErrors: state.clearErrors,
  }));
};