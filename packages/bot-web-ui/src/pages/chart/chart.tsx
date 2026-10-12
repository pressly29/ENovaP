import React from 'react';
import classNames from 'classnames';
import { observer, useStore } from '@deriv/stores';
import { useDBotStore } from 'Stores/useDBotStore';
import { useSmartChartsAdapter } from './adapter';
import ToolbarWidgets from './toolbar-widgets';
import { ChartTitle, SmartChart } from './v1';

const Chart = observer(({ show_digits_stats }: { show_digits_stats: boolean }) => {
    const barriers: [] = [];
    const { common, ui } = useStore();
    const { chart_store, run_panel, dashboard } = useDBotStore();

    const {
        chart_type,
        getMarketsOrder,
        granularity,
        onSymbolChange,
        setChartStatus,
        symbol,
        updateChartType,
        updateGranularity,
    } = chart_store;
    const {
        ui: { is_mobile, is_desktop },
    } = useStore();
    const { is_drawer_open } = run_panel;
    const { is_chart_modal_visible } = dashboard;
    const is_socket_opened = common.is_socket_opened;
    // SmartCharts Champion pulls quotes through this adapter (core WebSocket),
    // replacing the old requestAPI/requestSubscribe props.
    const { chartData, getQuotes, subscribeQuotes, unsubscribeQuotes } = useSmartChartsAdapter({
        current_language: common.current_language,
    });
    const settings = {
        assetInformation: false, // ui.is_chart_asset_info_visible,
        countdown: true,
        isHighestLowestMarkerEnabled: false, // TODO: Pending UI,
        language: common.current_language.toLowerCase(),
        position: ui.is_chart_layout_default ? 'bottom' : 'left',
        theme: ui.is_dark_mode_on ? 'dark' : 'light',
    };

    return (
        chartData?.activeSymbols?.length ? (
        <div
            className={classNames('dashboard__chart-wrapper', {
                'dashboard__chart-wrapper--expanded': is_drawer_open && !is_mobile,
                'dashboard__chart-wrapper--modal': is_chart_modal_visible && !is_mobile,
            })}
        >
            <SmartChart
                id='dbot'
                barriers={barriers}
                showLastDigitStats={show_digits_stats}
                chartControlsWidgets={null}
                enabledChartFooter={false}
                chartStatusListener={(v: boolean) => setChartStatus(!v)}
                toolbarWidget={() => (
                    <ToolbarWidgets
                        updateChartType={updateChartType}
                        updateGranularity={updateGranularity}
                        position={is_mobile ? 'bottom' : null}
                    />
                )}
                chartType={chart_type}
                isMobile={is_mobile}
                enabledNavigationWidget={is_desktop}
                granularity={granularity}
                chartData={chartData}
                getQuotes={getQuotes}
                subscribeQuotes={subscribeQuotes}
                unsubscribeQuotes={unsubscribeQuotes}
                settings={settings}
                symbol={symbol}
                topWidgets={() => <ChartTitle />}
                isConnectionOpened={is_socket_opened}
                getMarketsOrder={getMarketsOrder}
                isLive
                leftMargin={80}
            />
        </div>
        ) : null
    );
});

export default Chart;