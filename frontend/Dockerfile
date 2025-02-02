# Use the official Node.js image from the Docker Hub
FROM node:14

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the application
RUN npm run build

# Install serve to serve the build
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000"]