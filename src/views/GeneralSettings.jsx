import React, { useState, useEffect } from "react";
import { Button, Title, Container, Switch } from "@bsf/force-ui";
import { __ } from "@wordpress/i18n";
import { LoaderCircle } from "lucide-react";
import { useSettings } from '../hooks/useSettings';

const GeneralSettings = () => {
  const {
    settings,
    availableRoles,
    loading,
    saving,
    errors,
    loadSettings,
    saveGeneralSettings,
    updateRoleSelection,
    updateGuestComments,
    updateAdminComments,
    clearErrors
  } = useSettings();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (availableRoles.length === 0) {
      loadSettings();
    }
  }, [availableRoles.length, loadSettings]);

  const handleRoleChange = async (roleName, selected) => {
    updateRoleSelection(roleName, selected);
    // Auto-save the setting immediately
    await saveGeneralSettings();
  };

  const handleGuestCommentsChange = async (checked) => {
    updateGuestComments(checked);
    // Auto-save the setting immediately
    await saveGeneralSettings();
  };

  const handleAdminCommentsChange = async (checked) => {
    updateAdminComments(checked);
    // Auto-save the setting immediately
    await saveGeneralSettings();
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const success = await saveGeneralSettings();
    setIsLoading(false);
    
    if (success) {
      // Show success message or notification if needed
    }
  };

  return (
    <>
      <Title
        icon={null}
        iconPosition="right"
        size="sm"
        tag="h2"
        title={__("General Settings", "ph-child")}
        description={__(
          "Configure user permissions and commenting features",
          "ph-child"
        )}
      />
      <div
        className="box-border bg-background-primary p-6 rounded-lg"
        style={{
          marginTop: "24px",
        }}
      >
        <div className="flex flex-col">
          <Title
            // description={__('Select user roles that can access debug options. Admins are always enabled', 'ultimate_vc')}
            icon={null}
            iconPosition="right"
            size="xs"
            tag="h2"
            title={__("User Permissions", "ph-child")}
          />
          <div
            style={{ marginTop: "15px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4"
          >
            {availableRoles.map((role) => (
              <label key={role.name} className="flex items-center space-x-2 text-base text-black font-medium">
                <input
                  type="checkbox"
                  className="role-checkbox uavc-remove-ring"
                  checked={settings.general.ph_child_role_can_comment.includes(role.name)}
                  onChange={(e) => handleRoleChange(role.name, e.target.checked)}
                />
                <span className="text-sm">{role.label}</span>
              </label>
            ))}
          </div>
        </div>
        <Container
          align="center"
          className="flex flex-col lg:flex-row"
          containerType="flex"
          direction="column"
          gap="sm"
          justify="between"
          item
        >
          <Container.Item className="shrink flex flex-col mt-6 space-y-1">
            <div className="text-base font-semibold m-0 mb-2">
              {__("Guest Comments", "ph-child")}
            </div>
            <div
              style={{ color: "#9CA3AF" }}
              className="text-sm font-normal m-0"
            >
              {__("Allow non-logged in visitors to view and add comments", "ph-child")}
            </div>
          </Container.Item>
          <Container.Item
            className="shrink-0 p-2 flex space-y-6 uavc-remove-ring"
            alignSelf="auto"
            order="none"
            style={{ marginTop: "40px" }}
          >
            <Switch
              size="md"
              value={settings.general.ph_child_guest_comments_enabled}
              onChange={handleGuestCommentsChange}
            />
          </Container.Item>
        </Container>

        <hr
          className="w-full border-b-0 border-x-0 border-t border-solid border-t-border-subtle"
          style={{
            marginTop: "34px",
            marginBottom: "34px",
            borderColor: "#E5E7EB",
          }}
        />

        <Container
          align="center"
          className="flex flex-col lg:flex-row"
          containerType="flex"
          direction="column"
          gap="sm"
          justify="between"
          item
        >
          <Container.Item className="shrink flex flex-col space-y-1">
            <div className="text-base font-semibold m-0 mb-2">
              {__("Admin Area Comments", "ph-child")}
            </div>
            <div
              style={{ color: "#9CA3AF" }}
              className="text-sm font-normal m-0"
            >
              {__("Enable commenting on WordPress admin pages", "ph-child")}
            </div>
          </Container.Item>
          <Container.Item
            className="shrink-0 p-2 flex space-y-6 uavc-remove-ring"
            alignSelf="auto"
            order="none"
            style={{ marginTop: "40px" }}
          >
            <Switch
              size="md"
              value={settings.general.ph_child_admin}
              onChange={handleAdminCommentsChange}
            />
          </Container.Item>
        </Container>

        <hr
          className="w-full border-b-0 border-x-0 border-t border-solid border-t-border-subtle"
          style={{
            marginTop: "34px",
            marginBottom: "34px",
            borderColor: "#E5E7EB",
          }}
        />

        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <Button
          type="submit"
          style={{ backgroundColor: "#0017E1", marginTop: "14px" }}
          iconPosition="left"
          className="w-full sticky uavc-remove-ring"
          onClick={handleSaveChanges}
          disabled={saving || isLoading}
        >
          {(saving || isLoading) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {__("Save Changes", "ph-child")}
        </Button>
      </div>
    </>
  );
};

export default GeneralSettings;
