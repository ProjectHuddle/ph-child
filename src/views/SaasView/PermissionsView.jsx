import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Switch } from '../../components/ui/switch';
import { Skeleton } from '../../components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { toast } from '../../components/ui/toast';
import { Users, Loader2, Shield } from 'lucide-react';
import apiGateway from '../../api/gateway.js';
import { WORDPRESS_API } from '../../api/apiurls.js';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

/**
 * Permissions View - Manages user permissions and access control
 * 
 * This view handles:
 * - User role permissions
 * - Site visitor access
 * - Dashboard commenting settings
 * - Access control configuration
 */
const PermissionsView = ({ activeTab = 'user-roles' }) => {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    
    // Get current settings from global state
    const settings = window.sureFeedbackAdmin?.settings || {};
    
    const [permissions, setPermissions] = useState({
        allowSiteVisitors: settings.allow_site_visitors || false,
        dashboardCommenting: settings.dashboard_commenting || false,
        userRoles: settings.user_roles || [],
        guestAccess: settings.guest_access || false,
    });
    
    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);
    
    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await apiGateway.get(WORDPRESS_API.BASE() + '/settings');

            if (data.success) {
                const settingsData = data.data.general || {};
                const availableRolesList = data.data.availableRoles || [];
                const savedRoles = settingsData.ph_child_role_can_comment || [];
                
                // If no roles are saved yet, enable all roles by default
                const defaultRoles = savedRoles.length === 0
                    ? availableRolesList.map(role => role.name)
                    : savedRoles;

                setPermissions({
                    allowSiteVisitors: settingsData.ph_child_guest_comments_enabled || false,
                    dashboardCommenting: settingsData.ph_child_admin || false,
                    userRoles: defaultRoles,
                    guestAccess: settingsData.ph_child_guest_comments_enabled || false,
                });
            }
        } catch (error) {
            toast.error(__('Failed to load settings', 'surefeedback'));
        } finally {
            setLoading(false);
        }
    };
    
    const handlePermissionChange = (key, value) => {
        setPermissions(prev => ({
            ...prev,
            [key]: value
        }));
        setHasUnsavedChanges(true);
    };
    
    const savePermissions = async () => {
        try {
            setSaving(true);
            
            const data = await apiGateway.post(WORDPRESS_API.BASE() + '/settings/general', {
                ph_child_role_can_comment: permissions.userRoles,
                ph_child_guest_comments_enabled: permissions.allowSiteVisitors || permissions.guestAccess,
                ph_child_admin: permissions.dashboardCommenting,
            });

            if (data.success) {
                toast.success(__('Permissions saved successfully!', 'surefeedback'));
                setHasUnsavedChanges(false);
            } else {
                throw new Error(data.message || 'Save failed');
            }
        } catch (error) {
            toast.error(__('Failed to save permissions', 'surefeedback'));
        } finally {
            setSaving(false);
        }
    };
    
    // Get available roles from WordPress
    const getAvailableRoles = () => {
        return window.sureFeedbackAdmin?.availableRoles || [
            { name: 'administrator', label: 'Administrator' },
            { name: 'editor', label: 'Editor' },
            { name: 'author', label: 'Author' },
            { name: 'contributor', label: 'Contributor' },
            { name: 'subscriber', label: 'Subscriber' }
        ];
    };
    
    
    const renderUserRoles = () => (
        <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-semibold text-gray-900">{__('User Permissions', 'surefeedback')}</CardTitle>
                        <CardDescription className="mt-1 text-gray-600">
                            {__('Control which user roles can view and interact with the feedback widget', 'surefeedback')}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-0 pt-0">
                <div className="divide-y divide-gray-200">
                    {getAvailableRoles().map((role, index) => (
                        <div key={role.name} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{role.label}</span>
                                    {permissions.userRoles.includes(role.name) && (
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                            {__('Enabled', 'surefeedback')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {__(`Allow ${role.label.toLowerCase()} users to view and interact with the feedback widget`, 'surefeedback')}
                                </p>
                            </div>
                            <div className="shrink-0">
                                <Switch
                                    checked={permissions.userRoles.includes(role.name)}
                                    onChange={(checked) => {
                                        const updatedRoles = checked 
                                            ? [...permissions.userRoles, role.name]
                                            : permissions.userRoles.filter(r => r !== role.name);
                                        handlePermissionChange('userRoles', updatedRoles);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'user-roles':
                return renderUserRoles();
            default:
                return renderUserRoles();
        }
    };
    
    if (loading) {
        return (
            <div className="space-y-6">
                <Card className="border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-40" />
                                <Skeleton className="h-4 w-96" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-0">
                        <div className="divide-y">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start justify-between gap-4 py-4">
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                    <Skeleton className="h-6 w-11 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {renderContent()}
            
            <div className="flex items-center justify-between gap-4 pt-4">
                <div className="text-sm text-muted-foreground">
                    {hasUnsavedChanges && (
                        <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                            {__('You have unsaved changes', 'surefeedback')}
                        </span>
                    )}
                </div>
                <Button 
                    onClick={savePermissions}
                    disabled={saving || loading || !hasUnsavedChanges}
                    size="default"
                    className="bg-primary hover:bg-primary/90"
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {__('Saving...', 'surefeedback')}
                        </>
                    ) : (
                        hasUnsavedChanges ? __('Save Changes', 'surefeedback') : __('No Changes', 'surefeedback')
                    )}
                </Button>
            </div>
        </div>
    );
};

export default PermissionsView;
