import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import OpenAI from 'openai';

// --- Setup ---
dotenv.config({ path: path.resolve(process.cwd(), './.env') });

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

// --- Local Data and Functions ---
let products = [];

// This function is for our use, to be called when the AI requests it.
function search_products({ category, max_price, min_rating, in_stock, keywords }) {
  console.log('\n🔍 AI requested a search with the following filters:');
  console.log({ category, max_price, min_rating, in_stock, keywords });

  let filteredProducts = [...products];

  if (category) {
    filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (max_price !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price <= max_price);
  }
  if (min_rating !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.rating >= min_rating);
  }
  if (in_stock) {
    filteredProducts = filteredProducts.filter(p => p.in_stock);
  }
  if (keywords) {
    const lowerKeywords = keywords.toLowerCase();
    filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(lowerKeywords));
  }
  
  // Return the data in a structured way for the final output.
  return filteredProducts;
}

// --- AI Tool Definition ---
// This is the schema that tells the AI how to use our local function.
const tools = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Searches the product dataset based on specified criteria and returns a list of matching products.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'The category of the product to filter by (e.g., "Electronics", "Fitness").',
            enum: ["Electronics", "Fitness", "Kitchen", "Books", "Clothing"]
          },
          max_price: {
            type: 'number',
            description: 'The maximum price for the products.',
          },
          min_rating: {
            type: 'number',
            description: 'The minimum rating for the products.',
          },
          in_stock: {
            type: 'boolean',
            description: 'Whether to only include products that are currently in stock.',
          },
          keywords: {
            type: 'string',
            description: 'Keywords to search for in the product name (e.g., "wireless", "watch").'
          }
        },
        required: [], // Let the AI decide which parameters to use based on user query
      },
    },
  },
];

// --- Main Application Logic ---
async function main() {
  // Load external data
  try {
    const productsData = await fs.readFile('products.json', 'utf-8');
    products = JSON.parse(productsData);
  } catch (error) {
    console.error('Failed to load or parse products.json:', error);
    return;
  }
  
  const systemPrompt = await fs.readFile('prompt.txt', 'utf-8');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) => new Promise(resolve => rl.question(query, resolve));

  try {
    const userQuery = await question('Hi! How can I help you find a product today?\n> ');

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery },
    ];

    console.log('\n🤖 Asking AI to analyze your request...');
    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: messages,
      tools: tools,
      tool_choice: 'auto',
    });

    const responseMessage = response.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    if (toolCalls) {
      const toolCall = toolCalls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      if (functionName === 'search_products') {
        const filteredProducts = search_products(functionArgs);

        console.log('\n✅ Here are your filtered products:');
        if (filteredProducts.length > 0) {
          filteredProducts.forEach((product, index) => {
            const stockStatus = product.in_stock ? 'In Stock' : 'Out of Stock';
            console.log(`${index + 1}. ${product.name} - $${product.price}, Rating: ${product.rating}, ${stockStatus}`);
          });
        } else {
          console.log('No products found matching your criteria.');
        }
      }
    } else {
      console.log("The AI didn't request a search. Try rephrasing your request to be more specific.");
      console.log(responseMessage.content);
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    rl.close();
  }
}

main(); 