import React, { useState, useEffect } from "react";
import { Container, Title, Button, Switch, Loader } from "@bsf/force-ui";
import { LoaderCircle, FileText } from "lucide-react";
import { __ } from "@wordpress/i18n";
import { useSettings } from '../hooks/useSettings';

const WhiteLabel = () => {
  const {
    settings,
    loading,
    saving,
    errors,
    loadSettings,
    saveWhiteLabelSettings,
    updateWhiteLabelField,
    clearErrors
  } = useSettings();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleInputChange = (field, value) => {
    updateWhiteLabelField(field, value);
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const success = await saveWhiteLabelSettings();
    setIsLoading(false);
    
    if (success) {
      // Show success message or notification if needed
    }
  };
  return (
    <div className="rounded-lg">
      <div
        className="flex flex-row items-center justify-between"
        style={{ paddingBottom: "24px" }}
      >
        <Title
          icon={null}
          iconPosition="right"
          size="sm"
          tag="h2"
          title={__("White Label", "ph-child")}
        />

        <div
          className="flex items-center justify-between [&_h2]:text-[#6005ff]"
          style={{ gap: "22px" }}
        >
          <Button
            type="submit"
            style={{ backgroundColor: "#6005ff", position: "relative" }}
            className="flex items-center justify-center"
            iconPosition="left"
            onClick={handleSaveChanges}
            disabled={saving || isLoading}
          >
            {(saving || isLoading) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            {__("Save", "ph-child")}
          </Button>
        </div>
      </div>
      <Container
        align="stretch"
        className="flex flex-row w-full"
        containerType="flex"
        direction="column"
        gap="sm"
        justify="start"
      >
        <div>
          <Container
            align="stretch"
            className="flex flex-column p-6 bg-background-primary"
            containerType="flex"
            direction="column"
            style={{
              padding: "24px",
              borderRadius: "8px",
            }}
          >
            <Title
              size="sm"
              tag="h2"
              title={__("Plugins Details", "ph-child")}
              description={__(
                "You can change the author name and plugin details that are displayed in the WordPress backend.",
                "uael"
              )}
            />
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                {__("Plugin Name", "ph-child")}
              </div>
              <input
                name="ph_child_plugin_name"
                type="text"
                className="w-full border border-subtle"
                value={settings.whiteLabel.ph_child_plugin_name || ''}
                onChange={(e) => handleInputChange('ph_child_plugin_name', e.target.value)}
                placeholder={__("SureFeedback Client Site", "ph-child")}
                disabled={saving}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0",
                  outline: "none",
                  boxShadow: "none",
                  marginTop: "16px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </Container.Item>
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                {__("Plugin Description", "ph-child")}
              </div>
              <textarea
                name="ph_child_plugin_description"
                className="w-full border border-subtle resize-none"
                value={settings.whiteLabel.ph_child_plugin_description || ''}
                onChange={(e) => handleInputChange('ph_child_plugin_description', e.target.value)}
                placeholder={__("Collect feedback from client websites and sync with SureFeedback parent project", "ph-child")}
                disabled={saving}
                rows={3}
                style={{
                  height: "88px",
                  borderColor: "#e0e0e0",
                  outline: "none",
                  boxShadow: "none",
                  marginTop: "16px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </Container.Item>
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                {__("Plugin Author", "ph-child")}
              </div>
              <input
                name="ph_child_plugin_author"
                type="text"
                className="w-full border border-subtle"
                value={settings.whiteLabel.ph_child_plugin_author || ''}
                onChange={(e) => handleInputChange('ph_child_plugin_author', e.target.value)}
                placeholder={__("Your Agency Name", "ph-child")}
                disabled={saving}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0",
                  outline: "none",
                  boxShadow: "none",
                  marginTop: "16px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </Container.Item>
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                {__("Author URL", "ph-child")}
              </div>
              <input
                name="ph_child_plugin_author_url"
                type="url"
                className="w-full border border-subtle"
                value={settings.whiteLabel.ph_child_plugin_author_url || ''}
                onChange={(e) => handleInputChange('ph_child_plugin_author_url', e.target.value)}
                placeholder={__("https://youragency.com", "ph-child")}
                disabled={saving}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0",
                  outline: "none",
                  boxShadow: "none",
                  marginTop: "16px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </Container.Item>

            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                {__("Plugin URL", "ph-child")}
              </div>
              <input
                name="ph_child_plugin_link"
                type="url"
                className="w-full border border-subtle"
                value={settings.whiteLabel.ph_child_plugin_link || ''}
                onChange={(e) => handleInputChange('ph_child_plugin_link', e.target.value)}
                placeholder={__("https://youragency.com/feedback-solution", "ph-child")}
                disabled={saving}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0",
                  outline: "none",
                  boxShadow: "none",
                  marginTop: "16px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </Container.Item>

            <div
              className="border border-subtle"
              style={{
                height: "2px",
                backgroundColor: "#E5E7EB",
                marginTop: "6px",
              }}
            />

            {errors.whiteLabel && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.whiteLabel}</p>
              </div>
            )}

            <Button
              type="submit"
              style={{ backgroundColor: "#0017E1", marginTop: "14px" }}
              iconPosition="left"
              className="sticky w-4/12"
              onClick={handleSaveChanges}
              disabled={saving || isLoading}
            >
              {(saving || isLoading) && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {__("Save Changes", "ph-child")}
            </Button>
          </Container>
        </div>
      </Container>
    </div>
  );
};

export default WhiteLabel;
