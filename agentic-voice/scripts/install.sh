#!/bin/bash

# Update package list and install prerequisites
echo "Updating package list and installing prerequisites..."
sudo apt-get update -y
sudo apt-get install -y curl

# Install Node.js (version 18 LTS which is recommended)
echo "Installing Node.js 18 LTS..."
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "Verifying Node.js and npm installation..."
node -v
npm -v

# Navigate to the project directory
echo "Navigating to the project directory..."
cd /workspaces/ruv-dev/chat

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Prompt the user for API keys
read -p "Enter your Deepgram API Key: " DEEPGRAM_API_KEY
read -p "Enter your OpenAI API Key: " OPENAI_API_KEY

# Create .env.local file with the provided keys
echo "Creating .env.local file..."
cat <<EOL > .env.local
DEEPGRAM_STT_DOMAIN=https://api.deepgram.com
DEEPGRAM_API_KEY=$DEEPGRAM_API_KEY
OPENAI_API_KEY=$OPENAI_API_KEY
EOL

# Inform the user the setup is complete
echo "Setup complete. You can now run 'npm run dev' to start the development server."
