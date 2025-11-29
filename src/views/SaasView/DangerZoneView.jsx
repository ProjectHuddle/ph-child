import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { AlertTriangle, Loader2, Unlink, RotateCcw } from 'lucide-react';
import { toast } from '../../components/ui/toast';
import apiGateway from '../../api/gateway.js';
import connectionService from '../../services/connectionService.js';
import { useConnection } from '../../hooks/useConnection.js';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

/**
 * Danger Zone View
 * 
 * Contains destructive actions:
 * - Disconnect website
 * - Reset all connection data
 */
const DangerZoneView = () => {
    const { disconnect: disconnectConnection } = useConnection();
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);

    const handleDisconnect = async () => {
        setIsDisconnecting(true);
        try {
            // Disconnect from SaaS (remove bearer token)
            disconnectConnection();
            
            // Also call WordPress REST API to clear stored tokens
            try {
                await apiGateway.post('connection/reset');
            } catch (e) {
                console.warn('Failed to reset connection via REST API:', e);
            }

            toast.success(__('Site disconnected successfully! Redirecting...', 'surefeedback'));
            setShowDisconnectDialog(false);
            
            // Redirect to the connection setup page after a brief delay
            setTimeout(() => {
                window.location.href = window.sureFeedbackAdmin.admin_url + 'admin.php?page=feedback-connection-options';
            }, 1500);
        } catch (error) {
            toast.error(__('An error occurred while disconnecting. Please try again.', 'surefeedback'));
            setShowDisconnectDialog(false);
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleReset = async () => {
        setIsResetting(true);
        try {
            // Reset all connection data
            const data = await apiGateway.post('connection/reset');

            if (data.success) {
                // Also disconnect locally
                disconnectConnection();
                
                toast.success(__('Site connection reset successfully! All SureFeedback data has been cleared.', 'surefeedback'));
                setShowResetDialog(false);
                
                // Redirect to the connection setup page after a brief delay
                setTimeout(() => {
                    window.location.href = window.sureFeedbackAdmin.admin_url + 'admin.php?page=feedback-connection-options';
                }, 1500);
            } else {
                throw new Error(data.message || 'Reset failed');
            }
        } catch (error) {
            toast.error(__('Failed to reset site connection', 'surefeedback'));
            setShowResetDialog(false);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-sm border-red-200 bg-red-50/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-semibold text-gray-900">{__('Danger Zone', 'surefeedback')}</CardTitle>
                            <CardDescription className="mt-1 text-gray-600">
                                {__('Irreversible and destructive actions. Use with caution.', 'surefeedback')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-0 pt-0">
                    <div className="divide-y divide-red-200">
                        {/* Disconnect Website */}
                        <div className="flex items-start justify-between gap-4 py-6 first:pt-0">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Unlink className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-gray-900">{__('Disconnect Website', 'surefeedback')}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {__('Disconnect your website from SureFeedback. All connection settings will be removed. You can reconnect at any time.', 'surefeedback')}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDisconnectDialog(true)}
                                    disabled={isDisconnecting || isResetting}
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    {__('Disconnect', 'surefeedback')}
                                </Button>
                            </div>
                        </div>

                        {/* Reset All Connection Data */}
                        <div className="flex items-start justify-between gap-4 py-6">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <RotateCcw className="h-5 w-5 text-red-600" />
                                    <span className="font-semibold text-gray-900">{__('Reset All Connection Data', 'surefeedback')}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {__('Permanently delete all SureFeedback connection data and reset website connection. This action cannot be undone.', 'surefeedback')}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowResetDialog(true)}
                                    disabled={isDisconnecting || isResetting}
                                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    {__('Reset', 'surefeedback')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Disconnect Confirmation Dialog */}
            <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            {__('Disconnect Website?', 'surefeedback')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {__('This will disconnect your website from SureFeedback. All connection settings will be removed. You can reconnect at any time.', 'surefeedback')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDisconnecting}>
                            {__('Cancel', 'surefeedback')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDisconnect}
                            disabled={isDisconnecting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDisconnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {__('Disconnecting...', 'surefeedback')}
                                </>
                            ) : (
                                __('Disconnect', 'surefeedback')
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reset Confirmation Dialog */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            {__('Reset All Connection Data?', 'surefeedback')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {__('This will permanently delete all SureFeedback connection data and reset your website connection. This action cannot be undone. Are you absolutely sure?', 'surefeedback')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResetting}>
                            {__('Cancel', 'surefeedback')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReset}
                            disabled={isResetting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isResetting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {__('Resetting...', 'surefeedback')}
                                </>
                            ) : (
                                __('Yes, Reset Everything', 'surefeedback')
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DangerZoneView;

