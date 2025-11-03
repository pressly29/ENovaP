/**
 * OAuth Authentication Handler for Deriv API
 * Handles OAuth callback and token management
 */

export interface OAuthTokens {
  accountId: string;
  token: string;
  currency: string;
  accountType: 'CR' | 'VRT' | 'CRW' | 'VRW';
}

export interface OAuthCallbackParams {
  acct1?: string;
  token1?: string;
  cur1?: string;
  acct2?: string;
  token2?: string;
  cur2?: string;
  acct3?: string;
  token3?: string;
  cur3?: string;
  acct4?: string;
  token4?: string;
  cur4?: string;
}

export class OAuthHandler {
  private static APP_ID = process.env.REACT_APP_DERIV_APP_ID || '106913';
  private static AFFILIATE_TOKEN = process.env.REACT_APP_AFFILIATE_TOKEN || '13C3B5B6-FC89-43E0-9AE2-5A8A2ED1680A';
  private static UTM_CAMPAIGN = process.env.REACT_APP_AFFILIATE_CAMPAIGN || 'dynamicworks';
  private static UTM_MEDIUM = process.env.REACT_APP_AFFILIATE_MEDIUM || 'affiliate';
  private static UTM_SOURCE = process.env.REACT_APP_AFFILIATE_SOURCE || 'CU100155';

  /**
   * Generate OAuth URL for user login
   * Includes affiliate tracking parameters
   */
  static getOAuthURL(): string {
    const baseUrl = 'https://oauth.deriv.com/oauth2/authorize';
    const params = new URLSearchParams({
      app_id: this.APP_ID,
    });

    // Add affiliate tracking if available
    if (this.AFFILIATE_TOKEN) {
      params.append('affiliate_token', this.AFFILIATE_TOKEN);
      params.append('utm_campaign', this.UTM_CAMPAIGN);
      params.append('utm_medium', this.UTM_MEDIUM);
      params.append('utm_source', this.UTM_SOURCE);
    }

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate signup URL for new users
   * Includes affiliate tracking parameters
   */
  static getSignupURL(): string {
    const baseUrl = 'https://hub.deriv.com/tradershub/signup';
    const params = new URLSearchParams();

    if (this.AFFILIATE_TOKEN) {
      params.append('t', this.AFFILIATE_TOKEN);
      params.append('utm_campaign', this.UTM_CAMPAIGN);
      params.append('utm_medium', this.UTM_MEDIUM);
      params.append('utm_source', this.UTM_SOURCE);
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }

  /**
   * Parse OAuth callback URL parameters
   * Extracts account tokens from redirect URL
   */
  static parseCallbackParams(url: string): OAuthTokens[] {
    const urlParams = new URLSearchParams(new URL(url).search);
    const accounts: OAuthTokens[] = [];

    // Parse up to 10 accounts (Deriv can return multiple accounts)
    for (let i = 1; i <= 10; i++) {
      const accountId = urlParams.get(`acct${i}`);
      const token = urlParams.get(`token${i}`);
      const currency = urlParams.get(`cur${i}`);

      if (accountId && token && currency) {
        accounts.push({
          accountId: accountId.toUpperCase(),
          token,
          currency: currency.toUpperCase(),
          accountType: this.determineAccountType(accountId),
        });
      }
    }

    return accounts;
  }

  /**
   * Determine account type from account ID
   */
  private static determineAccountType(accountId: string): 'CR' | 'VRT' | 'CRW' | 'VRW' {
    const upperAccountId = accountId.toUpperCase();
    if (upperAccountId.startsWith('CR') && !upperAccountId.startsWith('CRW')) {
      return 'CR'; // Real trading account
    } else if (upperAccountId.startsWith('VRT')) {
      return 'VRT'; // Virtual trading account
    } else if (upperAccountId.startsWith('CRW')) {
      return 'CRW'; // Real wallet
    } else if (upperAccountId.startsWith('VRW')) {
      return 'VRW'; // Virtual wallet
    }
    return 'CR'; // Default
  }

  /**
   * Filter out wallet accounts (CRW, VRW) as they can't trade via API
   * Returns only tradeable accounts (CR, VRT)
   */
  static filterTradeableAccounts(accounts: OAuthTokens[]): OAuthTokens[] {
    return accounts.filter(
      (account) => account.accountType === 'CR' || account.accountType === 'VRT'
    );
  }

  /**
   * Save tokens to localStorage
   */
  static saveTokens(accounts: OAuthTokens[]): void {
    localStorage.setItem('deriv_accounts', JSON.stringify(accounts));
    
    // Set first tradeable account as active
    const tradeableAccounts = this.filterTradeableAccounts(accounts);
    if (tradeableAccounts.length > 0) {
      localStorage.setItem('active_loginid', tradeableAccounts[0].accountId);
      localStorage.setItem('active_token', tradeableAccounts[0].token);
    }
  }

  /**
   * Get saved tokens from localStorage
   */
  static getSavedTokens(): OAuthTokens[] {
    const saved = localStorage.getItem('deriv_accounts');
    return saved ? JSON.parse(saved) : [];
  }

  /**
   * Get active account token
   */
  static getActiveToken(): string | null {
    return localStorage.getItem('active_token');
  }

  /**
   * Get active account ID
   */
  static getActiveAccountId(): string | null {
    return localStorage.getItem('active_loginid');
  }

  /**
   * Switch active account
   */
  static switchAccount(accountId: string): boolean {
    const accounts = this.getSavedTokens();
    const account = accounts.find((acc) => acc.accountId === accountId);

    if (account) {
      localStorage.setItem('active_loginid', account.accountId);
      localStorage.setItem('active_token', account.token);
      return true;
    }

    return false;
  }

  /**
   * Clear all stored tokens (logout)
   */
  static clearTokens(): void {
    localStorage.removeItem('deriv_accounts');
    localStorage.removeItem('active_loginid');
    localStorage.removeItem('active_token');
  }

  /**
   * Track affiliate conversion
   * Call this after successful user signup/login
   */
  static trackConversion(accountId: string): void {
    if (this.AFFILIATE_TOKEN) {
      // Log conversion for analytics
      console.log('[Affiliate] Conversion tracked:', {
        accountId,
        affiliateToken: this.AFFILIATE_TOKEN,
        campaign: this.UTM_CAMPAIGN,
        timestamp: new Date().toISOString(),
      });

      // Store conversion data
      const conversions = JSON.parse(localStorage.getItem('affiliate_conversions') || '[]');
      conversions.push({
        accountId,
        timestamp: new Date().toISOString(),
        campaign: this.UTM_CAMPAIGN,
      });
      localStorage.setItem('affiliate_conversions', JSON.stringify(conversions));
    }
  }
}

export default OAuthHandler;
