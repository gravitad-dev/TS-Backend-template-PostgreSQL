# Base image of Node.js with Alpine to keep the image lightweight
FROM node:18-alpine

# Install necessary tools including OpenSSL and Dockerize
RUN apk add --no-cache wget openssl && \
    wget https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.6.1.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-linux-amd64-v0.6.1.tar.gz && \
    rm dockerize-linux-amd64-v0.6.1.tar.gz

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code to the container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript code to JavaScript
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Wait for PostgreSQL to be available before starting the application
CMD ["dockerize", "-wait", "tcp://supabase_db:5432", "-timeout", "60s", "npm start"]
