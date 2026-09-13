FROM node:22-alpine

WORKDIR /app
RUN apk add --no-cache vlc

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV PORT=10000
EXPOSE 10000
CMD ["node", "server/vlc-server.mjs"]