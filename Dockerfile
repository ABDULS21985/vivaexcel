FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
ARG APP_NAME
RUN turbo prune --scope=$APP_NAME --docker

FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
ARG APP_NAME
RUN npx turbo build --filter=$APP_NAME...

# Prepare deployment staging area
RUN mkdir -p /app/deploy
RUN if [ "$APP_NAME" = "backend" ]; then \
    cp -r apps/backend/dist /app/deploy/ && \
    mkdir -p /app/deploy/apps/backend && \
    cp apps/backend/package.json /app/deploy/apps/backend/package.json && \
    cp -r node_modules /app/deploy/node_modules; \
    else \
    cp -r apps/${APP_NAME}/.next/standalone/. /app/deploy/ && \
    cp -r apps/${APP_NAME}/.next/static /app/deploy/apps/${APP_NAME}/.next/static && \
    cp -r apps/${APP_NAME}/public /app/deploy/apps/${APP_NAME}/public; \
    fi

FROM base AS runner
WORKDIR /app
ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Copy from deployment staging area
COPY --from=installer --chown=nodejs:nodejs /app/deploy ./

# The command depends on the APP_NAME
CMD ["sh", "-c", "if [ \"$APP_NAME\" = \"backend\" ]; then node apps/backend/dist/main; else node server.js; fi"]
