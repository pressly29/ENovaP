import React, { useEffect, useState } from 'react';

function getAdminKeyFromUrlOrStorage(): string | null {
    if (typeof window === 'undefined') return null;
    const url = new URL(window.location.href);
    const k = url.searchParams.get('k');
    if (k) {
        try {
            sessionStorage.setItem('enova_admin_key', k);
        } catch (e) {
            /* ignore storage error */
        }
        return k;
    }
    try {
        return sessionStorage.getItem('enova_admin_key');
    } catch (e) {
        return null;
    }
}

interface DailyRow {
    day: string;
    login: number;
    signup: number;
    other: number;
}
interface Summary {
    totals: { login: number; signup: number; other: number };
    daily: DailyRow[];
    meta?: { days: number; filterType: string | null };
    derived?: {
        signup_rate: number;
        unique_ips: number;
        top_types: { type: string; count: number }[];
    };
    recent?: { ts: string; type: string; meta: Record<string, unknown> }[];
}

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [token, setToken] = useState<string | null>(getAdminKeyFromUrlOrStorage());
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState<number>(7);
    const [filterType, setFilterType] = useState<string>('');
    const [loading, setLoading] = useState(false);

    async function fetchSummary(admin_token: string) {
        try {
            setLoading(true);
            setError(null);
            const qs = new URLSearchParams();
            if (days) qs.set('days', String(days));
            if (filterType) qs.set('type', filterType);
            const res = await fetch(`/.netlify/functions/analytics-summary?${qs.toString()}`, {
                headers: { 'x-admin-token': admin_token },
            });
            if (!res.ok) {
                throw new Error(`Request failed: ${res.status}`);
            }
            const json = await res.json();
            setSummary(json);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (token) fetchSummary(token);
    }, [token]);

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input) return;
        setToken(input.trim());
        try {
            sessionStorage.setItem('enova_admin_key', input.trim());
        } catch (e) {
            /* ignore storage error */
        }
    };

    if (!token) {
        return (
            <div style={{ padding: 32 }}>
                <h2>Clients Analysis (Protected)</h2>
                <p>Enter admin access token to view analytics summary.</p>
                <form onSubmit={onSubmit}>
                    <input value={input} onChange={e => setInput(e.target.value)} placeholder='Admin token' />
                    <button type='submit'>Access</button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: 32 }}>
            <h2>Clients Analysis Dashboard</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && <p>Loading...</p>}
            {summary && !loading && (
                <>
                    <div
                        style={{
                            marginTop: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                        }}
                    >
                        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                            Days
                            <input
                                type='number'
                                min={1}
                                max={30}
                                value={days}
                                onChange={e => setDays(Math.min(30, Math.max(1, Number(e.target.value) || 7)))}
                                style={{ width: 80 }}
                            />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12 }}>
                            Filter type
                            <input
                                placeholder='login | signup | ...'
                                value={filterType}
                                onChange={e => setFilterType(e.target.value.trim())}
                                style={{ width: 160 }}
                            />
                        </label>
                        <button
                            onClick={() => token && fetchSummary(token)}
                            disabled={loading}
                            style={{ alignSelf: 'flex-end', height: 32 }}
                        >
                            Refresh
                        </button>
                    </div>
                    <section style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <Kpi title='Logins' value={summary.totals.login} />
                        <Kpi title='Signups' value={summary.totals.signup} />
                        <Kpi title='Other Events' value={summary.totals.other} />
                        {summary.derived && (
                            <Kpi title='Signup Rate' value={summary.derived.signup_rate} format='percent' />
                        )}
                        {summary.derived && <Kpi title='Unique IPs' value={summary.derived.unique_ips} />}
                    </section>
                    {summary.derived?.top_types && summary.derived.top_types.length > 0 && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem' }}>Top Event Types</h3>
                            <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 500 }}>
                                <thead>
                                    <tr>
                                        <th style={th}>Type</th>
                                        <th style={th}>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.derived.top_types.map(t => (
                                        <tr key={t.type}>
                                            <td style={td}>{t.type}</td>
                                            <td style={td}>{t.count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Insights summary={summary} />
                    <h3 style={{ marginTop: '2rem' }}>Last {summary.meta?.days || 7} Days</h3>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={th}>Day</th>
                                <th style={th}>Logins</th>
                                <th style={th}>Signups</th>
                                <th style={th}>Other</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.daily.map(row => (
                                <tr key={row.day}>
                                    <td style={td}>{row.day}</td>
                                    <td style={td}>{row.login}</td>
                                    <td style={td}>{row.signup}</td>
                                    <td style={td}>{row.other}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {summary.recent && summary.recent.length > 0 && (
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ margin: '0 0 0.5rem' }}>Recent Events (latest {summary.recent.length})</h3>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={th}>Timestamp (UTC)</th>
                                        <th style={th}>Type</th>
                                        <th style={th}>Meta</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.recent.map(r => (
                                        <tr key={r.ts + r.type}>
                                            <td style={td}>{r.ts}</td>
                                            <td style={td}>{r.type}</td>
                                            <td style={td}>
                                                <code style={{ fontSize: 11 }}>
                                                    {JSON.stringify(r.meta || {}).slice(0, 120)}
                                                </code>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const th: React.CSSProperties = { border: '1px solid #ddd', padding: '4px', textAlign: 'left' };
const td: React.CSSProperties = { border: '1px solid #eee', padding: '4px' };

const Kpi: React.FC<{ title: string; value: number; format?: 'percent' }> = ({ title, value, format }) => (
    <div
        style={{
            minWidth: 160,
            background: '#fafafa',
            padding: '12px 16px',
            border: '1px solid #eee',
            borderRadius: 4,
        }}
    >
        <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#666' }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 600 }}>
            {format === 'percent' ? `${(value * 100).toFixed(1)}%` : value}
        </div>
    </div>
);

export default Dashboard;

const Insights: React.FC<{ summary: Summary }> = ({ summary }) => {
    const insights: string[] = [];
    const totalLogins = summary.totals.login;
    const totalSignups = summary.totals.signup;
    const rate = summary.derived?.signup_rate ?? 0;
    const uniqueIps = summary.derived?.unique_ips ?? 0;
    const otherEvents = summary.totals.other;

    if (totalLogins >= 50 && rate < 0.1) {
        insights.push(
            'Low signup conversion vs logins. Consider reviewing the signup funnel, copy, and any errors in the flow.'
        );
    }
    if (totalLogins > 0 && totalSignups === 0) {
        insights.push(
            'No signups despite logins. Verify that the signup events are being tracked and there are no backend blockers.'
        );
    }
    if (otherEvents > totalLogins + totalSignups) {
        insights.push(
            'High proportion of "other" events. Consider expanding event taxonomy to better categorize user actions.'
        );
    }
    if (uniqueIps < 10 && totalLogins + totalSignups > 0) {
        insights.push(
            'Low unique reach. Consider increasing traffic sources or campaigns to widen the top of the funnel.'
        );
    }

    if (insights.length === 0) return null;

    return (
        <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>Insights</h3>
            <ul>
                {insights.map((i, idx) => (
                    <li key={idx} style={{ margin: '0.25rem 0' }}>
                        {i}
                    </li>
                ))}
            </ul>
        </div>
    );
};
