import React from "react";
import { Container, Title, Button } from "@bsf/force-ui";
import { Zap } from "lucide-react";
import { __ } from "@wordpress/i18n";
import { Link, history } from '../router/index';
import { routes } from "../admin/settings/routes";
import { Plus } from "lucide-react";

const Connection = () => {

     const settings = [
        { label: 'Google Manager', tab: 4 },
    ];

        const handleTabRedirect = (e, tab) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);
        const query = params.toString();
        history.push(`${window.location.pathname}${query ? '?' + query : ''}#${routes.settings.path}`);
    };
    
    return (
        <Container
            // align="center"
            className="bg-background-primary border-[0.5px] border-subtle rounded-xl shadow-sm mb-6 p-6 flex flex-col lg:flex-col"
            containerType="flex"
            direction="row"
            // justify="between"
            gap="sm"
        >
            <Container.Item
                className="md:mt-0 mt-4">
                <img
                    src={`${sureFeedbackAdmin.connection_url}`}
                    alt="Template Showcase"
                    // style={{ height: '13.3125rem', width: '20.25rem' }}
                    className="object-contain rounded"
                />
            </Container.Item>
            <Container.Item shrink={1}>
                <div className="">
                    <Title
                        description=""
                        icon={null}
                        iconPosition="right"
                        className=""
                        size="md"
                        tag="h3"
                        title={__("Your Connection", "ph_child")}
                    />
                </div>
                <p className="text-sm font-medium text-text-tertiary m-0  mt-2" style={{ maxWidth: '23rem' }}>
                    {__(
                        "Connect to your SureFeedback Dashboard to unlock advanced features, manage projects efficiently, customize settings, and gain full control over your feedback workflow.",
                        "ph_child"
                    )}
                </p>
                {settings?.map((setting, index) => {
                    return (
                        <div
                            key={index}
                            className="flex items-center gap-2"
                            style={{ paddingTop: '1.5rem', maxWidth: '9rem' }}
                        >
                            <Link
                                to={routes.settings.path}
                                onClick={(e) => handleTabRedirect(e, setting.tab)}
                            >
                                <Button
                                    className="ph_child-remove-ring rounded-md"
                                    icon={<Plus />}
                                    iconPosition="right"
                                    size="md"
                                    style={{ width: '330px', borderRadius: '4px' }}
                                    variant="primary"
                                >
                                    {__('Connect', 'ph_child')}
                                </Button>
                            </Link>
                        </div>
                    );
                })}
            </Container.Item>
        </Container>
    )
}

export default Connection
