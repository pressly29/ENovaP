import React from 'react';
import { FaRegPlusSquare } from 'react-icons/fa';
import { FaTrash } from 'react-icons/fa6';
import { observer, useStore } from '@deriv/stores';
import {
    api_base,
    removeCopyTradingTokens,
    updateCopyTradingTokens,
    newListTokens,
    reCallTheTokens,
    retrieveListItem,
    saveListItemToStorage,
    deleteItemFromStorage,
    config,
    retrieveCopyTradingTokens,
    getToken,
} from '@deriv/bot-skeleton';
import { Dialog } from '@deriv/components';
import { localize, Localize } from '@deriv/translations';
import './style.css';

const CopyTrader = observer(() => {
    const store = useStore();
    const {
        ui: { is_dark_mode_on },
    } = store;
    const [tokens, setTokens] = React.useState<string[]>([]);
    const [tokenInputValue, setTokenInputValue] = React.useState<string>('');
    const [animatingIds, setAnimatingIds] = React.useState<string[]>([]);
    const [tokenType, setTokenType] = React.useState('');
    const [shouldShowError, setShouldShowError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [wasTokens, setWasTokens] = React.useState(false);
    const [enableCP, setEnableCP] = React.useState(false);
    const [syncing, setSyncing] = React.useState(false);

    React.useEffect(() => {
        getSavedTokens();
    }, []);
    React.useEffect(() => {
        getSavedTokens();
    }, [is_dark_mode_on]);

    const getSavedTokens = async () => {
        retrieveListItem().then(list_item => {
            const login_id = getToken().account_id!;
            if (login_id.includes('VRTC')) {
                setTokenType('Demo Tokens');
            } else if (login_id.includes('CR')) {
                setTokenType('Live Tokens');
            }

            if (list_item !== undefined && list_item !== null) {
                const cleanList = Array.isArray(list_item[0]) ? list_item[0] : list_item;
                if (cleanList.length > 0) {
                    setTokens(cleanList as string[]);
                    setWasTokens(true);
                } else {
                    setTokens([]);
                }
            } else {
                setTokens([]);
            }
        });
    };

    const handleTokenInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTokenInputValue(event.target.value);
    };

    const addToken = async () => {
        if (getToken().account_id) {
            try {
                const newToken = tokenInputValue.trim();
                const response = await updateCopyTradingTokens(tokenInputValue.trim());

                if (response === 'VRTC' || response === 'CR') {
                    saveListItemToStorage(newToken);
                    tokens.unshift(newToken);
                    // setTokens(tokens);
                } else {
                    setErrorMessage(response!);
                    setShouldShowError(true);
                }
            } catch (error: any) {
                if (typeof error.error !== 'undefined') {
                    setErrorMessage(error.error.message);
                    setShouldShowError(true);
                } else {
                    // console.log(error);
                }
            } finally {
                // This block will run regardless of the try/catch outcome
                setTokenInputValue('');
            }
        } else {
            setErrorMessage(
                localize("It seems you haven't logged in, please login in and try adding the token again.")
            );
            setShouldShowError(true);
        }
    };

    const deleteToken = (token: string) => {
        deleteItemFromStorage(token);
        removeCopyTradingTokens(token);
        setAnimatingIds((prevIds: any) => [...prevIds, token]);
    };

    const handleTransitionEnd = (check_token: string) => {
        setTokens(tokens.filter(token => token !== check_token)); // Remove the item after animation
        setAnimatingIds((prevIds: any) => prevIds.filter((i: any) => i !== check_token)); // Remove id from animating ids
    };
    const handleShouldShowError = () => {
        setShouldShowError(false);
    };
    const handleCPChange = () => {
        setEnableCP(!enableCP);
        config.copy_trading.is_active = !enableCP;
    };
    const handleSynceData = async () => {
        setSyncing(true);
        const login_id = getToken().account_id!;
        const new_tokens = await reCallTheTokens();
        if (typeof new_tokens !== 'undefined') {
            setTokens(new_tokens);
        } else {
            setTokens([]);
        }

        if (login_id.includes('VRTC')) {
            setTokenType('Demo Tokens');
        } else if (login_id.includes('CR')) {
            setTokenType('Live Tokens');
        }
        setSyncing(false);
    };
    const createTokenClick = () => {
        const url = 'https://app.deriv.com/account/api-token';
        window.open(url, '_blank');
    };
    return (
        <div className='main_copy'>
            {shouldShowError && (
                <Dialog
                    title={localize('Error while adding new token!')}
                    confirm_button_text={localize('OK')}
                    onConfirm={handleShouldShowError}
                    is_visible={shouldShowError}
                >
                    {errorMessage}
                </Dialog>
            )}

            {/* Hero Header */}
            <div className='replicator-hero'>
                <div className='hero-icon'>
                    <svg width='60' height='60' viewBox='0 0 24 24' fill='none'>
                        <path
                            d='M8 16H5.43C3.14 16 2 14.86 2 12.57V5.43C2 3.14 3.14 2 5.43 2H10C12.29 2 13.43 3.14 13.43 5.43'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M18.57 22H14C11.71 22 10.57 20.86 10.57 18.57V11.43C10.57 9.14 11.71 8 14 8H18.57C20.86 8 22 9.14 22 11.43V18.57C22 20.86 20.86 22 18.57 22Z'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M14.87 12L12.87 14L14.87 16'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <path
                            d='M19.13 12L21.13 14L19.13 16'
                            stroke='currentColor'
                            strokeWidth='1.5'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </svg>
                </div>
                <h1 className='hero-title'>{localize('Trade Replicator')}</h1>
                <p className='hero-subtitle'>
                    {localize('Mirror your bot trades across multiple accounts simultaneously')}
                </p>
                <div className='account-type-badge'>
                    <span className='badge-dot' />
                    {tokenType || 'Not Connected'}
                </div>
            </div>

            {/* Main Content Card */}
            <div className='replicator-card'>
                {/* Add Token Section */}
                <div className='add-token-section'>
                    <h3 className='section-title'>
                        <FaRegPlusSquare className='section-icon' />
                        {localize('Add API Token')}
                    </h3>
                    <div className='token-input-group'>
                        <input
                            type='text'
                            value={tokenInputValue}
                            onChange={handleTokenInputChange}
                            placeholder={localize('Paste your Deriv API token here...')}
                            className='token-input'
                        />
                        <button onClick={() => addToken()} className='add-token-btn'>
                            <FaRegPlusSquare />
                            <span>{localize('Add Token')}</span>
                        </button>
                    </div>
                    <p className='input-hint'>
                        {localize('Enter a valid API token from another Deriv account to replicate trades')}
                    </p>
                </div>

                {/* Controls Section */}
                <div className='controls-section'>
                    <div className='control-item'>
                        <label className='toggle-switch'>
                            <input type='checkbox' checked={config.copy_trading.is_active} onChange={handleCPChange} />
                            <span className='toggle-slider' />
                        </label>
                        <div className='control-info'>
                            <span className='control-label'>{localize('Enable Replicator')}</span>
                            <span className='control-description'>
                                {config.copy_trading.is_active
                                    ? localize('Trades will be copied to all accounts')
                                    : localize('Replication is currently disabled')}
                            </span>
                        </div>
                    </div>

                    <div className='action-buttons'>
                        <button onClick={() => handleSynceData()} className='sync-btn' disabled={syncing}>
                            {syncing ? (
                                <>
                                    <div className='spinner' />
                                    <span>{localize('Syncing...')}</span>
                                </>
                            ) : (
                                <>
                                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
                                        <path
                                            d='M22 12C22 17.52 17.52 22 12 22C6.48 22 3.11 16.44 3.11 16.44M3.11 16.44H7.63M3.11 16.44V21.44M2 12C2 6.48 6.44 2 12 2C18.67 2 22 7.56 22 7.56M22 7.56V2.56M22 7.56H17.56'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                    <span>{localize('Sync Tokens')}</span>
                                </>
                            )}
                        </button>

                        <button onClick={() => createTokenClick()} className='create-token-btn-main'>
                            <svg width='16' height='16' viewBox='0 0 24 24' fill='none'>
                                <path
                                    d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
                                    stroke='currentColor'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M8 12H16'
                                    stroke='currentColor'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M12 16V8'
                                    stroke='currentColor'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                            <span>{localize('Create Token')}</span>
                        </button>
                    </div>
                </div>

                {/* Tokens List Section */}
                <div className='tokens-list-section'>
                    <div className='section-header'>
                        <h3 className='section-title'>
                            {localize('Active Tokens')}
                            <span className='token-count'>{tokens.length}</span>
                        </h3>
                        {tokens.length > 0 && (
                            <span className='status-indicator active'>
                                <span className='status-dot' />
                                {localize('Ready to replicate')}
                            </span>
                        )}
                    </div>

                    <div className='tokens-container'>
                        {tokens.length > 0 ? (
                            <ul className='tokens-list'>
                                {tokens.map((token, index) => (
                                    <li
                                        key={token}
                                        className={`token ${animatingIds.includes(token) ? 'fall' : ''}`}
                                        onTransitionEnd={() => handleTransitionEnd(token)}
                                    >
                                        <div className='token-content'>
                                            <div className='token-avatar'>
                                                <span>{index + 1}</span>
                                            </div>
                                            <div className='token-details'>
                                                <span className='token-value'>{token}</span>
                                                <span className='token-label'>{localize('API Token')}</span>
                                            </div>
                                        </div>
                                        <button className='trash-btn' onClick={() => deleteToken(token)}>
                                            <FaTrash />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className='empty-state'>
                                <div className='empty-icon'>
                                    <svg width='80' height='80' viewBox='0 0 24 24' fill='none'>
                                        <path
                                            d='M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            opacity='0.3'
                                        />
                                        <path
                                            d='M9 10C10.1046 10 11 9.10457 11 8C11 6.89543 10.1046 6 9 6C7.89543 6 7 6.89543 7 8C7 9.10457 7.89543 10 9 10Z'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                        <path
                                            d='M2.67004 18.9501L7.60004 15.6401C8.39004 15.1101 9.53004 15.1701 10.24 15.7801L10.57 16.0701C11.35 16.7401 12.61 16.7401 13.39 16.0701L17.55 12.5001C18.33 11.8301 19.59 11.8301 20.37 12.5001L22 13.9001'
                                            stroke='currentColor'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                        />
                                    </svg>
                                </div>
                                <h4>{localize('No tokens added yet')}</h4>
                                <p>
                                    {localize(
                                        'Add your first API token to start replicating trades across multiple accounts'
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Banner */}
                {tokens.length > 0 && (
                    <div className='info-banner'>
                        <div className='info-icon'>ℹ️</div>
                        <div className='info-content'>
                            <strong>{localize('How it works:')}</strong>
                            <p>
                                {localize(
                                    'When replicator is enabled, every trade your bot makes will be automatically executed on all added accounts simultaneously.'
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

export default CopyTrader;
