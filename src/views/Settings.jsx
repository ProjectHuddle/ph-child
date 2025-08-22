import React, { useState, useEffect } from "react";
import { Container } from "@bsf/force-ui";
import Sidebar from "./Sidebar";
import Content from "./Content";
import NavMenu from "../components/NavMenu";
import WhiteLabel from "./WhiteLabel";
import GeneralSettings from "./GeneralSettings";
import { __ } from "@wordpress/i18n";

const Settings = () => {
    const items = [
        {
            id: 1,
            icon: (
                <img
                    src={`${sureFeedbackAdmin.settings_selected_url}`}
                    alt={__("Custom SVG", "header-footer-elementor")}
                    className="object-contain"
                />
            ),
            selected: (
                <img
                    src={`${sureFeedbackAdmin.settings_selected_url}`}
                    alt={__("Custom SVG", "header-footer-elementor")}
                    className="object-contain"
                />
            ),
               main: __("Editor", "header-footer-elementor"),
            title: __("General Settings", "header-footer-elementor"),
            content: <GeneralSettings />,
        },
        {
            id: 2,
            icon: (
                <img
                    src={`${sureFeedbackAdmin.settings_selected_url}`}
                    alt={__("Custom SVG", "header-footer-elementor")}
                    className="object-contain"
                />
            ),
            selected: (
                <img
                    src={`${sureFeedbackAdmin.settings_selected_url}`}
                    alt={__("Custom SVG", "header-footer-elementor")}
                    className="object-contain"
                />
            ),
            title: __("White Label", "header-footer-elementor"),
            content: <WhiteLabel />,
        },
  	]

    // Default state: Set 'My Account' (first item) as the default when the settings tab is clicked
    const [selectedItem, setSelectedItem] = useState(() => {
        const savedItemId = localStorage.getItem("hfeSelectedItemId");
        const savedItem = items.find((item) => item.id === Number(savedItemId));
        return savedItem || items[0]; // Default to the first item if no saved item is found
    });

    useEffect(() => {
        // Store selectedItemId in localStorage (or other persistent storage) to retain selection
        localStorage.setItem("hfeSelectedItemId", selectedItem.id.toString());
    }, [selectedItem]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab) {
            const itemId = Number(tab);
            const item = items.find((item) => item.id === itemId);
            if (item) {
                setSelectedItem(item);
            }
        }
    }, []);

    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleSettingsTabClick = () => {
        setSelectedItem(items[0]); // Set "My Account" as the default item when settings tab is clicked
    };

    return (
        <>
            <NavMenu onSettingsTabClick={handleSettingsTabClick} />
            <div className="">
                <Container
                    align="stretch"
                    className="p-1 flex-col lg:flex-row ph_child-settings-page"
                    containerType="flex"
                    direction="row"
                    gap="sm"
                    justify="start"
                    style={{ height: "100%" }}
                >
                    <Container.Item
                        className="p-2 ph_child-sticky-outer-wrapper"
                        alignSelf="auto"
                        order="none"
                        shrink={1}
                        style={{ backgroundColor: "#ffffff" }}
                    >
                        <div className="ph_child-sticky-sidebar">
                            <Sidebar
                                items={items}
                                onSelectItem={handleSelectItem}
                                selectedItemId={selectedItem.id}
                            />
                        </div>
                    </Container.Item>
                    <Container.Item
                        className="p-2 flex w-full justify-center items-start ph_child-hide-scrollbar"
                        alignSelf="auto"
                        order="none"
                        shrink={1}
                        style={{
                            height: "calc(100vh - 1px)",
                            overflowY: "auto",
                        }}
                    >
                        <div className="ph_child-78-width">
                            <Content selectedItem={selectedItem} />
                        </div>
                    </Container.Item>
                </Container>
            </div>
        </>
    );
};

export default Settings;
