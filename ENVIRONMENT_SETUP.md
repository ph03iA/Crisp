# Environment Setup

## Required Environment Variables

### Google AI API Key
You need to set up the Google AI API key for the AI scoring functionality.

1. Get your API key from: https://makersuite.google.com/app/apikey
2. Create a `.env.local` file in the root directory
3. Add the following line:

```
VITE_GOOGLE_AI_API_KEY=your_actual_api_key_here
```

## Security Note
- Never commit your actual API key to version control
- The `.env.local` file is already in `.gitignore`
- Use environment variables for all sensitive data

## Development
For local development, create a `.env.local` file with your API key.

## Production
Set the environment variable in your deployment platform (Vercel, Netlify, etc.).
