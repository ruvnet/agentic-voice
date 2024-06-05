# Agentic Chat App

Agentic Chat App is an advanced AI-powered chat application designed for seamless real-time communication and intelligent responses. Built with Next.js, OpenAI, and Exa API, it leverages cutting-edge technologies to enhance user interactions and provide contextual, relevant information dynamically.

## Features

- **Real-time Communication:** Engage in smooth, responsive chat sessions.
- **AI-Powered Responses:** Utilize OpenAI's GPT models for intelligent, context-aware replies.
- **Contextual Data Retrieval:** Integrate Exa API to fetch and incorporate relevant data into conversations.
- **Customizable Personas:** Tailor chat assistant personas to match specific needs and scenarios.

## Installation

### Prerequisites

- Node.js (v18 LTS recommended)
- npm (included with Node.js)

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ruvnet/agentic-chat.git
   cd agentic-chat
   ```

2. **Run the installation script:**

   Make sure the installation script is executable and run it:

   ```bash
   chmod +x ./scripts/install.sh
   ./scripts/install.sh
   ```

   The script will:

   - Update the package list and install prerequisites.
   - Install Node.js 18 LTS.
   - Verify the installation of Node.js and npm.
   - Navigate to the project directory.
   - Install project dependencies.
   - Prompt for Deepgram and OpenAI API keys and create a `.env.local` file.

## Usage

- Access the chat interface at the provided URL.
- Interact with the AI assistant, which uses the configured APIs to provide intelligent, context-aware responses.

## Deployment

To deploy the app for production, follow these steps:

1. **Build the project:**

   ```bash
   npm run build
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

   Ensure all environment variables are set appropriately in the production environment.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [OpenAI](https://openai.com/)
- [Exa API](https://exa.ai/)

For any questions or support, please open an issue in the [GitHub repository](https://github.com/ruvnet/agentic-chat).
