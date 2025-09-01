import React from "react";
import { Button, Title, Container, Switch } from "@bsf/force-ui";
import { __ } from "@wordpress/i18n";
import { LoaderCircle, ArrowUpRight } from "lucide-react";

const ConnectionCard = () => {
  return (
    <>
      <Title
        icon={null}
        iconPosition="right"
        size="sm"
        tag="h2"
        title={__("Connection", "ph-child")}
        description={__(
          "Make every interaction feel connected by tailoring SureFeedback with your own branding and labels",
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
            // description={__('Select user roles that can access debug options. Admins are always enabled', 'ultimate_vc')}
            icon={null}
            iconPosition="right"
            size="xs"
            tag="h2"
            title={__("Connection Status", "ph-child")}
            description={__(
              "Please connect plugin to your Feedback installation",
              "ph-child"
            )}
          />
          <div
            className="flex items-center justify-between px-4 rounded-xl"
            style={{
              paddingTop: "6px",
              paddingBottom: "6px",
              backgroundColor: "#F3F0FF",
              marginTop: "10px",
              marginBottom: "10px",
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
              // icon={<ArrowUpRight />}
              iconPosition="right"
              variant="link"
              style={{
                color: "#6005FF",
                borderColor: "#6005FF",
                transition: "color 0.3s ease, border-color 0.3s ease",
                fontSize: "16px",
              }}
              className="hfe-remove-ring text-[#6005FF]"
              onClick={() => {
                window.open(
                  "https://ultimateelementor.com/pricing/?utm_source=uae-lite-settings&utm_medium=My-accounts&utm_campaign=uae-lite-upgrade",
                  "_blank"
                );
              }}
            >
              {__("Need Help ?", "header-footer-elementor")}
            </Button>
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
          <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
            <div className="text-base text-field-label font-semibold m-0">
              Connection Status
            </div>
            <p className="text-sm text-field-label font-semibold mr-2">
              Manually connect by pasting the connection details below
            </p>
            <input
              label={__("Plugin Description:", "ph-child")}
              name="description"
              type="text"
              className="w-full border border-subtle"
              placeholder={__(
                "Ultimate Addons is a premium extension for Elementor...",
                "ph-child"
              )}
              style={{
                height: "88px",
                borderColor: "#e0e0e0", // Default border color
                outline: "none", // Removes the default outline
                boxShadow: "none",
                marginTop: "16px", // Removes the default box shadow
              }}
              onFocus={(e) => (e.target.style.borderColor = "#6005FF")} // Apply focus color
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")} // Revert to default color
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
          className="w-40 sticky uavc-remove-ring"
        >
          {__("Save Changes", "ph-child")}
        </Button>
      </div>
    </>
  );
};

export default ConnectionCard;
