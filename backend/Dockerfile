FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/

WORKDIR /app/backend
RUN npm install --omit=dev

WORKDIR /app

COPY backend/src ./backend/src
COPY backend/scripts ./backend/scripts
COPY backend/data/.gitkeep ./backend/data/.gitkeep
COPY jwt ./jwt

RUN mkdir -p /app/backend/data

WORKDIR /app/backend

EXPOSE 3000

CMD ["npm", "run", "docker:start"]