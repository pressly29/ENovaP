import React from 'react';
import { observer, useStore } from '@deriv/stores';
import { DBOT_TABS } from 'Constants/bot-contents';
import { useDBotStore } from 'Stores/useDBotStore';
import { MarketplaceGrid } from '../marketplace';
import { ENHANCED_BOT_LIST } from '../data';
import { BotMetadata } from '../data/types';
import '../marketplace/marketplace-card.scss';
import '../marketplace/marketplace-grid.scss';
import './index.scss';

const RecentComponent = observer(() => {
    const { ui } = useStore();
    const { is_mobile } = ui;
    const { dashboard, toolbar } = useDBotStore();
    const { loadCustomStrategy } = toolbar;
    const { setActiveTab } = dashboard;
    
    const [bots] = React.useState(ENHANCED_BOT_LIST);
    const [selectedBot, setSelectedBot] = React.useState<BotMetadata | null>(null);
    const [loading, setLoading] = React.useState(false);

    // Handle bot loading
    const handleLoadBot = async (botId: number) => {
        setLoading(true);
        try {
            await loadCustomStrategy(botId);
            setActiveTab(DBOT_TABS.BOT_BUILDER);
        } catch (error) {
            // Failed to load bot - error logged internally
        } finally {
            setLoading(false);
        }
    };

    // Handle bot details view (placeholder for future modal)
    const handleViewDetails = (bot: BotMetadata) => {
        setSelectedBot(bot);
        // TODO: Open details modal for bot.displayName
    };

    if (!bots?.length) return null;

    return (
        <div className='load-strategy__container load-strategy__container--marketplace'>
            <MarketplaceGrid
                bots={bots}
                onLoadBot={handleLoadBot}
                onViewDetails={handleViewDetails}
                loading={loading}
            />
        </div>
    );
});

export default RecentComponent;
