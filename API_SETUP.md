# API Setup Instructions

## TMDb API Setup

Your Cinema Scope app uses The Movie Database (TMDb) API for movie data. To fix the API issues:

### 1. Get TMDb API Key
1. Go to [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Sign up for a free account
3. Request an API key (it's free)
4. Copy your API key

### 2. Create Environment File
Create a `.env.local` file in your project root with:

```env
# TMDb API Configuration
TMDB_API_KEY=your_actual_api_key_here

# Firebase Configuration (if using Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. For Vercel Deployment
Add these environment variables in your Vercel dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `TMDB_API_KEY` with your actual API key
4. Add any Firebase variables if needed

### 4. Test API
After setting up the environment variables:
1. Restart your development server: `npm run dev`
2. Test the API endpoints:
   - `/api/coming-soon` - Get upcoming movies
   - `/api/search?query=movie_name` - Search for movies

## Current API Endpoints

- **GET** `/api/coming-soon` - Returns upcoming movies
- **GET** `/api/search?query={movie_name}` - Returns detailed movie information

## Troubleshooting

If APIs still don't work:
1. Check that `.env.local` is in your project root
2. Verify the API key is correct
3. Check the browser console for error messages
4. Ensure you're running `npm run dev` after adding environment variables
