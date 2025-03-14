# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run stage
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install serve (a simple static file server)
RUN npm install -g serve

# Set the environment variable for the port
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start the server using the environment variable
CMD ["sh", "-c", "serve -s dist -l $PORT"]