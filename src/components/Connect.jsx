import React, { useEffect } from "react";
import { authenticateRedirect } from "../lib/utils";
import { ArrowRight } from "lucide-react";

const Connect = () => {
	const features = [
		{
			name: 'Visual Feedback Collection',
			description:
				'Collect sticky note-style feedback directly on web designs and live websites with precise positioning.',
			icon: () => (
				<div className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center">
					<span className="text-white text-xs font-bold">📝</span>
				</div>
			),
		},
		{
			name: 'Client Collaboration',
			description:
				'Streamline client communication with organized feedback threads and approval workflows.',
			icon: () => (
				<div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center">
					<span className="text-white text-xs font-bold">👥</span>
				</div>
			),
		},
		{
			name: 'Project Management',
			description:
				'Organize feedback by projects and manage multiple client websites from one dashboard.',
			icon: () => (
				<div className="w-7 h-7 bg-purple-500 rounded flex items-center justify-center">
					<span className="text-white text-xs font-bold">📁</span>
				</div>
			),
		},
		{
			name: 'Real-time Updates',
			description:
				'Get instant notifications when clients leave feedback or approve changes.',
			icon: () => (
				<div className="w-7 h-7 bg-orange-500 rounded flex items-center justify-center">
					<span className="text-white text-xs font-bold">⚡</span>
				</div>
			),
		},
		{
			name: 'Easy Implementation',
			description:
				'Simple plugin installation with no technical setup required. Start collecting feedback immediately.',
			icon: () => (
				<div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
					<span className="text-white text-xs font-bold">🚀</span>
				</div>
			),
		},
		{
			name: 'Professional Workflow',
			description:
				'Maintain professional client relationships with organized feedback and approval processes.',
			icon: () => (
				<div className="w-7 h-7 bg-teal-500 rounded flex items-center justify-center">
					<span className="text-white text-xs font-bold">✨</span>
				</div>
			),
		},
	];

	useEffect(() => {
		const adminBar = document.querySelector('#wpadminbar');
		if (adminBar) {
			adminBar.style.display = 'none';
		}
		const toolbar = document.querySelector('html.wp-toolbar');
		if (toolbar) {
			toolbar.style.padding = '0';
		}

		const wpBodyContent = document.querySelector('#wpbody-content');
		if (wpBodyContent) {
			wpBodyContent.style.paddingBottom = '0';
		}
		const wpContent = document.querySelector('#wpcontent');
		if (wpContent) {
			wpContent.style.marginLeft = '0';
		}

		const adminMenuWrap = document.querySelector('#adminmenuwrap');
		if (adminMenuWrap) {
			adminMenuWrap.style.display = 'none';
		}
		const adminMenuBack = document.querySelector('#adminmenuback');
		if (adminMenuBack) {
			adminMenuBack.style.display = 'none';
		}
		const wpFooter = document.querySelector('#wpfooter');
		if (wpFooter) {
			wpFooter.style.display = 'none';
			wpFooter.style.marginLeft = '0';
		}
	}, []);

	return (
		<div className="w-full bg-[#F8FAFC] flex">
			<div className="max-w-[856px] shadow-xl rounded mx-auto mt-16 mb-40 bg-white text-center py-12">
				<div className="flex items-center justify-center mb-8">
					<div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
						<span className="text-white text-xl font-bold">SF</span>
					</div>
					<span className="ml-3 text-2xl font-bold text-gray-900">SureFeedback</span>
				</div>

				<div className="max-w-[560px] m-auto mb-6">
					<div className="flex flex-col m-auto mb-6">
						<h1 className="text-gray-900 text-2xl leading-7 font-bold mb-4">
							Welcome to the SureFeedback Setup Wizard!
						</h1>
						<p className="text-sm text-gray-600">
							SureFeedback is a powerful visual feedback platform that
							helps you collect client feedback directly on web designs and live sites.
							Streamline your client collaboration process with organized feedback threads and approval workflows.
						</p>
					</div>
				</div>

				<div className="flex flex-col items-center justify-center">
					<button
						type="button"
						className="cursor-pointer inline-flex items-center px-4 py-3 mb-4 w-80 gap-3 rounded-[3px] justify-center border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
						onClick={() => {
							authenticateRedirect();
						}}
					>
						<span className="text-base font-medium">
							Get Started Now
						</span>
						<ArrowRight
							className="h-5 w-5 text-white"
							aria-hidden="true"
						/>
					</button>
					<a
						href={`${window.origin}/wp-admin`}
						className="text-gray-500 text-[13px] underline leading-6 hover:text-gray-700"
					>
						Go Back to the dashboard
					</a>
				</div>

				<div className="bg-gray-50 py-10 px-12 mb-10 mt-8 rounded-lg">
					<div className="mx-auto max-w-7xl">
						<div className="grid grid-cols-1 gap-x-5 gap-y-6 md:grid-cols-2">
							{features.map((feature) => (
								<div
									key={feature.name}
									className="relative flex flex-col gap-3 sm:flex-row"
								>
									<feature.icon
										className="h-7 w-7 text-gray-900"
										aria-hidden="true"
									/>
									<div className="sm:min-w-0 sm:flex-1 text-left space-y-2">
										<p className="text-lg font-medium text-gray-900">
											{feature.name}
										</p>
										<p className="text-base leading-6 text-gray-600">
											{feature.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				<h2 className="text-gray-900 text-2xl font-bold leading-6 mb-12">
					Trusted by Web Professionals Worldwide
				</h2>

				<div className="flex flex-col items-center justify-center">
					<button
						type="button"
						className="cursor-pointer inline-flex items-center px-4 py-3 mb-4 w-80 gap-3 rounded-[3px] justify-center border border-transparent text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
						onClick={() => {
							authenticateRedirect();
						}}
					>
						<span className="text-base font-medium">
							Get Started Now
						</span>
						<ArrowRight
							className="h-5 w-5 text-white"
							aria-hidden="true"
						/>
					</button>
					<a
						href={`${window.origin}/wp-admin`}
						className="text-gray-500 text-[13px] underline leading-6 hover:text-gray-700"
					>
						Go Back to the dashboard
					</a>
				</div>
			</div>
		</div>
	);
};

export default Connect;