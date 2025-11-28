import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/container';
import { Title } from '../components/ui/title';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from '../components/ui/toast';
import { __ } from '@wordpress/i18n';
import { Shield, Users, Eye, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { apiGateway } from '../api/gateway.js';

/**
 * Permissions View - Manages user permissions and access control
 * 
 * This view handles:
 * - User role permissions
 * - Site visitor access
 * - Dashboard commenting settings
 * - Access control configuration
 */
const PermissionsView = () => {
    const [activeTab, setActiveTab] = useState('user-roles');
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
            const data = await apiGateway.get('settings');

            if (data.success) {
                const settingsData = data.data.general || {};
                const availableRolesList = data.data.availableRoles || [];
                const savedRoles = settingsData.roles || [];
                
                // If no roles are saved yet, enable all roles by default
                const defaultRoles = savedRoles.length === 0
                    ? availableRolesList.map(role => role.name)
                    : savedRoles;

                setPermissions({
                    allowSiteVisitors: settingsData.allow_site_visitors || false,
                    dashboardCommenting: settingsData.dashboard_commenting || false,
                    userRoles: defaultRoles,
                    guestAccess: settingsData.guest_access || false,
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
            
            const data = await apiGateway.post('settings/general', {
                roles: permissions.userRoles,
                allow_site_visitors: permissions.allowSiteVisitors,
                dashboard_commenting: permissions.dashboardCommenting,
                guest_access: permissions.guestAccess,
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
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <Title size="md">{__('User Permissions', 'surefeedback')}</Title>
                </div>
                <p className="text-gray-600 mb-6">
                    {__('Allow user roles to view comment widget on your site', 'surefeedback')}
                </p>
                
                <div className="space-y-4">
                    {getAvailableRoles().map(role => (
                        <div key={role.name} className="flex items-start justify-between py-3 border-b last:border-b-0">
                            <div className="flex-1 pr-4">
                                <span className="font-semibold text-gray-900 block mb-1">{role.label}</span>
                                <p className="text-sm text-gray-600">
                                    {__(`Enable ${role.label} role to view and interact with the feedback widget`, 'surefeedback')}
                                </p>
                            </div>
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
                    ))}
                </div>
            </div>
        </div>
    );
    
    const renderSiteAccess = () => (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Eye className="h-5 w-5 text-green-600" />
                    <Title size="md">{__('Site Visitor Access', 'surefeedback')}</Title>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{__('Allow Site Visitors', 'surefeedback')}</h4>
                            <p className="text-sm text-gray-600">
                                {__('Allow the site visitors to view and add comments on your site without access token.', 'surefeedback')}
                            </p>
                        </div>
                        <Switch
                            checked={permissions.allowSiteVisitors}
                            onChange={(checked) => handlePermissionChange('allowSiteVisitors', checked)}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{__('Dashboard Commenting', 'surefeedback')}</h4>
                            <p className="text-sm text-gray-600">
                                {__('Allow commenting in your site\'s WordPress dashboard area', 'surefeedback')}
                            </p>
                        </div>
                        <Switch
                            checked={permissions.dashboardCommenting}
                            onChange={(checked) => handlePermissionChange('dashboardCommenting', checked)}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">{__('Guest Access', 'surefeedback')}</h4>
                            <p className="text-sm text-gray-600">
                                {__('Allow non-logged-in users to leave feedback', 'surefeedback')}
                            </p>
                        </div>
                        <Switch
                            checked={permissions.guestAccess}
                            onChange={(checked) => handlePermissionChange('guestAccess', checked)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderAdvanced = () => (
        <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <Title size="md">{__('Advanced Permissions', 'surefeedback')}</Title>
                </div>
                
                <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">
                            {__('Coming Soon', 'surefeedback')}
                        </h4>
                        <p className="text-sm text-yellow-700">
                            {__('Advanced permission settings including custom roles, time-based access, and IP restrictions will be available in a future update.', 'surefeedback')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderContent = () => {
        switch (activeTab) {
            case 'user-roles':
                return renderUserRoles();
            case 'site-access':
                return renderSiteAccess();
            case 'advanced':
                return renderAdvanced();
            default:
                return renderUserRoles();
        }
    };
    
    if (loading) {
        return (
            <Container>
                <div className="surefeedback-permissions-view">
                    <div className="mb-6">
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-5 w-96" />
                    </div>
                    
                    {/* Tab Navigation Skeleton */}
                    <div className="flex space-x-1 mb-6 border-b border-gray-200">
                        <Skeleton className="h-9 w-32 rounded-b-none" />
                        <Skeleton className="h-9 w-32 rounded-b-none" />
                        <Skeleton className="h-9 w-32 rounded-b-none" />
                    </div>
                    
                    {/* Content Skeleton */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <Skeleton className="h-6 w-40" />
                        </div>
                        <Skeleton className="h-4 w-96 mb-6" />
                        
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-start justify-between py-3 border-b last:border-b-0">
                                    <div className="flex-1 pr-4 space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                    <Skeleton className="h-6 w-11 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Save Button Skeleton */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </Container>
        );
    }
    
    return (
        <Container>
            <div className="surefeedback-permissions-view">
                <div className="mb-6">
                    <Title size="xl" className="mb-2">
                        {__('Permission Management', 'surefeedback')}
                    </Title>
                    <p className="text-gray-600">
                        {__('Control what each user role can do in SureFeedback.', 'surefeedback')}
                    </p>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 border-b border-gray-200">
                    <Button
                        variant={activeTab === 'user-roles' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('user-roles')}
                        className="rounded-b-none"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        {__('User Roles', 'surefeedback')}
                    </Button>
                    <Button
                        variant={activeTab === 'site-access' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('site-access')}
                        className="rounded-b-none"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        {__('Site Access', 'surefeedback')}
                    </Button>
                    <Button
                        variant={activeTab === 'advanced' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('advanced')}
                        className="rounded-b-none"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        {__('Advanced', 'surefeedback')}
                    </Button>
                </div>
                
                {/* Content */}
                {renderContent()}
                
                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button 
                        variant="primary" 
                        size="md"
                        onClick={savePermissions}
                        disabled={saving || loading || !hasUnsavedChanges}
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
        </Container>
    );
};

export default PermissionsView;