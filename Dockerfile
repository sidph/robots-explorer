# syntax=docker/dockerfile:1

# ---- Stage 1: build the frontend static assets ----
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ---- Stage 2: install backend deps ----
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json* ./
RUN npm install --omit=dev

# ---- Stage 3: final runtime image ----
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/package.json ./package.json
COPY backend/src ./src

# The built frontend is served as static files by the Express app - see
# backend/src/app.js, which looks for ./public relative to itself.
COPY --from=frontend-build /app/frontend/dist ./public

EXPOSE 3001

# Basic container-level healthcheck hitting the API's own health route.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/api/health').then(r=>{if(r.ok)process.exit(0);process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
