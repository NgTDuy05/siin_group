FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .
COPY public ./public

# Create directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "server.js"]
