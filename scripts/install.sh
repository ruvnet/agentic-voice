#!/bin/bash

# Function to check if Node.js is installed
function is_node_installed() {
    if command -v node &>/dev/null; then
        echo "Node.js is already installed."
        return 0
    else
        echo "Node.js is not installed."
        return 1
    fi
}

# Check the operating system
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Running on Linux"
    
    # Check if Node.js is installed
    if ! is_node_installed; then
        # Update package list and install prerequisites
        echo "Updating package list and installing prerequisites..."
        sudo apt-get update -y
        sudo apt-get install -y curl

        # Install Node.js (version 18 LTS which is recommended)
        echo "Installing Node.js 18 LTS..."
        curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Running on Mac"
    
    # Check if Homebrew is installed
    if ! command -v brew &>/dev/null; then
        echo "Homebrew is not installed. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Check if Node.js is installed
    if ! is_node_installed; then
        echo "Installing the latest version of Node.js using Homebrew..."
        brew install node
    fi

else
    echo "Unsupported operating system. This script only supports Linux and Mac."
    exit 1
fi

# Verify installation
echo "Verifying Node.js and npm installation..."
node -v
npm -v

# Navigate to the project directory
echo "Navigating to the project directory..."
cd agentic-voice

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
