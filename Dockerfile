# Use Node.js base image
FROM node:20

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy Angular project files
COPY . .

# Expose the Angular dev server's default port (4200)
EXPOSE 4200

# Serve the app using Angular CLI
CMD ["npm", "run", "start"]