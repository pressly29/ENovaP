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
}

const Dashboard: React.FC = () => {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [token, setToken] = useState<string | null>(getAdminKeyFromUrlOrStorage());
    const [input, setInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function fetchSummary(admin_token: string) {
        try {
            setError(null);
            const res = await fetch('/.netlify/functions/analytics-summary', {
                headers: { 'x-admin-token': admin_token },
            });
            if (!res.ok) {
                throw new Error(`Request failed: ${res.status}`);
            }
            const json = await res.json();
            setSummary(json);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Unknown error');
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
            {!summary && !error && <p>Loading...</p>}
            {summary && (
                <>
                    <section style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <Kpi title='Logins' value={summary.totals.login} />
                        <Kpi title='Signups' value={summary.totals.signup} />
                        <Kpi title='Other Events' value={summary.totals.other} />
                    </section>
                    <h3 style={{ marginTop: '2rem' }}>Last 7 Days</h3>
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
                </>
            )}
        </div>
    );
};

const th: React.CSSProperties = { border: '1px solid #ddd', padding: '4px', textAlign: 'left' };
const td: React.CSSProperties = { border: '1px solid #eee', padding: '4px' };

const Kpi: React.FC<{ title: string; value: number }> = ({ title, value }) => (
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
        <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    </div>
);

export default Dashboard;
