# Multi-stage build for Video Game Emulator
FROM node:20-alpine AS builder
WORKDIR /app

COPY Video-Game-Emulator/package*.json ./
RUN npm install

COPY Video-Game-Emulator/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY Video-Game-Emulator/package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
