import { Container, Skeleton } from "@bsf/force-ui";
import { __ } from "@wordpress/i18n";
import { routes } from '../admin/settings/routes';
import { Link, history } from '../router/index';
import { ArrowUpRight } from "lucide-react";
import { Settings, BadgeCheck, Image as IconImage, Globe, FolderKanban } from "lucide-react";
import React, { useState } from 'react';

const QuickSettings = () => {

    const [loading, setLoading] = useState(false);

    const settings = [
      { label: 'Connection', tab: 1, icon: BadgeCheck },
        { label: 'Integration', tab: 1, icon: Settings },
        { label: 'White Label', tab: 2, icon: FolderKanban },
        { label: 'Admin Access', tab: 1, icon: Globe },
    ];

    const handleTabRedirect = (e, tab) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        const query = params.toString();
        history.push(`${window.location.pathname}${query ? '?' + query : ''}#${routes.settings.path}`);
    };

    return (
        <div className='rounded-lg bg-white w-full mb-4' style={{ borderRadius: '6px', }}>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between p-4'
                style={{
                    paddingBottom: '0',
                    borderRadius: '6px',
                }}>
                <p className='m-0 text-sm font-semibold text-text-primary mb-2 md:mb-0'>{__("Quick Settings", "ph_child")}</p>
            </div>
            <div className='flex  flex-col rounded-lg p-4'>
                {loading ? (
                    <Container
                        align="stretch"
                        className="p-2 gap-1.5 grid grid-cols-2 md:grid-cols-4"
                        style={{
                            backgroundColor: "#F9FAFB"
                        }}
                        containerType="grid"
                        gap=""
                        justify="start"
                    >
                        {[...Array(4)].map((_, index) => (
                            <Container.Item
                                key={index}
                                alignSelf="auto"
                                className="text-wrap rounded-md shadow-container-item bg-background-primary p-6 space-y-2"
                            >
                                <Skeleton className='w-12 h-2 rounded-md' />
                                <Skeleton className='w-16 h-2 rounded-md' />
                                <Skeleton className='w-12 h-2 rounded-md' />
                            </Container.Item>
                        ))}
                    </Container>
                ) : (
                    <Container
                        align="stretch"
                        className="p-1 gap-1.5 grid-cols-2 md:grid-cols-4"
                        containerType="grid"
                        gap=""
                        justify="start"
                        style={{
                            backgroundColor: '#F9FAFB'
                        }}
                    >
                        {settings?.map((setting, index) => {
                            const Icon = setting.icon;
                            return (
                                <Container.Item
                                    key={index}
                                    alignSelf="auto"
                                    className="text-wrap rounded-md shadow-container-item bg-background-primary p-4"
                                >
                                    <div className="flex flex-col items-start ">
                                        {Icon && <Icon className="h-5 w-5 text-text-secondary" />}
                                        <h3 className="text-sm font-medium text-text-primary">{setting.label}</h3>
                                        <Link
                                            to={routes.settings.path}
                                            onClick={(e) => handleTabRedirect(e, setting.tab)}
                                            className="text-sm text-text-tertiary cursor-pointer no-underline hover:text-gray-600"
                                        >
                                            {__("Customize", "ph_child")}
                                        </Link>
                                    </div>
                                </Container.Item>
                            );
                        })}
                    </Container>
                )}
            </div>
        </div>
    );
};

export default QuickSettings;
