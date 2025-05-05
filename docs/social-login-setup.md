# Setting Up Social Login for LittleGabriel

This guide will help you set up Google and Apple sign-in for your LittleGabriel application.

## Google OAuth Setup

1. **Go to Google Cloud Console:**
   - Visit https://console.cloud.google.com/
   - Create a new project or select an existing one

2. **Configure OAuth Consent Screen:**
   - In the sidebar, navigate to "APIs & Services" > "OAuth consent screen"
   - Select the appropriate user type (External or Internal)
   - Fill in the required application information
   - Add the scopes: `.../auth/userinfo.email`, `.../auth/userinfo.profile`
   - Add your test users if using External user type
   - Complete the registration

3. **Create OAuth Credentials:**
   - In the sidebar, go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Add a name for your OAuth client
   - Add Authorized JavaScript origins:
     - `https://your-replit-domain.replit.app` (for production)
     - `http://localhost:5000` (for development)
   - Add Authorized redirect URIs:
     - `https://your-replit-domain.replit.app/api/auth/callback/google` (for production)
     - `http://localhost:5000/api/auth/callback/google` (for development)
   - Click "Create"

4. **Set Environment Variables:**
   - Add the Client ID and Client Secret to your `.env` file:
   ```
   GOOGLE_OAUTH_CLIENT_ID="your-google-client-id"
   GOOGLE_OAUTH_CLIENT_SECRET="your-google-client-secret"
   ```

## Apple Sign In Setup

Setting up Apple Sign In is more complex and requires an Apple Developer account.

1. **Sign in to Apple Developer Account:**
   - Visit https://developer.apple.com/ and sign in
   - You need an Apple Developer Program membership ($99/year)

2. **Create App ID:**
   - Go to "Certificates, Identifiers & Profiles"
   - Select "Identifiers" from the sidebar
   - Add a new identifier and select "App IDs"
   - Register a new App ID with Sign In with Apple capability enabled
   - Complete the registration

3. **Create Services ID:**
   - Return to "Identifiers" and add a new identifier
   - Select "Services IDs"
   - Register a new Services ID (e.g., com.yourdomain.littlegabriel)
   - After creating, edit the Services ID
   - Enable "Sign In with Apple"
   - Configure the "Web Domain" and set up your domain verification
   - Set up the "Return URLs" to include:
     - `https://your-replit-domain.replit.app/api/auth/callback/apple` (for production)
     - `http://localhost:5000/api/auth/callback/apple` (for development)

4. **Create Key for Client Secret:**
   - In the sidebar, select "Keys"
   - Add a new key
   - Enable "Sign In with Apple" for the key
   - Configure the key with your primary App ID
   - Download the key file (you'll only be able to do this once)
   - Note the Key ID

5. **Generate Client Secret:**
   - You'll need to generate a JWT client secret
   - This requires you to sign a payload with your private key
   - Use a library like `jsonwebtoken` to create this
   - The payload should include:
     - `iss`: Your Team ID (found in your developer account)
     - `iat`: Issued at time
     - `exp`: Expiration time
     - `aud`: "https://appleid.apple.com"
     - `sub`: Your Services ID (e.g., com.yourdomain.littlegabriel)

6. **Set Environment Variables:**
   - Add the following to your `.env` file:
   ```
   APPLE_ID="your-services-id" (e.g., com.yourdomain.littlegabriel)
   APPLE_SECRET="your-generated-client-secret"
   ```

## Testing Your Social Login

1. Make sure your application is running
2. Go to the login page
3. Click on either the "Sign in with Google" or "Sign in with Apple" button
4. You should be redirected to the respective authentication page
5. After successful authentication, you should be redirected back to your application

## Troubleshooting

- Ensure your environment variables are correctly set up
- Check your OAuth consent screen configuration
- Verify your authorized redirect URIs are correctly set up
- Review NextAuth.js logs for any errors
- Make sure your production environment matches your configured domains