/**
 * Migration View
 * 
 * Handles migration from legacy PH connection to SaaS connection
 * 
 * @package SureFeedback
 */

import React, { useState } from 'react';
import { Settings, AlertCircle, Plug, Cloud } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card.jsx';
import { Button } from '../../components/ui/button.jsx';
import settingsService from '../../services/settingsService.js';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

const MigrationView = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showMigrationFlow, setShowMigrationFlow] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(10);
  const [isPreparing, setIsPreparing] = useState(false);

  const handleStartMigration = async () => {
    // Show animated gear icon first
    setIsMigrating(true);
    
    // Show confirmation modal after a delay to indicate migration is preparing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setShowConfirmationModal(true);
    setIsMigrating(false);
  };

  const handleConfirmMigration = async () => {
    // Show migration flow UI
    setShowConfirmationModal(false);
    setShowMigrationFlow(true);
    setIsPreparing(true);
    setIsMigrating(false);
    setMigrationStatus(null);
    setErrorMessage('');
    setCountdown(10);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Wait 10 seconds before starting migration
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Start actual migration
    setIsPreparing(false);
    setIsMigrating(true);

    try {
      const response = await settingsService.migrateToSaaS();
      
      if (response.success) {
        setMigrationStatus('success');
        // Reload page after 2 seconds to show new connection
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMigrationStatus('error');
        setErrorMessage(response.message || __('Migration failed. Please try again.', 'surefeedback'));
        setIsMigrating(false);
        setShowMigrationFlow(false);
      }
    } catch (error) {
      setMigrationStatus('error');
      setErrorMessage(error.message || __('An error occurred during migration.', 'surefeedback'));
      setIsMigrating(false);
      setShowMigrationFlow(false);
    }
  };

  const handleCancelMigration = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{__('Migration', 'surefeedback')}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {__('Migrate from legacy PH connection to SaaS connection', 'surefeedback')}
        </p>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">{__('Migrate to SaaS Connection', 'surefeedback')}</CardTitle>
          <CardDescription className="text-sm text-gray-600 mt-2">
            {__('Migrate your current legacy connection to the new SaaS connection system. Your current website data will be saved.', 'surefeedback')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 mb-1">
                  {__('Important Notice', 'surefeedback')}
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  {__('Your current website is saved as the admin site, but it will not be visible after migration. You will need to reconnect with the admin again.', 'surefeedback')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 flex-1">
              {isMigrating && !showConfirmationModal && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="h-5 w-5 animate-spin text-[#4253ff]" />
                  <span>{__('Migration in progress...', 'surefeedback')}</span>
                </div>
              )}
              {migrationStatus === 'success' && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{__('Migration completed successfully!', 'surefeedback')}</span>
                </div>
              )}
              {migrationStatus === 'error' && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
            <Button
              onClick={handleStartMigration}
              disabled={isMigrating || migrationStatus === 'success' || showConfirmationModal}
              className="bg-[#4253ff] hover:bg-[#4253ff]/90 text-white px-6 py-2.5"
            >
              {isMigrating && !showConfirmationModal ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  {__('Preparing...', 'surefeedback')}
                </>
              ) : (
                __('Start Migration', 'surefeedback')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {__('Confirm Migration', 'surefeedback')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p>
                {__('You are about to migrate from legacy connection to SaaS connection. This will:', 'surefeedback')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                <li>{__('Save your current website data in the database', 'surefeedback')}</li>
                <li>{__('Delete the old connection type preference', 'surefeedback')}</li>
                <li>{__('Set up the new SaaS connection preference', 'surefeedback')}</li>
              </ul>
              <div className="mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-md">
                <p className="text-sm font-medium text-amber-800">
                  <strong>{__('Important:', 'surefeedback')}</strong>{' '}
                  {__('Your current website is saved as the admin site, but it will not be visible after migration. You will need to reconnect with the admin again.', 'surefeedback')}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {__('Do you want to continue?', 'surefeedback')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelMigration}>
              {__('Cancel', 'surefeedback')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmMigration}
              className="bg-[#4253ff] hover:bg-[#4253ff]/90"
            >
              {__('Confirm Migration', 'surefeedback')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Migration Flow Modal */}
      <AlertDialog open={showMigrationFlow} onOpenChange={(open) => {
        // Prevent closing during migration or preparation
        if (!open && (isPreparing || isMigrating) && migrationStatus !== 'success' && migrationStatus !== 'error') {
          return;
        }
        if (!open) {
          setShowMigrationFlow(false);
          setIsPreparing(false);
          setIsMigrating(false);
          setCountdown(10);
        }
      }}>
        <AlertDialogContent className="max-w-3xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-[#4253ff] to-[#5a6bff] px-6 py-5">
            <AlertDialogTitle className="text-center text-xl font-semibold text-white">
              {__('Migrating to SaaS Connection', 'surefeedback')}
            </AlertDialogTitle>
          </div>
          
          <div className="px-6 py-8 bg-white">
            {/* Migration Flow Diagram */}
            <div className="flex items-center justify-center gap-3 sm:gap-6 py-6 px-2">
              {/* Plugin/WordPress Icon */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#4253ff] flex items-center justify-center shadow-xl transition-all duration-500 ${isPreparing || isMigrating ? 'scale-110 ring-4 ring-[#4253ff]/30' : ''}`}>
                  <Plug className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{__('Plugin', 'surefeedback')}</span>
              </div>

              {/* Connecting Line 1 */}
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative overflow-hidden max-w-[100px] sm:max-w-none">
                <div 
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r from-[#4253ff] to-[#5a6bff] rounded-full transition-all duration-1000 ease-in-out ${isMigrating ? 'w-full' : isPreparing ? 'w-0' : 'w-0'}`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full bg-[#4253ff] transition-all duration-500 ${isMigrating ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                </div>
              </div>

              {/* Animated Gear Icon */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#4253ff] to-[#5a6bff] flex items-center justify-center shadow-2xl transition-all duration-500 ${(isPreparing || isMigrating) ? 'scale-110 ring-4 ring-[#4253ff]/30' : ''}`}>
                  <Settings className={`h-10 w-10 sm:h-12 sm:w-12 text-white ${(isPreparing || isMigrating) ? 'animate-spin' : ''}`} style={{ animationDuration: '1s' }} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{__('Migration', 'surefeedback')}</span>
              </div>

              {/* Connecting Line 2 */}
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full relative overflow-hidden max-w-[100px] sm:max-w-none">
                <div 
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r from-[#4253ff] to-[#5a6bff] rounded-full transition-all duration-1000 ease-in-out delay-300 ${isMigrating ? 'w-full' : 'w-0'}`}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full bg-[#4253ff] transition-all duration-500 ${isMigrating ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
                </div>
              </div>

              {/* SaaS/Cloud Icon */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#4253ff] flex items-center justify-center shadow-xl transition-all duration-500 ${migrationStatus === 'success' ? 'ring-4 ring-green-400 ring-offset-2 scale-110 bg-green-500' : (isMigrating ? 'scale-110 ring-4 ring-[#4253ff]/30' : '')}`}>
                  <Cloud className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{__('SaaS', 'surefeedback')}</span>
              </div>
            </div>

            {/* Progress Bar */}
            {(isPreparing || isMigrating) && (
              <div className="mt-8 mb-6">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-[#4253ff] to-[#5a6bff] rounded-full transition-all duration-300 ${isMigrating ? 'w-full' : `w-[${100 - (countdown * 10)}%]`}`}
                    style={{ width: isMigrating ? '100%' : `${100 - (countdown * 10)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Status Message */}
            <div className="text-center mt-6 space-y-2">
              {isPreparing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Settings className="h-5 w-5 animate-spin text-[#4253ff]" />
                    <p className="text-base font-medium text-gray-700">
                      {__('Preparing migration...', 'surefeedback')}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-full border-4 border-[#4253ff] border-t-transparent animate-spin"></div>
                    <p className="text-2xl font-bold text-[#4253ff]">
                      {countdown}
                    </p>
                    <span className="text-sm text-gray-500">
                      {__('seconds remaining', 'surefeedback')}
                    </span>
                  </div>
                </div>
              )}
              {isMigrating && migrationStatus !== 'success' && migrationStatus !== 'error' && (
                <div className="flex items-center justify-center gap-2">
                  <Settings className="h-5 w-5 animate-spin text-[#4253ff]" />
                  <p className="text-base font-medium text-gray-700">
                    {__('Migration in progress... Please wait.', 'surefeedback')}
                  </p>
                </div>
              )}
              {migrationStatus === 'success' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-base font-semibold text-green-600">
                      {__('Migration completed successfully!', 'surefeedback')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {__('Redirecting...', 'surefeedback')}
                  </p>
                </div>
              )}
              {migrationStatus === 'error' && (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-base font-semibold text-red-600">
                    {errorMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MigrationView;

