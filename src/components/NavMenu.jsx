import React, { useEffect, useState } from "react";
import { Topbar, Button, Badge, DropdownMenu } from "@bsf/force-ui";
import {
	ArrowUpRight,
	CircleHelp,
	FileText,
	Headset,
	House,
	User,
} from "lucide-react";
import { __ } from "@wordpress/i18n";
import { routes } from "../admin/settings/routes";
import { Link } from "../router/index";

function updateNavMenuActiveState() {
	const currentPath = window.location.hash;
	const menuItems = document.querySelectorAll(
		"#adminmenu #toplevel_page_hfe a"
	);

	menuItems.forEach((item) => {
		const href = item.getAttribute("href");
		const parentLi = item.closest("li");
		const itemText = item.textContent.trim();

		if (
			href &&
			(currentPath.includes(href.split("#")[1]) ||
				("#surefeedback-dashboard" === currentPath && itemText === "Dashboard"))
		) {
			parentLi.classList.add("current");
		} else {
			parentLi.classList.remove("current");
		}
	});
}

const NavMenu = () => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	useEffect(() => {
		updateNavMenuActiveState();
		window.addEventListener("hashchange", updateNavMenuActiveState);

		return () => {
			window.removeEventListener("hashchange", updateNavMenuActiveState);
		};
	}, []);

	// Get the current URL's hash part (after the #).
	const currentPath = window.location.hash;

	const isActive = (path) => currentPath.includes(path);

	const linkStyle = (path) => ({
		color: isActive(path) ? "#111827" : "#4B5563",
		borderBottom: isActive(path) ? "2px solid #6005FF" : "none",
		paddingBottom: "22px",
		marginBottom: "-16px",
	});

	const handleRedirect = (url) => {
		window.open(url, "_blank");
		setIsDropdownOpen(false);
	};

	return (
		<Topbar
			className="ph_child-nav-menu relative"
			style={{
				width: "unset",
				padding: "0.5rem",
				zIndex: "9",
				paddingTop: "1rem",
			}}
		>
			<div className="flex flex-col lg:flex-row items-start md:items-center w-full">
				{/* Top row on mobile: Logo and Nav menu */}
				<div className="flex flex-row md:items-center md:gap-8 w-full">
					<Topbar.Left>
						<Topbar.Item>
							<Link to={routes.dashboard.path}>
								<img
									src={`${sureFeedbackAdmin.icon_url}`}
									alt="Icon"
									className="ml-4 cursor-pointer"
									style={{ height: "35px", width: "35px" }}
								/>
							</Link>
						</Topbar.Item>
					</Topbar.Left>
					<Topbar.Middle className="flex-grow" align="left">
						<Topbar.Item>
							<nav className="flex flex-wrap gap-6 mt-2 md:mt-0 cursor-pointer">
								<Link
									to={routes.dashboard.path}
									className={`${
										isActive("dashboard")
											? "active-link"
											: ""
									}`}
									style={linkStyle("dashboard")}
								>
									{__("Dashboard", "header-footer-elementor")}
								</Link>
								<Link
									to={routes.settings.path}
									className={`${
										isActive("settings")
											? "active-link"
											: ""
									}`}
									style={linkStyle("settings")}
								>
									{__("Settings", "header-footer-elementor")}
								</Link>
								<Link
									to={routes.upgrade.path}
									className={`${
										isActive("upgrade") ? "active-link" : ""
									}`}
									style={linkStyle("upgrade")}
								>
									{__(
										"Free vs Pro",
										"header-footer-elementor"
									)}
								</Link>
							</nav>
						</Topbar.Item>
						<Topbar.Item>
							<Button
								icon={<ArrowUpRight />}
								iconPosition="right"
								variant="ghost"
								className="ph_child-remove-ring mb-2"
								style={{
									color: "#6005FF",
									// paddingBottom: "10px",
									background: "none",
									border: "none",
									padding: 0,
									cursor: "pointer",
								}}
								onClick={() =>
									handleRedirect(
										"https://ultimateelementor.com/pricing/?utm_source=uae-lite-dashboard&utm_medium=navigation-bar&utm_campaign=uae-lite-upgrade"
									)
								}
							>
								{__("Get Pro", "header-footer-elementor")}
							</Button>
						</Topbar.Item>
					</Topbar.Middle>
					<Topbar.Right className="gap-4">
						<Topbar.Item>
							<DropdownMenu placement="bottom-end">
								<DropdownMenu.Trigger>
									<Badge
										label={__(
											"Free",
											"header-footer-elementor"
										)}
										size="xs"
										variant="neutral"
									/>
									<span className="sr-only">Open Menu</span>
								</DropdownMenu.Trigger>
								<DropdownMenu.Portal>
								<DropdownMenu.ContentWrapper>
								<DropdownMenu.Content className="w-60">
										<DropdownMenu.List>
											<DropdownMenu.Item>
												{__(
													"Version",
													"header-footer-elementor"
												)}
											</DropdownMenu.Item>
											{/* <DropdownMenu.Item>
												<div className="flex justify-between w-full">
													{`${hfeSettingsData.uaelite_current_version}`}
													<Badge
														label={__(
															"Free",
															"header-footer-elementor"
														)}
														size="xs"
														variant="neutral"
													/>
												</div>
											</DropdownMenu.Item> */}
										</DropdownMenu.List>
									</DropdownMenu.Content>
								</DropdownMenu.ContentWrapper>
								</DropdownMenu.Portal>
							</DropdownMenu>
						</Topbar.Item>
						<Topbar.Item className="gap-4 cursor-pointer">
							<DropdownMenu placement="bottom-end">
								<DropdownMenu.Trigger>
									<CircleHelp />
								</DropdownMenu.Trigger>
								<DropdownMenu.Portal>
								<DropdownMenu.ContentWrapper>
								<DropdownMenu.Content className="w-60">
										<DropdownMenu.List>
											<DropdownMenu.Item>
												{__(
													"Useful Resources",
													"header-footer-elementor"
												)}
											</DropdownMenu.Item>
											<DropdownMenu.Item
												className="text-text-primary"
												style={{ color: "black" }}
												onClick={() =>
													handleRedirect(
														"https://ultimateelementor.com/docs/getting-started-with-ultimate-addons-for-elementor-lite/"
													)
												}
											>
												<FileText
													style={{ color: "black" }}
												/>
												{__(
													"Getting Started",
													"header-footer-elementor"
												)}
											</DropdownMenu.Item>
											<DropdownMenu.Item
												onClick={() =>
													handleRedirect(
														"https://ultimateelementor.com/docs-category/widgets/"
													)
												}
											>
												<FileText />
												{__(
													"How to use widgets",
													"header-footer-elementor"
												)}
											</DropdownMenu.Item>
											<DropdownMenu.Item
												onClick={() =>
													handleRedirect(
														"https://ultimateelementor.com/docs-category/features/"
													)
												}
											>
												<FileText />
												{__(
													"How to use features",
													"header-footer-elementor"
												)}
											</DropdownMenu.Item>
											<DropdownMenu.Item
												onClick={() =>
													handleRedirect(
														"https://ultimateelementor.com/docs-category/templates/"
													)
												}
											>
												<FileText />
												{__(
													"How to use templates",
													"header-footer-elementor"
												)}
											</DropdownMenu.Item>
											<DropdownMenu.Item
												onClick={() =>
													handleRedirect(
														"https://ultimateelementor.com/contact/"
													)
												}
											>
												<Headset />
												{__(
													"Contact us",
													"header-footer-elementor"
												)}
											</DropdownMenu.Item>
										</DropdownMenu.List>
									</DropdownMenu.Content>
								</DropdownMenu.ContentWrapper>
								</DropdownMenu.Portal>
							</DropdownMenu>
						</Topbar.Item>
						<Link to={routes.settings.path}>
							<User
								className="cursor-pointer ph_child-user-icon"
								style={{ color: "black" }}
							/>
						</Link>
					</Topbar.Right>
				</div>
			</div>
		</Topbar>
	);
};

export default NavMenu;
