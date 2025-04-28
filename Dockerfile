# Use an official Node.js runtime as a base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app runs on (optional, if you know it)
EXPOSE 3000

# Command to run your app
CMD ["node", "src/index.js"]
