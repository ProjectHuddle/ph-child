import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { __ } from "@wordpress/i18n";
import { Loader2, Save, Shield, Trash2, AlertTriangle, Ban } from "lucide-react";
import { apiGateway } from '../api/gateway.js';

const ResetConnectionButton = () => {
  const [resetting, setResetting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleResetConnection = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setResetting(true);
      const data = await apiGateway.post('connection/reset');

      if (data.success) {
        toast.success(__('Site connection reset successfully! All SureFeedback data has been cleared.', 'surefeedback'));
        // Reload the page after a short delay to refresh the UI
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(data.message || 'Reset failed');
      }
    } catch (error) {
      toast.error(__('Failed to reset site connection', 'surefeedback'));
    } finally {
      setResetting(false);
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-800 mb-2">
              {__("Are you absolutely sure?", "surefeedback")}
            </h4>
            <p className="text-sm text-red-700 mb-4">
              {__("This will permanently delete all SureFeedback data including connection settings, user permissions, and white label settings. This action cannot be undone.", "surefeedback")}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={resetting}
              >
                {__("Cancel", "surefeedback")}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetConnection}
                disabled={resetting}
              >
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {__("Resetting...", "surefeedback")}
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {__("Yes, reset everything", "surefeedback")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border border-[#FF5C5C] bg-[#FF5C5C1A] rounded-lg">
      <div>
        <h4 className="font-semibold text-base text-[#FF5C5C] mb-1">
          {__("Reset Site Connection", "surefeedback")}
        </h4>
        <p className="text-sm text-[#FF5C5C]">
          {__("Permanently delete all SureFeedback data and disconnect from the parent site.", "surefeedback")}
        </p>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleResetConnection}
        disabled={resetting}
      >
        <Ban className=" h-4 w-4" />
        {__("Reset Connection", "surefeedback")}
      </Button>
    </div>
  );
};

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    roles: []
  });
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await apiGateway.get('settings');

      if (data.success) {
        const availableRolesList = data.availableRoles || [];
        const savedRoles = data.general?.roles || [];

        // If no roles are saved yet, enable all roles by default
        const defaultRoles = savedRoles.length === 0
          ? availableRolesList.map(role => role.name)
          : savedRoles;

        setSettings({
          roles: defaultRoles
        });
        setAvailableRoles(availableRolesList);
      }
    } catch (error) {
      toast.error(__('Failed to load settings', 'surefeedback'));
    } finally {
      setLoading(false);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      setSaving(true);

      const data = await apiGateway.post('settings/general', settings);

      if (data.success) {
        toast.success(__('Settings saved successfully!', 'surefeedback'));
        setHasUnsavedChanges(false);
        return true;
      }
      throw new Error('Save failed');
    } catch (error) {
      toast.error(__('Failed to save settings', 'surefeedback'));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = (roleName, selected) => {
    const updatedRoles = selected
      ? [...settings.roles, roleName]
      : settings.roles.filter(role => role !== roleName);

    setSettings({
      ...settings,
      roles: updatedRoles
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveChanges = async () => {
    const success = await saveGeneralSettings();
    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center bg-background p-4 pt-8 w-full max-w-2xl mx-auto">
        <Card className="shadow-sm w-full rounded-lg border border-border">
          <CardContent className="flex flex-col space-y-6 py-8 w-full">
            {/* Page Header Skeleton */}
            <div className="space-y-1 w-full">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-80" />
            </div>

            {/* User Permissions Card Skeleton */}
            <div className="w-full">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start justify-between p-4 border border-border rounded-lg">
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
            <div className="flex justify-end pt-2 w-full">
              <Skeleton className="h-9 w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Skeleton */}
        <Card className="shadow-sm border-red-200 w-full mt-6 rounded-lg">
          <CardHeader className="pb-4">
            <div className="space-y-1 w-full">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-72" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center bg-background p-4 pt-8 w-full max-w-2xl mx-auto">
        <Card className="shadow-sm w-full rounded-lg border border-border">
          <CardContent className="flex flex-col space-y-6 py-8 w-full">
            {/* Page Header */}
            <div className="space-y-1 w-full">
              <h4 className="text-xl font-semibold text-foreground">
                {__("User Permissions", "surefeedback")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {__("Allow user roles to view comment widget on your site", "surefeedback")}
              </p>
            </div>

            {/* User Permissions Card */}
            <div className="w-full">
              <div className="space-y-3">
                {availableRoles.map((role) => (
                  <div key={role.name} className="flex items-start justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1 pr-4">
                      <Label
                        htmlFor={`role-${role.name}`}
                        className="text-sm font-semibold cursor-pointer capitalize block mb-1"
                      >
                        {role.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {__(`Enable ${role.label} role to view and interact with the feedback widget`, "surefeedback")}
                      </p>
                    </div>
                    <Switch
                      id={`role-${role.name}`}
                      checked={settings.roles?.includes(role.name) || false}
                      onCheckedChange={(checked) => handleRoleChange(role.name, checked)}
                      className="flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2 w-full">
              <Button
                size="sm"
                onClick={handleSaveChanges}
                disabled={saving || loading || !hasUnsavedChanges}
                className="min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {__("Saving...", "surefeedback")}
                  </>
                ) : (
                  <>
                    {hasUnsavedChanges ? __("Save Changes", "surefeedback") : __("No Changes", "surefeedback")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-sm border-red-200 w-full mt-6 rounded-lg">
          <CardHeader className="pb-4">
            <div className="space-y-1 w-full">
              <h4 className="text-xl font-semibold text-foreground">
                {__("Reset Connection", "surefeedback")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {__("Irreversible actions that will permanently delete data.", "surefeedback")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ResetConnectionButton />
          </CardContent>
        </Card>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  );
};

export default GeneralSettings;
