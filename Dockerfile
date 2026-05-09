FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy package files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
