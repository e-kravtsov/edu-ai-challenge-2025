# AI Product Search

This console application uses OpenAI's function calling feature to provide a natural language interface for searching a local JSON product database. You can ask for products in plain English, and the AI will translate your request into a structured query to find matching items.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- An OpenAI API Key.

## Setup

1.  **Navigate to the project directory:**
    ```bash
    cd 10
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This command installs `dotenv` and the `openai` SDK.

3.  **Create an Environment File:**
    In the `10` directory, create a new file named `.env`.

4.  **Add Your API Key:**
    Open the `.env` file and add your OpenAI API key in the following format:
    ```
    AI_API_KEY=your_openai_api_key_here
    ```
    The application will load this key automatically. This file is included in `.gitignore` to prevent you from accidentally committing your key.

## How to Run

1.  Make sure you are in the `10` directory.
2.  Run the application with the following command:
    ```bash
    npm start
    ```
3.  The application will prompt you to enter your search query. Type your request in natural language and press Enter.

### Example Session

```
> npm start

Hi! How can I help you find a product today?
> I'm looking for something in the kitchen category under $50 with a rating of at least 4.5

🤖 Asking AI to analyze your request...

🔍 AI requested a search with the following filters:
{ category: 'Kitchen', max_price: 50, min_rating: 4.5, in_stock: undefined, keywords: undefined }

✅ Here are your filtered products:
1. Coffee Maker - $49.99, Rating: 4.7, In Stock
```

### Another Example

```
> npm start

Hi! How can I help you find a product today?
> show me books by george orwell

🤖 Asking AI to analyze your request...

🔍 AI requested a search with the following filters:
{ category: 'Books', max_price: undefined, min_rating: undefined, in_stock: undefined, keywords: 'george orwell' }

✅ Here are your filtered products:
1. 1984 by George Orwell - $15.99, Rating: 4.8, In Stock
``` 