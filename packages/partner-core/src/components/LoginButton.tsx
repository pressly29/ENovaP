/**
 * Login Button Component
 * Initiates OAuth flow with Deriv
 */

import React from 'react';
import { OAuthHandler } from '../services/auth/OAuthHandler';

interface LoginButtonProps {
  className?: string;
  text?: string;
  showSignup?: boolean;
}

const LoginButton: React.FC<LoginButtonProps> = ({ 
  className = '', 
  text = 'Login with Deriv',
  showSignup = true 
}) => {
  const handleLogin = () => {
    const oauthUrl = OAuthHandler.getOAuthURL();
    console.log('[OAuth] Redirecting to:', oauthUrl);
    window.location.href = oauthUrl;
  };

  const handleSignup = () => {
    const signupUrl = OAuthHandler.getSignupURL();
    console.log('[Signup] Redirecting to:', signupUrl);
    window.open(signupUrl, '_blank');
  };

  return (
    <div className={`login-button-container ${className}`}>
      <button className="login-button primary" onClick={handleLogin}>
        <span className="icon">🔐</span>
        {text}
      </button>

      {showSignup && (
        <button className="login-button secondary" onClick={handleSignup}>
          <span className="icon">✨</span>
          Create Deriv Account
        </button>
      )}

      <style jsx>{`
        .login-button-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 28px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .login-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .login-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .login-button.secondary {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }

        .login-button.secondary:hover {
          background: #f8f9ff;
          transform: translateY(-2px);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .icon {
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default LoginButton;
