// Adapted from https://github.com/Surajmaurya1/easyui/blob/main/src/components/ui/AnimatedTabs.tsx
// MIT License, Copyright (c) 2026 Suraj Maurya. See ./LICENSE
//
// Adaptation: upstream interaction model is unchanged — a shared-layout pill
// indicator that springs between tabs (framer-motion `layoutId`) plus an
// `AnimatePresence` cross-fade for the panel. Only the Tailwind class
// strings were replaced with DSH-token classes (`lm-eui-*`), and the upstream
// `motionTransitions` spring tokens are reused verbatim.

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "./utils";
import { motionTransitions } from "./motion-tokens";

export interface TabItem {
	id: string;
	label: string;
	icon?: React.ReactNode;
	content?: React.ReactNode;
	badge?: string | number;
}

export interface AnimatedTabsProps {
	tabs: TabItem[];
	defaultTab?: string;
	activeTab?: string;
	onChange?: (tabId: string) => void;
	className?: string;
	tabsContainerClassName?: string;
	renderContent?: boolean;
	layoutId?: string;
	variant?: "default" | "glass" | "pill";
}

export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({
	tabs,
	defaultTab,
	activeTab: controlledActiveTab,
	onChange,
	className,
	tabsContainerClassName,
	renderContent = true,
	layoutId: customLayoutId,
	variant = "default",
}) => {
	const [internalActiveTab, setInternalActiveTab] = useState<string>(defaultTab || tabs[0]?.id || "");
	const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;
	const uniqueId = React.useId();
	const indicatorLayoutId = customLayoutId || `active-tab-indicator-${uniqueId}`;

	React.useEffect(() => {
		if (defaultTab && controlledActiveTab === undefined) {
			setInternalActiveTab(defaultTab);
		}
	}, [defaultTab, controlledActiveTab]);

	const handleTabClick = (tabId: string) => {
		if (controlledActiveTab === undefined) {
			setInternalActiveTab(tabId);
		}
		onChange?.(tabId);
	};

	const currentTabObj = tabs.find((t) => t.id === activeTab);
	const isGlass = variant === "glass" || variant === "pill";

	return (
		<div className={cn("lm-eui-tabs", className)}>
			<div
				role="tablist"
				className={cn("lm-eui-tablist", isGlass && "is-glass", tabsContainerClassName)}
			>
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={isActive}
							onClick={() => handleTabClick(tab.id)}
							className={cn("lm-eui-tab", isActive && "is-active")}
						>
							{isActive && (
								<motion.div
									layoutId={indicatorLayoutId}
									className={cn("lm-eui-tab-indicator", isGlass && "is-glass")}
									transition={motionTransitions.springMorph}
								/>
							)}
							<span className="lm-eui-tab-body">
								{tab.icon && <span>{tab.icon}</span>}
								{tab.label}
								{tab.badge && <span className="lm-eui-tab-badge">{tab.badge}</span>}
							</span>
						</button>
					);
				})}
			</div>

			{renderContent && (
				<div className="lm-eui-tabpanel">
					<AnimatePresence mode="wait">
						{currentTabObj?.content && (
							<motion.div
								key={activeTab}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -6 }}
								transition={motionTransitions.springGentle}
								className="lm-eui-tabpanel-content"
							>
								{currentTabObj.content}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
};
