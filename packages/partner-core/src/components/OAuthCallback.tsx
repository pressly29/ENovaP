/**
 * OAuth Callback Component
 * Handles the OAuth redirect from Deriv
 * URL: http://localhost:3001/oauth/callback
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OAuthHandler, OAuthTokens } from '../services/auth/OAuthHandler';

interface OAuthCallbackProps {
  onSuccess?: (accounts: OAuthTokens[]) => void;
  onError?: (error: string) => void;
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ onSuccess, onError }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Authenticating...');

  useEffect(() => {
    processOAuthCallback();
  }, [location]);

  const processOAuthCallback = async () => {
    try {
      const fullUrl = window.location.href;
      
      // Parse tokens from URL
      const accounts = OAuthHandler.parseCallbackParams(fullUrl);

      if (accounts.length === 0) {
        throw new Error('No accounts received from OAuth callback');
      }

      // Filter tradeable accounts (exclude wallets)
      const tradeableAccounts = OAuthHandler.filterTradeableAccounts(accounts);

      if (tradeableAccounts.length === 0) {
        throw new Error('No tradeable accounts found. Please create a CR (real trading) account.');
      }

      // Save tokens
      OAuthHandler.saveTokens(accounts);

      // Track affiliate conversion
      OAuthHandler.trackConversion(tradeableAccounts[0].accountId);

      setStatus('success');
      setMessage(`Successfully authenticated! Found ${tradeableAccounts.length} trading account(s).`);

      // Call success callback
      if (onSuccess) {
        onSuccess(tradeableAccounts);
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Authentication failed');

      // Call error callback
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  return (
    <div className="oauth-callback-container">
      <div className="oauth-callback-card">
        {status === 'processing' && (
          <>
            <div className="spinner"></div>
            <h2>Authenticating...</h2>
            <p>Please wait while we complete your login.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Success!</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✕</div>
            <h2>Authentication Failed</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to login...</p>
          </>
        )}
      </div>

      <style jsx>{`
        .oauth-callback-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .oauth-callback-card {
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-icon {
          width: 60px;
          height: 60px;
          background: #4caf50;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 20px;
        }

        .error-icon {
          width: 60px;
          height: 60px;
          background: #f44336;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 20px;
        }

        h2 {
          color: #333;
          margin-bottom: 10px;
        }

        p {
          color: #666;
          margin-bottom: 10px;
        }

        .redirect-message {
          font-size: 14px;
          color: #999;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default OAuthCallback;
