/**
 * Marketplace Grid Component
 * 
 * Vertical scrolling grid layout with tab navigation and category filtering.
 */

import React from 'react';
import { Text } from '@deriv/components';
import { observer, useStore } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import MarketplaceCard from './marketplace-card';
import TabNavigator from './tab-navigator';
import CategoryFilter from './category-filter';
import { BotMetadata } from '../data/types';
import { BotTabs, BotCategoryFilter } from '../data/bot-tabs';
import './marketplace-grid.scss';

interface MarketplaceGridProps {
    bots: BotMetadata[];
    onLoadBot: (botId: number) => void;
    onViewDetails: (bot: BotMetadata) => void;
    loading?: boolean;
}

const MarketplaceGrid: React.FC<MarketplaceGridProps> = observer(({ 
    bots, 
    onLoadBot, 
    onViewDetails,
    loading = false 
}) => {
    const { ui } = useStore();
    const { is_mobile } = ui;
    
    // Tab and filter state
    const [activeTab, setActiveTab] = React.useState<BotTabs>(BotTabs.DEFAULT);
    const [activeFilter, setActiveFilter] = React.useState<BotCategoryFilter>(BotCategoryFilter.ALL);

    // Filter bots based on active tab and category filter
    const filteredBots = React.useMemo(() => {
        // First filter by tab
        let result = bots.filter(bot => bot.tab === activeTab);
        
        // If on Advanced tab and filter is not ALL, apply category filter
        if (activeTab === BotTabs.ADVANCED && activeFilter !== BotCategoryFilter.ALL) {
            result = result.filter(bot => bot.categoryFilter === activeFilter);
        }
        
        return result;
    }, [bots, activeTab, activeFilter]);

    // Reset filter to ALL when switching tabs
    const handleTabChange = (tab: BotTabs) => {
        setActiveTab(tab);
        setActiveFilter(BotCategoryFilter.ALL);
    };

    // Loading state
    if (loading) {
        return (
            <div className="marketplace-grid__loading">
                <div className="marketplace-grid__spinner" />
                <Text size="s" className="marketplace-grid__loading-text">
                    <Localize i18n_default_text="Loading bots..." />
                </Text>
            </div>
        );
    }

    // Empty state
    if (!filteredBots || filteredBots.length === 0) {
        return (
            <div className="marketplace-grid__wrapper">
                <TabNavigator activeTab={activeTab} onTabChange={handleTabChange} />
                {activeTab === BotTabs.ADVANCED && (
                    <CategoryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                )}
                <div className="marketplace-grid__empty">
                    <div className="marketplace-grid__empty-icon">🤖</div>
                    <Text size="m" weight="bold" className="marketplace-grid__empty-title">
                        <Localize i18n_default_text="No bots found" />
                    </Text>
                    <Text size="s" className="marketplace-grid__empty-text">
                        <Localize i18n_default_text="Try selecting a different category" />
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div className="marketplace-grid__wrapper">
            {/* Tab Navigation */}
            <TabNavigator activeTab={activeTab} onTabChange={handleTabChange} />
            
            {/* Category Filter (only show on Advanced tab) */}
            {activeTab === BotTabs.ADVANCED && (
                <CategoryFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            )}
            
            {/* Grid Container */}
            <div className="marketplace-grid">
                <div className="marketplace-grid__container">
                    {filteredBots.map((bot) => (
                        <MarketplaceCard
                            key={bot.id}
                            bot={bot}
                            onLoadBot={onLoadBot}
                            onViewDetails={onViewDetails}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

export default MarketplaceGrid;
