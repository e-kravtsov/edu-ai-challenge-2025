# AI Service Analyzer

This is a lightweight console application that accepts a service name or a raw text description of a service and generates a comprehensive, markdown-formatted report from multiple viewpoints—including business, technical, and user-focused perspectives.

This tool uses a powerful AI model to extract and synthesize relevant information, providing structured insights in a clean, readable format.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- An AI provider API Key from OpenAI.

## Setup

1.  **Navigate to the project directory:**
    ```bash
    cd 9
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This will install `dotenv` and the `openai` SDK.

3.  **Configure your API Key:**
    Create a file named `.env` in this directory. Add your OpenAI API key to it:
    ```
    AI_API_KEY=your_openai_api_key_here
    ```
    The application is configured to automatically load this key.

4.  **Review the Prompt:**
    The AI prompt is located at `9/prompt.txt`. You can modify it if you need to change the AI's behavior.

## How to Run

Run the application from within the `9` directory using the following command:

```bash
npm start
```

The application will launch in interactive mode and prompt you to enter the type of analysis you want to perform (`service` or `text`) and then ask for the corresponding input.

### Example Session
```
> npm start

Analyze by "service" name or by "text" description? (service/text): service
Please enter the service name (e.g., "Notion"): Github

Analyzing known service: Github...

Generating report... (Please wait)

--- Generated AI Report ---
### Brief History
GitHub was launched in 2008...
...
---------------------------
``` 