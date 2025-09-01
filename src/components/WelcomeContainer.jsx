import React from "react";
import { Container, Title, Button } from "@bsf/force-ui";
import { ExternalLink, Plus } from "lucide-react";
import { __ } from "@wordpress/i18n";
import { authenticateRedirect, isConnectedWithSaaS, disconnectFromSaaS } from "../lib/utils";

const WelcomeContainer = () => {
	const connected = isConnectedWithSaaS();

	const handleConnectClick = () => {
		if (connected) {
			return; // Do nothing if already connected
		}
		// Navigate to the connect route
		window.location.hash = '#connect';
	};

	const handleDisconnectClick = () => {
		disconnectFromSaaS();
	};

	return (
		<div>
			<Container
				align="center"
				className="bg-background-primary border-[0.5px] border-subtle rounded-xl shadow-sm mb-6 p-8 flex flex-col lg:flex-row"
				containerType="flex"
				direction="row"
				gap="sm"
			>
				<Container.Item shrink={1} className="flex-1">
					<Title
						description=""
						icon={null}
						iconPosition="right"
						className="max-w-lg"
						size="lg"
						tag="h3"
						title={__("Welcome to SureFeedback", "header-footer-elementor")}
					/>
					<p className="text-sm font-medium text-text-tertiary m-0 mt-2">
						{__(
							"Revolutionise your client and team collaboration with SureFeedback. Say goodbye to long email trails and say hello to flawless communication.",
							"header-footer-elementor"
						)}
					</p>
					<div className="flex items-center pt-6 gap-2 flex-wrap">
						{/* Connect/Connected Button */}
						<Button
							iconPosition="right"
							variant="primary"
							className="text-[#6005FF] border-none hfe-remove-ring flex-shrink-0"
							style={{
								backgroundColor: connected ? "#10B981" : "var(--Colors-Button-button-secondary, #DDD6FE)",
								transition: "background-color 0.3s ease",
								border: "none",
								outline: 'none',
								boxShadow: 'none',
								color: connected ? "#fff" : "#6005FF"
							}}
							onMouseEnter={(e) => {
								if (!connected) {
									e.currentTarget.style.backgroundColor = "#4B00CC";
									e.currentTarget.style.color = "#fff";
								}
							}}
							onMouseLeave={(e) => {
								if (!connected) {
									e.currentTarget.style.backgroundColor = "var(--Colors-Button-button-secondary, #DDD6FE)";
									e.currentTarget.style.color = "#6005FF";
								}
							}}
							onClick={handleConnectClick}
							disabled={connected}
						>
							{connected 
								? __("Connected to SureFeedback", "ph-child")
								: __("Connect to SureFeedback", "ph-child")
							}
						</Button>

						{/* Disconnect Button - only show when connected */}
						{connected && (
							<Button
								iconPosition="right"
								variant="secondary"
								className="border-none hfe-remove-ring flex-shrink-0"
								style={{
									backgroundColor: "#ef4444",
									transition: "background-color 0.3s ease",
									border: "none",
									outline: 'none',
									boxShadow: 'none',
									color: "#fff"
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = "#dc2626";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = "#ef4444";
								}}
								onClick={handleDisconnectClick}
							>
								{__("Disconnect", "ph-child")}
							</Button>
						)}
						<div
							style={{
								color: "black",
								background: "none",
								border: "none",
								padding: 0,
								cursor: "pointer",
							}}
							className="flex-shrink-0"
							onMouseEnter={(e) =>
								(e.currentTarget.style.color = "#6005ff")
							}
							onMouseLeave={(e) =>
								(e.currentTarget.style.color = "black")
							}
							onClick={() => {
								window.open(
									"https://ultimateelementor.com/docs/getting-started-with-ultimate-addons-for-elementor-lite/",
									"_blank"
								);
							}}
						>
						</div>
					</div>
				</Container.Item>
				<Container.Item className="md:mt-0 mt-4 flex-shrink-0">
				{/* <iframe
						width="280"
						height="160"
						src="https://www.youtube.com/embed/ZeogOxqdKJI"
						frameBorder="0"
						style={{ borderRadius: "8px" }}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
					/> */}
                    	<img
									src={`${sureFeedbackAdmin.welcome_url}`}
									alt="Icon"
									
								/>
				</Container.Item>
			</Container>
		</div>
	);
};
export default WelcomeContainer;
