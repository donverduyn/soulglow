# Stage 1: Build the Vite application
FROM node:20-alpine as build-stage

# Set the working directory
WORKDIR /app

# Copy package.json, yarn.lock, and openapi.yml to the root of the working directory
COPY package.json yarn.lock .yarnrc openapi.yml ./

# Copy the scripts and patches directories
COPY scripts ./scripts
COPY patches ./patches

# Install dependencies using the frozen lockfile
RUN yarn install --frozen-lockfile

# Copy the rest of your app's source code
COPY . .

# Build your app
RUN yarn build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Remove the default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 to the outside once the container has launched
EXPOSE 80

# Start Nginx and keep it running in the foreground
CMD ["nginx", "-g", "daemon off;"]
