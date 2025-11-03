/**
 * Email Verification Component
 * Handles email verification from Deriv
 * URL: http://localhost:3001/verify-email
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface EmailVerificationProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onSuccess, onError }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    processEmailVerification();
  }, [location]);

  const processEmailVerification = async () => {
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const type = params.get('type'); // 'account_opening', 'reset_password', etc.

      if (!token) {
        throw new Error('Verification token not found');
      }

      // Log verification attempt
      console.log('[Email Verification] Type:', type, 'Token:', token.substring(0, 10) + '...');

      // In a real implementation, you would verify the token with Deriv API
      // For now, we'll simulate a successful verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus('success');
      
      if (type === 'reset_password') {
        setMessage('Email verified! You can now reset your password.');
      } else if (type === 'account_opening') {
        setMessage('Email verified! Your account has been activated.');
      } else {
        setMessage('Email verified successfully!');
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Redirect based on verification type
      setTimeout(() => {
        if (type === 'reset_password') {
          navigate('/reset-password', { state: { token } });
        } else {
          navigate('/login');
        }
      }, 2000);

    } catch (error) {
      console.error('Email verification error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Verification failed');

      // Call error callback
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unknown error');
      }

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  };

  return (
    <div className="email-verification-container">
      <div className="email-verification-card">
        {status === 'processing' && (
          <>
            <div className="spinner"></div>
            <h2>Verifying Email</h2>
            <p>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="success-icon">✓</div>
            <h2>Email Verified!</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">✕</div>
            <h2>Verification Failed</h2>
            <p>{message}</p>
            <p className="redirect-message">Redirecting to home...</p>
          </>
        )}
      </div>

      <style jsx>{`
        .email-verification-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .email-verification-card {
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

export default EmailVerification;
