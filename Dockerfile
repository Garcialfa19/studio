# 1. Base Image: Use the official Node.js image
FROM node:20-alpine AS base

# 2. Set up the working directory
WORKDIR /app

# 3. Install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# 4. Copy the rest of the application code
COPY . .

# 5. Build the Next.js application
RUN npm run build

# 6. Production Image: Use a smaller, more secure image for the final stage
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production

# Copy the built application from the 'base' stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Command to start the application
CMD ["npm", "start"]
