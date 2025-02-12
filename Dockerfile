# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy project files
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Expose ports
EXPOSE 3000 8080

# Run the application
CMD ["node", "server.js"]
