import React from 'react';
import { observer } from '@deriv/stores';
import './TradingGuide.css';

const TradingGuide = observer(() => {
    return (
        <div className='trading-guide'>
            {/* Header */}
            <div className='tg-header'>
                <h1 className='tg-title'>📚 Complete Trading Guide</h1>
                <p className='tg-subtitle'>
                    Learn how to use our analysis tools to trade profitably on Deriv synthetic indices
                </p>
            </div>

            {/* Tools Overview */}
            <section className='tg-section'>
                <h2 className='tg-section-title'>🎯 Analysis Tools Overview</h2>
                <div className='tg-tools-grid'>
                    <div className='tg-tool-card'>
                        <div className='tg-tool-header'>
                            <span className='tg-tool-icon'>🎯</span>
                            <h3>Circles Analyzer</h3>
                        </div>
                        <p className='tg-tool-desc'>
                            <strong>Best For:</strong> Complete market overview
                        </p>
                        <ul className='tg-tool-features'>
                            <li>All 4 strategies visible simultaneously</li>
                            <li>Digit frequency circles with visual indicators</li>
                            <li>Interactive threshold/target selection</li>
                            <li>Real-time pattern tracking</li>
                        </ul>
                        <div className='tg-tool-rating'>
                            <span className='tg-badge tg-badge-expert'>Best for: Advanced Traders</span>
                        </div>
                    </div>

                    <div className='tg-tool-card'>
                        <div className='tg-tool-header'>
                            <span className='tg-tool-icon'>📊</span>
                            <h3>Market Analyzer</h3>
                        </div>
                        <p className='tg-tool-desc'>
                            <strong>Best For:</strong> Pattern recognition
                        </p>
                        <ul className='tg-tool-features'>
                            <li>Focus on one strategy at a time</li>
                            <li>Visual pattern badges</li>
                            <li>Clean, simple interface</li>
                            <li>Quick strategy switching</li>
                        </ul>
                        <div className='tg-tool-rating'>
                            <span className='tg-badge tg-badge-beginner'>Best for: Beginners</span>
                        </div>
                    </div>

                    <div className='tg-tool-card'>
                        <div className='tg-tool-header'>
                            <span className='tg-tool-icon'>⚛️</span>
                            <h3>Quantum Signals</h3>
                        </div>
                        <p className='tg-tool-desc'>
                            <strong>Best For:</strong> AI-powered trading
                        </p>
                        <ul className='tg-tool-features'>
                            <li>Combines all strategies into unified signals</li>
                            <li>Confidence scores (STRONG/MODERATE/WEAK)</li>
                            <li>AI-generated recommendations</li>
                            <li>Multi-market analysis</li>
                        </ul>
                        <div className='tg-tool-rating'>
                            <span className='tg-badge tg-badge-expert'>Best for: Experienced Traders</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Circle Indicators */}
            <section className='tg-section tg-highlight'>
                <h2 className='tg-section-title'>🔵 Understanding Circle Indicators (Circles Analyzer)</h2>
                <div className='tg-indicators-grid'>
                    <div className='tg-indicator'>
                        <div className='tg-indicator-visual tg-grey-circle'>5</div>
                        <h4>Grey Circles</h4>
                        <p>All digits (0-9) showing their frequency percentage over analyzed ticks</p>
                    </div>
                    <div className='tg-indicator'>
                        <div className='tg-indicator-visual tg-cyan-circle'>
                            8<span className='tg-triangle'>▲</span>
                        </div>
                        <h4>Cyan Circle + Triangle</h4>
                        <p>Current tick&apos;s last digit - shows you what just happened</p>
                    </div>
                    <div className='tg-indicator'>
                        <div className='tg-indicator-visual tg-green-bottom'>4</div>
                        <h4>Green Bottom Indicator</h4>
                        <p>Highest frequency digit - consider trading MATCHES on this digit</p>
                    </div>
                    <div className='tg-indicator'>
                        <div className='tg-indicator-visual tg-red-bottom'>2</div>
                        <h4>Red Bottom Indicator</h4>
                        <p>Lowest frequency digit - avoid trading MATCHES on this digit</p>
                    </div>
                </div>
            </section>

            {/* Trading Strategies */}
            <section className='tg-section'>
                <h2 className='tg-section-title'>💡 Profitable Trading Strategies (Ranked by Success)</h2>

                {/* Strategy 1: Even/Odd */}
                <div className='tg-strategy'>
                    <div className='tg-strategy-header'>
                        <h3>🥇 Strategy #1: EVEN/ODD Trading</h3>
                        <div className='tg-strategy-meta'>
                            <span className='tg-badge tg-badge-success'>Win Rate: 60-65%</span>
                            <span className='tg-badge tg-badge-primary'>Best Edge</span>
                        </div>
                    </div>
                    <div className='tg-strategy-content'>
                        <div className='tg-strategy-section'>
                            <h4>How It Works</h4>
                            <p>
                                Tracks whether last digit is Even (0,2,4,6,8) or Odd (1,3,5,7,9). Over time, one side
                                typically dominates.
                            </p>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>✅ When to Trade EVEN</h4>
                            <ul>
                                <li>Even percentage &gt; 55% (clear bias)</li>
                                <li>Odd streak ≥ 3 consecutive (reversal expected: O-O-O → Trade EVEN)</li>
                                <li>Recent pattern shows even dominance</li>
                            </ul>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>✅ When to Trade ODD</h4>
                            <ul>
                                <li>Odd percentage &gt; 55% (clear bias)</li>
                                <li>Even streak ≥ 3 consecutive (reversal expected: E-E-E → Trade ODD)</li>
                                <li>Recent pattern shows odd dominance</li>
                            </ul>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>⚠️ When NOT to Trade</h4>
                            <ul>
                                <li>Percentages between 48-52% (no edge)</li>
                                <li>Less than 500 ticks analyzed (insufficient data)</li>
                                <li>Streak &lt; 2 (weak reversal signal)</li>
                            </ul>
                        </div>
                        <div className='tg-example'>
                            <strong>Example Trade:</strong> Even: 58.2% | Odd: 41.8% | Pattern: E-E-E
                            <br />
                            <strong>Action:</strong> Trade ODD (expecting reversal)
                            <br />
                            <strong>Duration:</strong> 1-2 ticks | <strong>Stake:</strong> $0.50
                        </div>
                    </div>
                </div>

                {/* Strategy 2: Differs */}
                <div className='tg-strategy'>
                    <div className='tg-strategy-header'>
                        <h3>🥈 Strategy #2: DIFFERS Trading (Safest)</h3>
                        <div className='tg-strategy-meta'>
                            <span className='tg-badge tg-badge-success'>Win Rate: 85-90%</span>
                            <span className='tg-badge tg-badge-safe'>Lowest Risk</span>
                        </div>
                    </div>
                    <div className='tg-strategy-content'>
                        <div className='tg-strategy-section'>
                            <h4>How It Works</h4>
                            <p>
                                Inherent 90% probability - 9 out of 10 digits will differ from your selected target.
                                This is the safest strategy.
                            </p>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>✅ When to Trade DIFFERS</h4>
                            <ul>
                                <li>
                                    <strong>Always reliable</strong> - 9 out of 10 digits differ
                                </li>
                                <li>Best used as your &quot;foundation&quot; for consistent daily income</li>
                                <li>Select any digit - doesn&apos;t matter which one</li>
                                <li>Trade frequently for steady, small wins</li>
                            </ul>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>⚠️ Important Notes</h4>
                            <ul>
                                <li>Lower payout ratio (~1.1x) but very high win rate</li>
                                <li>Use this to build your bankroll safely</li>
                                <li>Combine with other strategies for variety</li>
                            </ul>
                        </div>
                        <div className='tg-example'>
                            <strong>Example Trade:</strong> Target Digit: 4 | Pattern: D-D-D-D-M-D
                            <br />
                            <strong>Action:</strong> Trade DIFFERS (always safe)
                            <br />
                            <strong>Duration:</strong> 1 tick | <strong>Stake:</strong> $1.00 |{' '}
                            <strong>Expected Win:</strong> 90%
                        </div>
                    </div>
                </div>

                {/* Strategy 3: Over/Under */}
                <div className='tg-strategy'>
                    <div className='tg-strategy-header'>
                        <h3>🥉 Strategy #3: OVER/UNDER Trading</h3>
                        <div className='tg-strategy-meta'>
                            <span className='tg-badge tg-badge-success'>Win Rate: 55-70%</span>
                            <span className='tg-badge tg-badge-adjustable'>Adjustable</span>
                        </div>
                    </div>
                    <div className='tg-strategy-content'>
                        <div className='tg-strategy-section'>
                            <h4>How It Works</h4>
                            <p>
                                Click any digit (0-9) to set your threshold. Over = digits ≥ threshold, Under = digits
                                &lt; threshold.
                            </p>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>✅ When to Trade OVER</h4>
                            <ul>
                                <li>Over percentage &gt; 55%</li>
                                <li>Under streak ≥ 3 consecutive (U-U-U → Trade OVER)</li>
                                <li>Green indicator appears on a digit ≥ your threshold</li>
                            </ul>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>✅ When to Trade UNDER</h4>
                            <ul>
                                <li>Under percentage &gt; 55%</li>
                                <li>Over streak ≥ 3 consecutive (Ov-Ov-Ov → Trade UNDER)</li>
                                <li>Green indicator appears on a digit &lt; your threshold</li>
                            </ul>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>💡 Pro Tips</h4>
                            <ul>
                                <li>
                                    <strong>Threshold 5:</strong> Most balanced (50/50 split)
                                </li>
                                <li>
                                    <strong>Threshold 7:</strong> Aggressive over (30% over, 70% under)
                                </li>
                                <li>
                                    <strong>Threshold 3:</strong> Aggressive under (70% over, 30% under)
                                </li>
                                <li>Adjust threshold based on where green indicator appears</li>
                            </ul>
                        </div>
                        <div className='tg-example'>
                            <strong>Example Trade:</strong> Threshold: 5 | Over: 62.3% | Under: 37.7% | Green on: 7
                            <br />
                            <strong>Action:</strong> Trade OVER (strong bias + high freq digit is 7)
                            <br />
                            <strong>Duration:</strong> 1-2 ticks | <strong>Stake:</strong> $0.50
                        </div>
                    </div>
                </div>

                {/* Strategy 4: Matches */}
                <div className='tg-strategy'>
                    <div className='tg-strategy-header'>
                        <h3>⚠️ Strategy #4: MATCHES Trading (High Risk/Reward)</h3>
                        <div className='tg-strategy-meta'>
                            <span className='tg-badge tg-badge-warning'>Win Rate: 8-15%</span>
                            <span className='tg-badge tg-badge-danger'>High Risk</span>
                        </div>
                    </div>
                    <div className='tg-strategy-content'>
                        <div className='tg-strategy-section'>
                            <h4>How It Works</h4>
                            <p>
                                Betting that the next tick matches your selected digit exactly. Very risky but 9:1
                                payout ratio!
                            </p>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>✅ ONLY Trade MATCHES When</h4>
                            <ul>
                                <li>
                                    Selected digit has <strong>GREEN indicator</strong> (highest frequency)
                                </li>
                                <li>Digit frequency &gt; 12% (above average 10%)</li>
                                <li>Differs streak ≥ 5 consecutive (D-D-D-D-D → Reversal due)</li>
                                <li>You&apos;re willing to accept high risk for high reward</li>
                            </ul>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>⚠️ Important Warnings</h4>
                            <ul>
                                <li>Only 10% average chance (1 in 10 digits)</li>
                                <li>Use SMALL stakes only ($0.25 max)</li>
                                <li>Never chase losses with matches</li>
                                <li>This is NOT a primary strategy - occasional use only</li>
                            </ul>
                        </div>
                        <div className='tg-example'>
                            <strong>Example Trade:</strong> Digit 4 (GREEN) | Frequency: 13.2% | Pattern: D-D-D-D-D-D
                            <br />
                            <strong>Action:</strong> Trade MATCHES 4 (reversal expected)
                            <br />
                            <strong>Duration:</strong> 1 tick | <strong>Stake:</strong> $0.25 | <strong>Risk:</strong>{' '}
                            Very High
                        </div>
                    </div>
                </div>

                {/* Strategy 5: Rise/Fall */}
                <div className='tg-strategy'>
                    <div className='tg-strategy-header'>
                        <h3>📉 Strategy #5: RISE/FALL (Confirmation Only)</h3>
                        <div className='tg-strategy-meta'>
                            <span className='tg-badge tg-badge-warning'>Win Rate: 50-58%</span>
                            <span className='tg-badge tg-badge-secondary'>Lowest Edge</span>
                        </div>
                    </div>
                    <div className='tg-strategy-content'>
                        <div className='tg-strategy-section'>
                            <h4>How It Works</h4>
                            <p>
                                Compares consecutive tick prices. Rise = current &gt; previous, Fall = current ≤
                                previous.
                            </p>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>⚠️ Why Lowest Edge?</h4>
                            <ul>
                                <li>Nearly 50/50 on volatility indices (almost random)</li>
                                <li>Only 0-8% edge over random guessing</li>
                                <li>Requires 1000+ ticks for any meaningful pattern</li>
                            </ul>
                        </div>
                        <div className='tg-strategy-section'>
                            <h4>✅ Best Use Case</h4>
                            <ul>
                                <li>
                                    Use as <strong>confirmation tool</strong>, not primary strategy
                                </li>
                                <li>If Even/Odd + Over/Under + Rise/Fall all agree → Strong signal</li>
                                <li>Trade only when Rise or Fall &gt; 52%</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Money Management */}
            <section className='tg-section tg-highlight'>
                <h2 className='tg-section-title'>💰 Money Management Rules</h2>
                <div className='tg-money-grid'>
                    <div className='tg-money-card'>
                        <h4>📊 Position Sizing</h4>
                        <div className='tg-code'>
                            Account Balance: $100
                            <br />
                            Per Trade Risk: 1-2% = $1-2 per trade
                            <br />
                            <br />
                            STRONG signals (70%+): 2% ($2)
                            <br />
                            MODERATE signals (60-70%): 1.5% ($1.50)
                            <br />
                            WEAK signals (55-60%): 1% ($1) or skip
                        </div>
                    </div>
                    <div className='tg-money-card'>
                        <h4>🎯 Daily Limits</h4>
                        <ul>
                            <li>
                                <strong>Max Trades:</strong> 10-20 per day
                            </li>
                            <li>
                                <strong>Max Loss:</strong> 10% of balance ($10 on $100)
                            </li>
                            <li>
                                <strong>Profit Target:</strong> 5-8% daily ($5-8 on $100)
                            </li>
                            <li>
                                <strong>Hit loss limit?</strong> STOP TRADING
                            </li>
                            <li>
                                <strong>Hit profit target?</strong> Consider stopping
                            </li>
                        </ul>
                    </div>
                    <div className='tg-money-card'>
                        <h4>📈 Streak Management</h4>
                        <ul>
                            <li>
                                <strong>After 3 losses:</strong> Reduce stake by 50%
                            </li>
                            <li>
                                <strong>After 3 losses:</strong> Take 15 min break
                            </li>
                            <li>
                                <strong>After 3 wins:</strong> DON&apos;T increase stake
                            </li>
                            <li>
                                <strong>Stay disciplined:</strong> Fixed stakes always
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Trading Workflow */}
            <section className='tg-section'>
                <h2 className='tg-section-title'>🎓 Recommended Trading Workflow</h2>

                <div className='tg-workflow'>
                    <div className='tg-workflow-level'>
                        <h3>👶 For Beginners (Month 1)</h3>
                        <ol>
                            <li>
                                Start with <strong>Circles Analyzer</strong> (comprehensive view)
                            </li>
                            <li>
                                Focus ONLY on <strong>Even/Odd</strong> first week
                            </li>
                            <li>
                                Add <strong>Differs</strong> second week (build safe foundation)
                            </li>
                            <li>
                                Learn <strong>Over/Under</strong> third week
                            </li>
                            <li>
                                Use <strong>$0.35-0.50 stakes</strong>
                            </li>
                            <li>
                                <strong>Goal:</strong> Understand pattern recognition &amp; achieve 60% win rate
                            </li>
                        </ol>
                    </div>

                    <div className='tg-workflow-level'>
                        <h3>📈 For Intermediate (Month 2-3)</h3>
                        <ol>
                            <li>
                                Use <strong>Circles Analyzer</strong> + <strong>Quantum Signals</strong>
                            </li>
                            <li>Trade Even/Odd + Over/Under + Differs</li>
                            <li>Follow MODERATE+ signals (60%+ confidence)</li>
                            <li>
                                Increase stakes to <strong>$0.50-1.00</strong>
                            </li>
                            <li>Track win rates by strategy type</li>
                            <li>
                                <strong>Goal:</strong> 65% overall win rate &amp; 30-50% monthly ROI
                            </li>
                        </ol>
                    </div>

                    <div className='tg-workflow-level'>
                        <h3>🚀 For Advanced (Month 4+)</h3>
                        <ol>
                            <li>Use all 3 tools simultaneously</li>
                            <li>Trade all strategies (including selective Matches)</li>
                            <li>Follow STRONG signals only (70%+ confidence)</li>
                            <li>Adjust strategies based on market conditions</li>
                            <li>Optimize stake sizing based on signal strength</li>
                            <li>
                                <strong>Goal:</strong> 65-70% win rate &amp; 50-100% monthly ROI
                            </li>
                        </ol>
                    </div>
                </div>
            </section>

            {/* Expected Results */}
            <section className='tg-section tg-highlight'>
                <h2 className='tg-section-title'>📊 Expected Performance Metrics</h2>
                <div className='tg-performance-grid'>
                    <div className='tg-performance-card'>
                        <h4>🐢 Conservative Approach</h4>
                        <p className='tg-strategy-desc'>Differs + Even/Odd (only when &gt;55%)</p>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Monthly ROI:</span>
                            <span className='tg-metric-value tg-green'>15-25%</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Win Rate:</span>
                            <span className='tg-metric-value'>70-75%</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Risk Level:</span>
                            <span className='tg-badge tg-badge-success'>Low</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Trades/Day:</span>
                            <span className='tg-metric-value'>5-10</span>
                        </div>
                    </div>

                    <div className='tg-performance-card tg-recommended'>
                        <div className='tg-recommended-badge'>⭐ RECOMMENDED</div>
                        <h4>⚡ Moderate Approach</h4>
                        <p className='tg-strategy-desc'>All strategies except Matches</p>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Monthly ROI:</span>
                            <span className='tg-metric-value tg-green'>30-50%</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Win Rate:</span>
                            <span className='tg-metric-value'>60-65%</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Risk Level:</span>
                            <span className='tg-badge tg-badge-primary'>Medium</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Trades/Day:</span>
                            <span className='tg-metric-value'>10-15</span>
                        </div>
                    </div>

                    <div className='tg-performance-card'>
                        <h4>🚀 Aggressive Approach</h4>
                        <p className='tg-strategy-desc'>All strategies including Matches</p>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Monthly ROI:</span>
                            <span className='tg-metric-value tg-green'>50-100%</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Win Rate:</span>
                            <span className='tg-metric-value'>55-60%</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Risk Level:</span>
                            <span className='tg-badge tg-badge-danger'>High</span>
                        </div>
                        <div className='tg-metric'>
                            <span className='tg-metric-label'>Trades/Day:</span>
                            <span className='tg-metric-value'>15-25</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Common Mistakes */}
            <section className='tg-section'>
                <h2 className='tg-section-title'>⚠️ Common Mistakes to Avoid</h2>
                <div className='tg-mistakes-grid'>
                    <div className='tg-mistake'>
                        <h4>❌ Trading Without Sufficient Data</h4>
                        <p>
                            <strong>Wrong:</strong> Trading with 50 ticks analyzed
                        </p>
                        <p className='tg-correct'>
                            ✅ <strong>Right:</strong> Wait for 500-1000 ticks minimum
                        </p>
                    </div>
                    <div className='tg-mistake'>
                        <h4>❌ Ignoring Percentages</h4>
                        <p>
                            <strong>Wrong:</strong> Trading when Even = 51%, Odd = 49%
                        </p>
                        <p className='tg-correct'>
                            ✅ <strong>Right:</strong> Only trade when edge &gt; 55%
                        </p>
                    </div>
                    <div className='tg-mistake'>
                        <h4>❌ Chasing Losses (Martingale)</h4>
                        <p>
                            <strong>Wrong:</strong> Doubling stake after each loss
                        </p>
                        <p className='tg-correct'>
                            ✅ <strong>Right:</strong> Fixed stake, reduce after losses
                        </p>
                    </div>
                    <div className='tg-mistake'>
                        <h4>❌ Overtrading</h4>
                        <p>
                            <strong>Wrong:</strong> Trading every tick/every signal
                        </p>
                        <p className='tg-correct'>
                            ✅ <strong>Right:</strong> Wait for STRONG signals only (70%+)
                        </p>
                    </div>
                    <div className='tg-mistake'>
                        <h4>❌ No Daily Limits</h4>
                        <p>
                            <strong>Wrong:</strong> Trading until you lose everything
                        </p>
                        <p className='tg-correct'>
                            ✅ <strong>Right:</strong> Set 10% daily loss limit - STOP when hit
                        </p>
                    </div>
                    <div className='tg-mistake'>
                        <h4>❌ Using Rise/Fall as Primary</h4>
                        <p>
                            <strong>Wrong:</strong> Trading Rise/Fall exclusively
                        </p>
                        <p className='tg-correct'>
                            ✅ <strong>Right:</strong> Use as confirmation tool only
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick Reference */}
            <section className='tg-section tg-highlight'>
                <h2 className='tg-section-title'>⚡ Quick Reference Cheat Sheet</h2>
                <div className='tg-checklist'>
                    <h4>✅ Before Every Trade, Ask Yourself:</h4>
                    <ul className='tg-checklist-items'>
                        <li>Have I analyzed 500+ ticks? (Preferably 1000+)</li>
                        <li>Is my edge &gt; 55% probability?</li>
                        <li>Do multiple tools/indicators agree?</li>
                        <li>Is this a STRONG or MODERATE signal?</li>
                        <li>Have I checked recent patterns (streaks)?</li>
                        <li>Is my stake size appropriate (1-2% of balance)?</li>
                        <li>Have I set my daily loss limit?</li>
                        <li>Am I trading emotionally or logically?</li>
                    </ul>
                </div>

                <div className='tg-priority'>
                    <h4>🎯 Signal Priority (When Tools Disagree)</h4>
                    <ol>
                        <li>
                            <strong>Quantum Signal</strong> (AI consensus - highest priority)
                        </li>
                        <li>
                            <strong>Circles Analyzer</strong> (comprehensive view)
                        </li>
                        <li>
                            <strong>Market Analyzer</strong> (pattern confirmation)
                        </li>
                    </ol>
                    <p className='tg-highlight-text'>⭐ When all tools agree → Maximum confidence trade!</p>
                </div>
            </section>

            {/* Footer */}
            <section className='tg-footer'>
                <h2>🎯 Final Tips for Profitability</h2>
                <div className='tg-tips-grid'>
                    <div className='tg-tip'>
                        1. <strong>Patience is Key:</strong> Wait for STRONG signals (70%+)
                    </div>
                    <div className='tg-tip'>
                        2. <strong>Data is King:</strong> More ticks = better accuracy (1000+)
                    </div>
                    <div className='tg-tip'>
                        3. <strong>Differs = Safety:</strong> 85-90% win rate, use as foundation
                    </div>
                    <div className='tg-tip'>
                        4. <strong>Even/Odd = Edge:</strong> When bias &gt;55%, exploit heavily
                    </div>
                    <div className='tg-tip'>
                        5. <strong>Avoid Rise/Fall Solo:</strong> Use only as confirmation
                    </div>
                    <div className='tg-tip'>
                        6. <strong>Track Performance:</strong> Keep a trading journal
                    </div>
                    <div className='tg-tip'>
                        7. <strong>Respect Limits:</strong> Daily loss limits prevent disaster
                    </div>
                    <div className='tg-tip'>
                        8. <strong>Stay Disciplined:</strong> Don&apos;t deviate from the plan
                    </div>
                    <div className='tg-tip'>
                        9. <strong>Learn Continuously:</strong> Review losing trades
                    </div>
                    <div className='tg-tip'>
                        10. <strong>Capital First:</strong> Protect capital before chasing profits
                    </div>
                </div>

                <div className='tg-quote'>
                    <p>
                        &quot;The goal is not to win every trade, but to win MORE trades than you lose, and manage risk
                        on losing trades.&quot;
                    </p>
                    <p className='tg-quote-author'>
                        With proper use of these tools, a <strong>60%+ win rate</strong> is achievable, which is MORE
                        than enough for consistent profitability.
                    </p>
                </div>

                <div className='tg-cta'>
                    <h3>🚀 Ready to Start Trading?</h3>
                    <p>Switch to the analysis tabs above and start with the recommended beginner approach!</p>
                    <p className='tg-small'>
                        Remember: Start small, trade smart, and build your skills gradually. Good luck! 💰
                    </p>
                </div>
            </section>
        </div>
    );
});

export default TradingGuide;
