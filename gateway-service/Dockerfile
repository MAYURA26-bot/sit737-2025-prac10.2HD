# Use Node.js base image
FROM node:16

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy build into image
COPY client-build ./client-build

# Copy the rest of your source code
COPY . .

# Expose the app's port
EXPOSE 5000

# Run the app
CMD ["npm", "start"]