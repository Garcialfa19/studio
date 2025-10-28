# Stage 1: Install dependencies
# We create a separate 'dependencies' stage to leverage Docker's layer caching.
# This layer only gets rebuilt if your package.json or package-lock.json changes.
FROM node:20-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Stage 2: Build the application
# This stage takes the installed dependencies and builds your Next.js app.
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
# Set environment variables for the build
ENV ADMIN_USER=admin
ENV ADMIN_PASS=changeme
# Run the production build
RUN npm run build

# Stage 3: Production image
# This is the final, lean image that will run your application.
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# You can set default credentials here, but it's better to override them at runtime.
ENV ADMIN_USER=admin
ENV ADMIN_PASS=changeme

# Copy the built app from the 'builder' stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# The command to start the app
CMD ["node", "server.js"]
