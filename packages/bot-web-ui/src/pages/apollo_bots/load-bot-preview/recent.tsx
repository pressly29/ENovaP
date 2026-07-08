import React from 'react';
import { observer, useStore } from '@deriv/stores';
import { DBOT_TABS } from 'Constants/bot-contents';
import { useDBotStore } from 'Stores/useDBotStore';
import { MarketplaceGrid } from '../marketplace';
import { ENHANCED_BOT_LIST, isPremiumBotId } from '../data';
import { BotMetadata } from '../data/types';
import { PremiumCheckoutModal, usePremiumAccess } from '../premium';
import '../marketplace/marketplace-card.scss';
import '../marketplace/marketplace-grid.scss';
import './index.scss';

const RecentComponent = observer(() => {
    const { ui, client } = useStore();
    const { is_mobile } = ui;
    const { email, loginid, is_logged_in } = client;
    const { dashboard, toolbar } = useDBotStore();
    const { loadCustomStrategy } = toolbar;
    const { setActiveTab } = dashboard;

    const [bots] = React.useState(ENHANCED_BOT_LIST);
    const [selectedBot, setSelectedBot] = React.useState<BotMetadata | null>(null);
    const [checkout_bot, setCheckoutBot] = React.useState<BotMetadata | null>(null);
    const [loading, setLoading] = React.useState(false);

    const premium = usePremiumAccess({ email, loginid, is_logged_in });

    // Handle bot loading — premium bots must be unlocked first
    const handleLoadBot = async (botId: number) => {
        if (!premium.isUnlocked(botId)) {
            const bot = bots.find(b => b.id === botId) || null;
            setCheckoutBot(bot);
            return;
        }
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

    const handleUnlockBot = (bot: BotMetadata) => {
        premium.setCheckoutError('');
        setCheckoutBot(bot);
    };

    const closeCheckout = () => {
        setCheckoutBot(null);
        premium.clearPaymentResult();
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
                isBotLocked={botId => !premium.isUnlocked(botId)}
                isBotOwned={botId => isPremiumBotId(botId) && premium.isUnlocked(botId)}
                getPriceLabel={premium.getPriceLabel}
                onUnlockBot={handleUnlockBot}
            />
            <PremiumCheckoutModal
                bot={checkout_bot}
                price_label={checkout_bot ? premium.getPriceLabel(checkout_bot.id) : ''}
                is_open={!!checkout_bot || !!premium.payment_result}
                is_processing={premium.is_starting_checkout}
                error_message={premium.checkout_error}
                payment_result={premium.payment_result}
                onConfirm={premium.startCheckout}
                onClose={closeCheckout}
                onLoadUnlockedBot={handleLoadBot}
            />
        </div>
    );
});

export default RecentComponent;
