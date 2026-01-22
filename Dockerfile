FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run vite build || npx vite build

EXPOSE 5173

# Listen on 0.0.0.0 instead of 127.0.0.1 for external access
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]
