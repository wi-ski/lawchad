import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { GmailCredentials } from '../../types/EmailData';

export class GmailOAuth {
  private oauth2Client: OAuth2Client;
  private credentials: Map<string, GmailCredentials> = new Map();

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/gmail/oauth/callback`
    );
  }

  async initialize(): Promise<void> {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials are required: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET');
    }
    console.log('🔐 Gmail OAuth initialized successfully');
  }

  generateAuthUrl(attorneyId: string, scopes?: string[]): string {
    const defaultScopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.labels'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes || defaultScopes,
      state: JSON.stringify({ attorneyId, timestamp: Date.now() }),
      prompt: 'consent'
    });

    console.log(`🔗 Generated auth URL for attorney ${attorneyId}`);
    return authUrl;
  }

  async handleAuthCallback(code: string, state: string): Promise<{ success: boolean; attorneyId?: string; error?: string }> {
    try {
      const stateData = JSON.parse(state);
      const { attorneyId } = stateData;

      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received');
      }

      const credentials: GmailCredentials = {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        redirectUri: this.oauth2Client.redirectUri!,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        expiryDate: tokens.expiry_date || undefined
      };

      this.credentials.set(attorneyId, credentials);
      
      console.log(`✅ OAuth completed for attorney ${attorneyId}`);
      return { success: true, attorneyId };

    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getAuthenticatedClient(attorneyId: string): Promise<OAuth2Client | null> {
    const credentials = this.credentials.get(attorneyId);
    if (!credentials) {
      console.warn(`⚠️ No credentials found for attorney ${attorneyId}`);
      return null;
    }

    const client = new google.auth.OAuth2(
      credentials.clientId,
      credentials.clientSecret,
      credentials.redirectUri
    );

    client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiryDate
    });

    try {
      await this.refreshTokenIfNeeded(client, attorneyId);
      return client;
    } catch (error) {
      console.error(`❌ Failed to authenticate client for ${attorneyId}:`, error);
      return null;
    }
  }

  private async refreshTokenIfNeeded(client: OAuth2Client, attorneyId: string): Promise<void> {
    try {
      const { credentials: newCredentials } = await client.refreshAccessToken();
      
      if (newCredentials.access_token) {
        const existingCredentials = this.credentials.get(attorneyId);
        if (existingCredentials) {
          existingCredentials.accessToken = newCredentials.access_token;
          existingCredentials.expiryDate = newCredentials.expiry_date || undefined;
          this.credentials.set(attorneyId, existingCredentials);
          console.log(`🔄 Refreshed token for attorney ${attorneyId}`);
        }
      }
    } catch (error) {
      console.error(`❌ Token refresh failed for ${attorneyId}:`, error);
      throw error;
    }
  }

  async revokeAccess(attorneyId: string): Promise<boolean> {
    try {
      const client = await this.getAuthenticatedClient(attorneyId);
      if (!client) {
        return false;
      }

      await client.revokeCredentials();
      this.credentials.delete(attorneyId);
      
      console.log(`🗑️ Revoked access for attorney ${attorneyId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to revoke access for ${attorneyId}:`, error);
      return false;
    }
  }

  async testConnection(attorneyId: string): Promise<{ success: boolean; userEmail?: string; error?: string }> {
    try {
      const client = await this.getAuthenticatedClient(attorneyId);
      if (!client) {
        return { success: false, error: 'No authenticated client available' };
      }

      const gmail = google.gmail({ version: 'v1', auth: client });
      const profile = await gmail.users.getProfile({ userId: 'me' });
      
      return { 
        success: true, 
        userEmail: profile.data.emailAddress 
      };
    } catch (error) {
      console.error(`❌ Connection test failed for ${attorneyId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  getStoredCredentials(attorneyId: string): GmailCredentials | null {
    return this.credentials.get(attorneyId) || null;
  }

  hasValidCredentials(attorneyId: string): boolean {
    const credentials = this.credentials.get(attorneyId);
    if (!credentials || !credentials.accessToken) {
      return false;
    }

    if (credentials.expiryDate && credentials.expiryDate < Date.now()) {
      return !!credentials.refreshToken;
    }

    return true;
  }

  listAuthenticatedAttorneys(): string[] {
    return Array.from(this.credentials.keys());
  }

  async storeCredentials(attorneyId: string, credentials: GmailCredentials): Promise<void> {
    this.credentials.set(attorneyId, credentials);
    console.log(`💾 Stored credentials for attorney ${attorneyId}`);
  }

  async loadCredentialsFromStorage(): Promise<void> {
    console.log('📂 Loading credentials from storage (placeholder implementation)');
  }

  async saveCredentialsToStorage(): Promise<void> {
    console.log('💾 Saving credentials to storage (placeholder implementation)');
  }
}
