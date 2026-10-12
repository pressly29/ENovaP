/**
 * Stand-in for `@deriv-com/analytics` (aliased in webpack.config.js).
 *
 * The bot UI was written against Deriv's RudderStack analytics package, which
 * the new Deriv API template no longer ships. These calls are UI telemetry for
 * Deriv's own dashboards, so they are accepted and dropped here. EvPNova's own
 * analytics (logins, sign-ups, purchases) go through the track-event function.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TEvents = Record<string, any>;

export const Analytics = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    trackEvent: (_event: string, _payload?: any) => undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    setAttributes: (_attributes?: any) => undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    pageView: (_page?: string, _payload?: any) => undefined,
};

export default Analytics;
