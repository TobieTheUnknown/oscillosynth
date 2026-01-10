FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY frontend/ .

# Build for production
RUN npm run build

# Expose port
EXPOSE 5173

# Start preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
