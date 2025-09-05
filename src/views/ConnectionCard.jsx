import React, { useState, useEffect } from "react";
import { Button, Title, Container } from "@bsf/force-ui";
import { __ } from "@wordpress/i18n";
import { LoaderCircle, ArrowUpRight, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";
import { useSettingsStore } from "../stores/settingsStore";
import { useToast } from "../hooks/useToast";

const ConnectionCard = () => {
  const [manualConnectionData, setManualConnectionData] = useState("");
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  
  const {
    connectionStatus,
    connection,
    loading,
    saving,
    errors,
    loadSettings,
    saveConnectionSettings,
    testConnection,
    updateConnectionSettings,
    refreshConnectionStatus,
  } = useSettingsStore();

  const { showToast } = useToast();

  // Initialize settings on component mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handle URL changes and detect successful disconnect
  useEffect(() => {
    const handleUrlChange = () => {
      // Force reload settings when URL changes (e.g., after redirect from disconnect)
      loadSettings();
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    // Check if we just came back from a disconnect operation
    const urlParams = new URLSearchParams(window.location.search);
    const hasDisconnectSuccess = urlParams.has('ph-child-site-disconnect');
    
    if (hasDisconnectSuccess) {
      // Clean up the URL parameters
      const cleanUrl = new URL(window.location);
      cleanUrl.searchParams.delete('ph-child-site-disconnect');
      cleanUrl.searchParams.delete('ph-child-site-disconnect-nonce');
      window.history.replaceState({}, '', cleanUrl.toString());
      
      // Show success message and refresh data
      setTimeout(() => {
        showToast(__("Successfully disconnected from SureFeedback", "ph-child"), "success");
        loadSettings(); // Force refresh the settings
        refreshConnectionStatus(); // Also refresh connection status
      }, 100);
    }

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [loadSettings, showToast, refreshConnectionStatus]);

  // Force refresh when connection status changes
  useEffect(() => {
    if (!connectionStatus.connected && connectionStatus.parent_url === undefined) {
      // This might indicate a fresh disconnect, ensure we have the latest state
      const timeoutId = setTimeout(() => {
        loadSettings();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [connectionStatus, loadSettings]);

  const handleManualImport = async () => {
    if (!manualConnectionData.trim()) {
      showToast(__("Please enter connection details", "ph-child"), "error");
      return;
    }

    try {
      const connectionData = JSON.parse(manualConnectionData);
      
      // Map the connection data to the expected format
      const settingsToSave = {
        ph_child_id: connectionData.id || connectionData.project_id,
        ph_child_api_key: connectionData.api_key || connectionData.apikey,
        ph_child_access_token: connectionData.access_token,
        ph_child_parent_url: connectionData.parent_url,
        ph_child_signature: connectionData.signature,
        ph_child_installed: true,
      };

      const success = await saveConnectionSettings(settingsToSave);
      
      if (success) {
        setManualConnectionData("");
        showToast(__("Connection settings saved successfully", "ph-child"), "success");
      } else {
        showToast(errors.connection || __("Failed to save connection settings", "ph-child"), "error");
      }
    } catch (error) {
      showToast(__("Invalid JSON format. Please check your connection details.", "ph-child"), "error");
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(__("Are you sure you want to disconnect? This will remove all connection settings.", "ph-child"))) {
      return;
    }

    setIsDisconnecting(true);
    
    try {
      // Use the original PHP disconnect functionality with URL parameters
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('ph-child-site-disconnect', '1');
      currentUrl.searchParams.set('ph-child-site-disconnect-nonce', window.sureFeedbackAdmin?.disconnect_nonce || '');
      
      // Redirect to disconnect URL - this will be handled by PHP
      window.location.href = currentUrl.toString();
    } catch (error) {
      setIsDisconnecting(false);
      showToast(__("Failed to disconnect", "ph-child"), "error");
    }
  };

  const handleTestConnection = async () => {
    const success = await testConnection();
    
    if (success) {
      showToast(__("Connection test successful", "ph-child"), "success");
    } else {
      showToast(errors.connection || __("Connection test failed", "ph-child"), "error");
    }
  };

  const getConnectionStatusDisplay = () => {
    // Always show a status, even during loading states
    if (loading) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#f8f9fa" }}>
          <LoaderCircle size={16} className="animate-spin" />
          <span>{__("Loading connection status...", "ph-child")}</span>
        </div>
      );
    }

    if (connectionStatus.connected && connectionStatus.parent_url) {
      return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#daecda" }}>
          <CheckCircle size={16} style={{ color: "#559a55" }} />
          <span style={{ color: "#559a55", fontWeight: "500" }}>
            {__("Connected to", "ph-child")} {connectionStatus.parent_url}
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: "#f1ebd3" }}>
        <AlertCircle size={16} style={{ color: "#9c8a44" }} />
        <span style={{ color: "#9c8a44", fontWeight: "500" }}>
          {__("Not Connected. Please connect this plugin to your SureFeedback installation.", "ph-child")}
        </span>
      </div>
    );
  };

  const getDashboardUrl = () => {
    if (connectionStatus.connected && connectionStatus.parent_url && connectionStatus.project_id) {
      return `${connectionStatus.parent_url}/wp-admin/post.php?post=${connectionStatus.project_id}&action=edit`;
    }
    return null;
  };

  return (
    <>
      <Title
        icon={null}
        iconPosition="right"
        size="sm"
        tag="h2"
        title={__("Connection", "ph-child")}
        description={__(
          "Connect your site to your SureFeedback installation to enable feedback collection",
          "ph-child"
        )}
      />
      <div
        className="box-border bg-background-primary p-6 max-w-3xl rounded-lg"
        style={{
          marginTop: "24px",
        }}
      >
        <div className="flex flex-col">
          <Title
            icon={null}
            iconPosition="right"
            size="xs"
            tag="h2"
            title={__("Connection Status", "ph-child")}
            description={__(
              "Current connection status with your SureFeedback parent site",
              "ph-child"
            )}
          />
          
          {getConnectionStatusDisplay()}

          {connectionStatus.connected && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                icon={isDisconnecting ? <LoaderCircle className="animate-spin" /> : null}
              >
                {isDisconnecting ? __("Disconnecting...", "ph-child") : __("Disconnect", "ph-child")}
              </Button>
              
              {getDashboardUrl() && (
                <Button
                  variant="secondary"
                  onClick={() => window.open(getDashboardUrl(), "_blank")}
                  icon={<ExternalLink />}
                  iconPosition="right"
                >
                  {__("Visit Dashboard Site", "ph-child")}
                </Button>
              )}
              
              <Button
                variant="secondary"
                onClick={handleTestConnection}
                disabled={loading}
                icon={loading ? <LoaderCircle className="animate-spin" /> : null}
              >
                {loading ? __("Testing...", "ph-child") : __("Test Connection", "ph-child")}
              </Button>
            </div>
          )}

          {!connectionStatus.connected && (
            <div
              className="flex items-center justify-between px-4 rounded-xl mt-4"
              style={{
                paddingTop: "6px",
                paddingBottom: "6px",
                backgroundColor: "#F3F0FF",
              }}
            >
              <span className="flex items-center gap-x-2 text-base font-semibold">
                <p className="text-base font-normal">
                  {__(
                    "Having challenges connecting plugin? Please reach out",
                    "ph-child"
                  )}
                </p>
              </span>
              <Button
                icon={<ArrowUpRight />}
                iconPosition="right"
                variant="link"
                style={{
                  color: "#6005FF",
                  borderColor: "#6005FF",
                  transition: "color 0.3s ease, border-color 0.3s ease",
                  fontSize: "16px",
                }}
                className="ph_child-remove-ring text-[#6005FF]"
                onClick={() => {
                  window.open(
                    "https://surefeedback.com/docs/adding-a-clients-wordpress-site#manual",
                    "_blank"
                  );
                }}
              >
                {__("Need Help ?", "ph-child")}
              </Button>
            </div>
          )}
        </div>

        {!connectionStatus.connected && (
          <>
            <hr
              className="w-full border-b-0 border-x-0 border-t border-solid border-t-border-subtle"
              style={{
                marginTop: "34px",
                marginBottom: "34px",
                borderColor: "#E5E7EB",
              }}
            />

            <Container
              align="stretch"
              className="flex flex-col lg:flex-row"
              containerType="flex"
              direction="column"
              gap="sm"
              justify="between"
              item
            >
              <Container.Item className="flex flex-col w-full space-y-1">
                <div className="text-base text-field-label font-semibold m-0">
                  {__("Manual Connection Details", "ph-child")}
                </div>
                <p className="text-sm text-field-label font-normal mr-2 mb-2">
                  {__("If you are having trouble connecting, you can manually connect by pasting the connection details below", "ph-child")}
                </p>
                <textarea
                  value={manualConnectionData}
                  onChange={(e) => setManualConnectionData(e.target.value)}
                  name="manual_connection"
                  className="w-full border border-subtle"
                  placeholder={__("Paste your connection JSON data here...", "ph-child")}
                  rows={8}
                  style={{
                    borderColor: "#e0e0e0",
                    outline: "none",
                    boxShadow: "none",
                    marginTop: "8px",
                    padding: "12px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#6005FF")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
                {errors.connection && (
                  <div className="text-red-600 text-sm mt-2">
                    {errors.connection}
                  </div>
                )}
              </Container.Item>
            </Container>

            <Button
              type="button"
              onClick={handleManualImport}
              disabled={saving || !manualConnectionData.trim()}
              style={{ backgroundColor: "#0017E1", marginTop: "14px" }}
              iconPosition="left"
              className="w-40 sticky uavc-remove-ring"
              icon={saving ? <LoaderCircle className="animate-spin" /> : null}
            >
              {saving ? __("Saving...", "ph-child") : __("Save Changes", "ph-child")}
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export default ConnectionCard;