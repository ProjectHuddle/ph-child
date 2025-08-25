import React, { useState, useEffect } from "react";
import { Button, Title, Container, Switch } from "@bsf/force-ui";
import { __ } from "@wordpress/i18n";
// import apiFetch from "@wordpress/api-fetch";
import { LoaderCircle } from "lucide-react";

const GeneralSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      <Title
        description=""
        icon={null}
        iconPosition="right"
        size="sm"
        tag="h2"
        title={__("General Settings", "ultimate_vc")}
        description={__(
          "Manage global preferences for your SureFeedback workspace, including branding, access controls, notifications, and default project configurations.",
          "ultimate_vc"
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
            title={__("Enable Access", "ultimate_vc")}
          />
          <div
            style={{ marginTop: "15px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4"
          >
            <label className="flex items-center space-x-2 text-base text-black font-medium">
              <input
                type="checkbox"
                className="role-checkbox uavc-remove-ring"
                checked={false}
              />
              <span className="text-sm">Administrator</span>
            </label>
            <label className="flex items-center space-x-2 text-base text-black font-medium">
              <input
                type="checkbox"
                className="role-checkbox uavc-remove-ring"
                checked={false}
              />
              <span className="text-sm">Editor</span>
            </label>
            <label className="flex items-center space-x-2 text-base text-black font-medium">
              <input
                type="checkbox"
                className="role-checkbox uavc-remove-ring"
                checked={false}
              />
              <span className="text-sm">Author</span>
            </label>
            <label className="flex items-center space-x-2 text-base text-black font-medium">
              <input
                type="checkbox"
                className="role-checkbox uavc-remove-ring"
                checked={false}
              />
              <span className="text-sm">Contributor</span>
            </label>
            <label className="flex items-center space-x-2 text-base text-black font-medium">
              <input
                type="checkbox"
                className="role-checkbox uavc-remove-ring"
                checked={false}
              />
              <span className="text-sm">Subscriber</span>
            </label>
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
              {__("Guess Comments", "ultimate_vc")}
            </div>
            <div
              style={{ color: "#9CA3AF" }}
              className="text-sm font-normal m-0"
            >
              {sprintf(
                __(
                  "Allow visitors to view and add comments on your site without access token",
                  "ultimate_vc"
                )
              )}
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
              //   value={combinedCssEnabled}
              //   onChange={handleCombinedCssSwitch}
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
              {__("Admin", "ultimate_vc")}
            </div>
            <div
              style={{ color: "#9CA3AF" }}
              className="text-sm font-normal m-0"
            >
              {sprintf(
                __(
                  "Allow commenting in your site’s Wordpress dashboard area",
                  "ultimate_vc"
                )
              )}
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
              //   value={combinedJsEnabled}
              //   onChange={handleCombinedJsSwitch}
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

        <Button
          type="submit"
          style={{ backgroundColor: "#0017E1", marginTop: "14px" }}
          iconPosition="left"
          className="w-full sticky uavc-remove-ring"
        >
          {__("Save Changes", "ultimate_vc")}
        </Button>
      </div>
    </>
  );
};

export default GeneralSettings;
