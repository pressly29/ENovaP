/**
 * Tab Navigator Component
 * 
 * Provides tab navigation between "Default Bots" and "Advanced Strategies"
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { BotTabs, BOT_TABS } from '../data/bot-tabs';
import './tab-navigator.scss';

interface TabNavigatorProps {
    activeTab: BotTabs;
    onTabChange: (tab: BotTabs) => void;
}

const TabNavigator: React.FC<TabNavigatorProps> = observer(({ activeTab, onTabChange }) => {
    return (
        <div className="bot-tab-navigator">
            <div className="bot-tab-navigator__tabs">
                {BOT_TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`bot-tab-navigator__tab ${activeTab === tab.id ? 'bot-tab-navigator__tab--active' : ''}`}
                        onClick={() => onTabChange(tab.id as BotTabs)}
                    >
                        <span className="bot-tab-navigator__tab-icon">{tab.icon}</span>
                        <div className="bot-tab-navigator__tab-content">
                            <span className="bot-tab-navigator__tab-label">{tab.label}</span>
                            <span className="bot-tab-navigator__tab-description">{tab.description}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
});

TabNavigator.displayName = 'TabNavigator';

export default TabNavigator;
