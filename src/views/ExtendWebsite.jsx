import React, { useState, useEffect } from 'react'
import ExtendWebsiteWidget from './ExtendWebsiteWidget';
import { Container, Skeleton } from "@bsf/force-ui";
import { __ } from '@wordpress/i18n';

const ExtendWebsite = () => {

    const [plugins, setPlugins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updateCounter, setUpdateCounter] = useState(0);
    const [allInstalled, setAllInstalled] = useState(false);
    const [activatedPlugins, setActivatedPlugins] = useState(new Set());

    const getStaticPlugins = () => {
        const pluginsData = {
            'surerank/surerank.php': {
                icon: sureFeedbackAdmin.surerank_icon,
                type: 'plugin',
                name: __('Boost Your Traffic with Easy SEO Optimization!', 'ph_child'),
                desc: __('Rank higher with effortless SEO optimization. SureRank offers a simple, clutter-free interface with lightweight code, minimal setup, clear meta and schema settings, and smart content optimization that actually makes sense, helping you grow your traffic easily.', 'ph_child'),
                wporg: 'https://wordpress.org/plugins/surerank/',
                url: 'https://downloads.wordpress.org/plugin/surerank.zip',
                siteurl: 'https://surerank.com/',
                isFree: true,
                slug: 'surerank',
                status: 'Install',
                settings_url: sureFeedbackAdmin.admin_url + 'admin.php?page=surerank_onboarding',
            },
            'surecart/surecart.php': {
                icon: sureFeedbackAdmin.surecart_icon,
                type: 'plugin',
                name: __('Sell Products Effortlessly with SureCart!', 'ph_child'),
                desc: __('Sell your products effortlessly with a modern, flexible eCommerce system. SureCart makes it easy to set up one-click checkout, manage subscriptions, recover abandoned carts, and collect secure payments, helping you launch and grow your online store confidently.', 'ph_child'),
                wporg: 'https://wordpress.org/plugins/surecart/',
                url: 'https://downloads.wordpress.org/plugin/surecart.zip',
                siteurl: 'https://surecart.com/',
                isFree: true,
                slug: 'surecart',
                status: 'Install',
                settings_url: sureFeedbackAdmin.admin_url + 'admin.php?page=sc-getting-started',
            },
            'sureforms/sureforms.php': {
                icon: sureFeedbackAdmin.sureforms_icon,
                type: 'plugin',
                name: __('Build Powerful Forms in Minutes with SureForms!', 'ph_child'),
                desc: __('Build powerful forms in minutes without complexity. SureForms lets you create contact forms, payment forms, and surveys using an AI-assisted, clean interface with conversational layouts, conditional logic, payment collection, and mobile optimization for a seamless experience.', 'ph_child'),
                wporg: 'https://wordpress.org/plugins/sureforms/',
                url: 'https://downloads.wordpress.org/plugin/sureforms.zip',
                siteurl: 'https://sureforms.com/',
                slug: 'sureforms',
                isFree: true,
                status: 'Install',
                settings_url: sureFeedbackAdmin.admin_url + 'admin.php?page=sureforms_menu',
            },
            'presto-player/presto-player.php': {
                icon: sureFeedbackAdmin.presto_player_icon,
                type: 'plugin',
                name: __('Add Engaging Videos Seamlessly with Presto Player!', 'ph_child'),
                desc: __('Add engaging videos seamlessly in minutes without complexity. Presto Player lets you enhance your website with videos using branding, chapters, and call-to-actions while providing fast load times, detailed analytics, and user-friendly controls for a seamless viewing experience.', 'ph_child'),
                wporg: 'https://wordpress.org/plugins/presto-player/',
                url: 'https://downloads.wordpress.org/plugin/presto-player.zip',
                siteurl: 'https://prestoplayer.com/',
                slug: 'presto-player',
                isFree: true,
                status: 'Install',
                settings_url: sureFeedbackAdmin.admin_url + 'edit.php?post_type=pp_video_block',
            },
            'suretriggers/suretriggers.php': {
                icon: sureFeedbackAdmin.suretriggers_icon,
                type: 'plugin',
                name: __('Automate Your Workflows Easily with Ottokit!', 'ph_child'),
                desc: __('Automate workflows effortlessly in minutes without complexity. Ottokit lets you connect your WordPress site with web apps to automate tasks, sync data, and run actions using a clean visual builder with scheduling, filters, conditions, and webhooks for a seamless experience.', 'ph_child'),
                wporg: 'https://wordpress.org/plugins/suretriggers/',
                url: 'https://downloads.wordpress.org/plugin/suretriggers.zip',
                siteurl: 'https://ottokit.com/',
                slug: 'suretriggers',
                isFree: true,
                status: 'Install',
                settings_url: sureFeedbackAdmin.admin_url + 'admin.php?page=suretriggers',
            },
        };

        return Object.keys(pluginsData).map((key) => ({
            path: key,
            ...pluginsData[key],
        }));
    };

    useEffect(() => {
        const fetchPluginStatus = async () => {
            setLoading(true);
            try {
                // Create form data for AJAX request
                const formData = new FormData();
                formData.append('action', 'get_plugin_status');
                formData.append('nonce', sureFeedbackAdmin.nonce);

                // Get real plugin status via AJAX
                const response = await fetch(sureFeedbackAdmin.ajax_url, {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                
                if (result.success) {
                    const statusData = result.data;
                    const staticPluginsData = getStaticPlugins();
                    
                    // Merge static data with real status
                    const pluginsWithStatus = staticPluginsData.map(plugin => ({
                        ...plugin,
                        status: statusData[plugin.path] || 'Install'
                    }));

                    // Filter out activated plugins and locally activated ones
                    const availablePlugins = pluginsWithStatus.filter(plugin => 
                        plugin.status !== 'Activated' && !activatedPlugins.has(plugin.path)
                    );
                    
                    setPlugins(availablePlugins);

                    // Check if all plugins are activated
                    const areAllInstalled = pluginsWithStatus.every(plugin => 
                        plugin.status === 'Activated' || activatedPlugins.has(plugin.path)
                    );
                    setAllInstalled(areAllInstalled);
                } else {
                    console.error("Plugin status check failed:", result);
                    // Fallback to local state only
                    const staticPluginsData = getStaticPlugins();
                    const availablePlugins = staticPluginsData.filter(plugin => 
                        !activatedPlugins.has(plugin.path)
                    );
                    setPlugins(availablePlugins);
                }
            } catch (error) {
                console.error("Error fetching plugin status:", error);
                // Fallback to local state only
                const staticPluginsData = getStaticPlugins();
                const availablePlugins = staticPluginsData.filter(plugin => 
                    !activatedPlugins.has(plugin.path)
                );
                setPlugins(availablePlugins);
            } finally {
                setLoading(false);
            }
        };

        fetchPluginStatus();
    }, [updateCounter, activatedPlugins]);

    // Function to mark a plugin as activated
    const markPluginAsActivated = (pluginPath) => {
        setActivatedPlugins(prev => new Set([...prev, pluginPath]));
        // Also trigger a refresh after a short delay
        setTimeout(() => {
            setUpdateCounter(prev => prev + 1);
        }, 500);
    };

    // If all plugins are installed, don't render the component
    if (allInstalled) {
        return null;
    }

    return (
        <div className="bg-white w-full" style={{ borderRadius: '6px'}}>
            <div className="flex items-center justify-between p-4" style={{ paddingBottom: '0' }}>
                <p className="m-0 text-sm font-semibold text-text-primary">
                    {__("Super Charge Your Workflow", "ph_child")}
                </p>
                <div className="flex items-center gap-x-2 mr-7"></div>
            </div>
            <div className="flex flex-col rounded-lg p-4" style={{ backgroundColor: "white" }}>
                {loading ? (
                    <Container
                        align="stretch"
                        className="gap-1 p-1 grid grid-cols-1 md:grid-cols-1"
                        containerType="grid"
                        justify="start"
                    >
                        {[...Array(1)].map((_, index) => (
                            <Container.Item
                                key={index}
                                alignSelf="auto"
                                style={{ height: '150px' }}
                                className="text-wrap rounded-md shadow-container-item bg-[#F9FAFB] p-4"
                            >
                                <div className="flex flex-col gap-6" style={{ marginTop: '40px' }}>
                                    <Skeleton className="w-12 h-2 rounded-md" />
                                    <Skeleton className="w-16 h-2 rounded-md" />
                                    <Skeleton className="w-12 h-2 rounded-md" />
                                </div>
                            </Container.Item>
                        ))}
                    </Container>
                ) : (
                    <Container
                        align="stretch"
                        className="gap-1 p-1 grid grid-cols-1 md:grid-cols-1"
                        containerType="grid"
                        justify="start"
                        style={{ backgroundColor: "#F9FAFB" }}
                    >
                        {plugins.slice(0, 1).map((plugin) => (
                            <Container.Item
                                key={plugin.slug}
                                alignSelf="auto"
                                className="text-wrap rounded-md shadow-container-item bg-background-primary p-4"
                            >
                                <ExtendWebsiteWidget 
                                    plugin={plugin} 
                                    setUpdateCounter={setUpdateCounter}
                                    markPluginAsActivated={markPluginAsActivated} 
                                />
                            </Container.Item>
                        ))}
                    </Container>
                )}
            </div>
        </div>
    )
}

export default ExtendWebsite;
