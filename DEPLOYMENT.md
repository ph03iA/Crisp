# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Google API Key**: Get your Gemini API key from [Google AI Studio](https://aistudio.google.com)

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Set Environment Variables
```bash
vercel env add GOOGLE_API_KEY
# Enter your Gemini API key when prompted
```

### 4. Deploy
```bash
vercel --prod
```

## Manual Deployment via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**:
   - Framework Preset: `Vite`
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add `GOOGLE_API_KEY` with your Gemini API key

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

## Project Structure for Vercel

```
├── api/
│   └── index.js          # Serverless API functions
├── src/                   # React frontend
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── .vercelignore         # Files to ignore
```

## API Endpoints

- `POST /api/upload-resume` - Upload and parse resume
- `POST /api/start-interview` - Generate AI questions
- `POST /api/submit-answer` - Submit interview answers
- `POST /api/finish-interview` - Complete interview and get score
- `GET /api/candidates` - Get all candidates
- `GET /api/candidate/:id` - Get specific candidate details

## Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Ensure `GOOGLE_API_KEY` is set in Vercel environment variables
   - Check that the API key has proper permissions

2. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version compatibility

3. **File Upload Issues**:
   - Vercel has file size limits (4.5MB for hobby plan)
   - Consider using external storage for larger files

### Environment Variables

Required:
- `GOOGLE_API_KEY` - Your Gemini API key

Optional:
- `VITE_API_BASE` - Custom API base URL (defaults to `/api`)

## Production Considerations

1. **Database**: Current setup uses in-memory storage (resets on each deployment)
2. **File Storage**: Uploaded files are temporary (consider external storage)
3. **Rate Limits**: Vercel has API rate limits
4. **Monitoring**: Use Vercel Analytics for performance monitoring

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Enable SSL (automatic with Vercel)
