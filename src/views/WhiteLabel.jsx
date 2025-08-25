import React, { useState, useEffect } from "react";
import { Container, Title, Button, Switch, Loader } from "@bsf/force-ui";
import { LoaderCircle, FileText } from "lucide-react";
import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";

const WhiteLabel = () => {
  return (
    <div className="rounded-lg">
      <div
        className="flex flex-row items-center justify-between"
        style={{ paddingBottom: "24px" }}
      >
        <Title
          description=""
          icon={null}
          iconPosition="right"
          size="sm"
          tag="h2"
          title={__("White Label", "uael")}
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
          >
            Save
          </Button>
        </div>
      </div>
      <Container
        align="stretch"
        className="flex flex-row"
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
              title={__("Plugins Details", "uael")}
              description={__(
                "You can change the author name and plugin details that are displayed in the WordPress backend.",
                "uael"
              )}
            />
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                Plugin Name
              </div>
              <input
                label={__("Plugin Description:", "uael")}
                name="description"
                type="text"
                className="w-full border border-subtle"
                // value={settings.description}
                // onChange={(e) => handleChange(e.target.name, e.target.value)}
                placeholder={__(
                  "Ultimate Addons is a premium extension for Elementor...",
                  "uael"
                )}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0", // Default border color
                  outline: "none", // Removes the default outline
                  boxShadow: "none",
                  marginTop: "16px", // Removes the default box shadow
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")} // Apply focus color
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")} // Revert to default color
              />
            </Container.Item>
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                Plugin Description
              </div>
              <input
                label={__("Plugin Description:", "uael")}
                name="description"
                type="text"
                className="w-full border border-subtle"
                // value={settings.description}
                // onChange={(e) => handleChange(e.target.name, e.target.value)}
                placeholder={__(
                  "Ultimate Addons is a premium extension for Elementor...",
                  "uael"
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
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                Plugin Author
              </div>
              <input
                label={__("Plugin Author:", "uael")}
                name="description"
                type="text"
                className="w-full border border-subtle"
                // value={settings.description}
                // onChange={(e) => handleChange(e.target.name, e.target.value)}
                placeholder={__(
                  "Ultimate Addons is a premium extension for Elementor...",
                  "uael"
                )}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0", // Default border color
                  outline: "none", // Removes the default outline
                  boxShadow: "none",
                  marginTop: "16px", // Removes the default box shadow
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")} // Apply focus color
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")} // Revert to default color
              />
            </Container.Item>
            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                Plugin Author URL
              </div>
              <input
                label={__("Plugin Author URL:", "uael")}
                name="Author URL"
                type="text"
                className="w-full border border-subtle"
                // value={settings.description}
                // onChange={(e) => handleChange(e.target.name, e.target.value)}
                placeholder={__(
                  "Ultimate Addons is a premium extension for Elementor...",
                  "uael"
                )}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0", // Default border color
                  outline: "none", // Removes the default outline
                  boxShadow: "none",
                  marginTop: "16px", // Removes the default box shadow
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")} // Apply focus color
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")} // Revert to default color
              />
            </Container.Item>

            <Container.Item className="flex flex-col w-full space-y-1 space-x-2">
              <div className="text-base text-field-label font-semibold m-0">
                Plugin Link
              </div>
              <input
                label={__("Plugin Link:", "uael")}
                name="Link"
                type="text"
                className="w-full border border-subtle"
                // value={settings.description}
                // onChange={(e) => handleChange(e.target.name, e.target.value)}
                placeholder={__(
                  "Ultimate Addons is a premium extension for Elementor...",
                  "uael"
                )}
                style={{
                  height: "48px",
                  borderColor: "#e0e0e0", // Default border color
                  outline: "none", // Removes the default outline
                  boxShadow: "none",
                  marginTop: "16px", // Removes the default box shadow
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6005FF")} // Apply focus color
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")} // Revert to default color
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

            <Button
              type="submit"
              style={{ backgroundColor: "#0017E1", marginTop: "14px" }}
              iconPosition="left"
              className="sticky uavc-remove-ring w-4/12"
            >
              {__("Save Changes", "ultimate_vc")}
            </Button>
          </Container>
        </div>
      </Container>
    </div>
  );
};

export default WhiteLabel;
