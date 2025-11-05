# Dockerfile for Next.js application

# 1. Builder Stage: Install dependencies and build the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package manager files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
# The standalone output mode will create a .next/standalone directory
# with all the necessary files to run the app.
RUN npm run build

# ---

# 2. Runner Stage: Create a small production image
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the built standalone application from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the public folder for images, fonts, etc.
COPY --from=builder /app/public ./public
# Copy the data folder for the json files
COPY --from=builder /app/src/data ./src/data


# Expose the port Next.js will run on
EXPOSE 3000

# Set the environment to production
ENV NODE_ENV=production

# The command to start the application
# server.js is the entry point for the standalone Next.js server
CMD ["node", "server.js"]
