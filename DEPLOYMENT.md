# ECIS Deployment Guide

ECIS deploys as three services:

- `ai-service`: FastAPI geospatial intelligence API.
- `backend`: Express API, MongoDB connection, auth, and AI proxy.
- `frontend`: Vite/React static site.

## Recommended Hosted Setup

Use MongoDB Atlas for the database, Render for `ai-service` and `backend`, and Render Static Site or Vercel for the frontend.

## Environment Variables

### Backend

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
JWT_SECRET=<strong-random-secret>
AI_SERVICE_URL=https://<your-ai-service-host>
```

### AI Service

```env
PORT=8000
ECIS_USER_AGENT=ECIS-App/2.1 contact=<your-email>
NOMINATIM_API_URL=https://nominatim.openstreetmap.org/reverse
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
ECIS_SIGNAL_RADIUS_M=3000
```

### Frontend

```env
VITE_API_URL=https://<your-backend-host>/api
VITE_GEO_API_URL=https://<your-backend-host>/api/v1
```

## Render Blueprint

This repo includes `render.yaml`. Push the project to GitHub, then in Render choose **New > Blueprint** and select the repository.

After the services are created:

1. Set `MONGODB_URI` on `ecis-backend`.
2. Set `ECIS_USER_AGENT` on `ecis-ai-service`.
3. Set `VITE_GEO_API_URL` on `ecis-frontend` to `https://<ecis-backend-url>/api/v1`.
4. Redeploy the frontend after setting frontend environment variables.

## Manual Commands

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port $PORT
```

### Backend

```bash
cd backend
npm ci --omit=dev
npm start
```

### Frontend

```bash
cd frontend
npm ci
npm run build
```

Publish the generated `frontend/dist` directory.

## Health Checks

- Backend: `https://<backend-host>/api/health`
- AI service: `https://<ai-service-host>/health`
- Frontend: open the deployed frontend URL.
