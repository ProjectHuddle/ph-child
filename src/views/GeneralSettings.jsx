import React, { useState, useEffect } from "react";
import { Button, Title } from "@bsf/force-ui";
import { __ } from "@wordpress/i18n";
// import apiFetch from "@wordpress/api-fetch";
import { LoaderCircle } from 'lucide-react';

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
                title={__('General Settings', 'ultimate_vc')}
                description={__('Manage global preferences for your SureFeedback workspace, including branding, access controls, notifications, and default project configurations.', 'ultimate_vc')}
            />
            <div
                className="box-border bg-background-primary p-6 rounded-lg"
                style={{
                    marginTop: "24px",
                }}
            >
          
                    <div>
                        <div
                            shrink={1}
                            className="md:mt-0 flex items-center mb-8 justify-center mt-4">
                            <img
                                src={`${sureFeedbackAdmin.license_url}`}
                                alt="Template Showcase"
                                className="object-contain rounded"
                            />
                        </div>
                        <div style={{ marginTop: '20px' }}>
                            <Title
                                description=""
                                icon={null}
                                iconPosition="right"
                                className="flex items-center justify-center mt-6"
                                size="md"
                                tag="h3"
                                title={__("Activate Your License", "ultimate_vc")}
                            />
                        </div>
                    </div>
        


                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: "10px 10px",
                    }}
                >
                        <div style={{
                            textAlign: "center",
                            backgroundColor: "#fff",
                            backgroundImage: `url(${sureFeedbackAdmin.confetti_banner})`,
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            width: '100%',
                            height: 'auto',
                        }}>
                            <div style={{
                                backgroundColor: "#e7f5ea",
                                borderRadius: "50%",
                                width: "80px",
                                height: "80px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px"

                            }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50" />
                                </svg>
                            </div>
                            <h3 style={{
                                fontSize: "14px",
                                color: "#0017E1",
                            }}>
                                {__('Congratulations!', 'ultimate_vc')}
                            </h3>
                            <h3 style={{
                                fontSize: "18px",
                                color: "#000",
                                marginBottom: "18px"
                            }}>
                                {__('Your License is Active', 'ultimate_vc')}
                            </h3>
                            <p
                                className="text-center"
                                style={{
                                    maxWidth: "600px",
                                    textAlign: "center",
                                    color: "#9CA3AF",
                                    fontSize: "14px",
                                    margin: "0 auto 20px", // Center horizontally and set bottom spacing
                                }}
                            >
                                {__(
                                    'You now have access to premium features, direct plugin updates, template library and official support.',
                                    'ultimate_vc'
                                )}
                            </p>
                            <Button
                                disabled={isLoading}
                                variant="primary"
                                className="bg-[#0017E1] ph_child-remove-ring"
                                // onClick={handleDeactivateClick}
                                icon={isLoading ? <LoaderCircle className="animate-spin" size={16} /> : null}
                                iconPosition="right"
                                style={{
                                    backgroundColor: "#0017E1",
                                    transition: "background-color 0.3s ease",
                                    marginTop: '8px',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {isLoading ? __('Processing', 'ultimate_vc') : __('Deactivate License', 'ultimate_vc')}
                            </Button>
                        </div>
                </div>
            </div>
        </>
  )
}

export default GeneralSettings