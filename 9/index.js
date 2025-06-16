import readline from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import OpenAI from "openai";

// Configure dotenv to load the .env file from the root directory
dotenv.config({ path: path.resolve(process.cwd(), './.env') });

// --- Helper function to simulate AI interaction ---
async function getAiReport(input) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is not set in the .env file.");
  }
  
  const client = new OpenAI({apiKey});
    
  const promptTemplate = await fs.readFile('prompt.txt', 'utf-8');
  const prompt = promptTemplate.replace('{user_input}', input);

  console.log("\nGenerating report... (Please wait)\n");
  
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });
  
  return response.choices[0].message.content;
}

async function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise(resolve => rl.question(query, resolve));

    try {
        const inputType = await question('Analyze by "service" name or by "text" description? (service/text): ');

        let userInput;
        if (inputType.toLowerCase() === 'service') {
            userInput = await question('Please enter the service name (e.g., "Notion"): ');
            console.log(`\nAnalyzing known service: ${userInput}...`);
        } else if (inputType.toLowerCase() === 'text') {
            userInput = await question('Please enter the raw text description: ');
            console.log(`\nAnalyzing provided text...`);
        } else {
            console.log('Invalid input type. Please restart and choose either "service" or "text".');
            return;
        }

        if (!userInput) {
            console.log('No input provided. Exiting.');
            return;
        }

        const report = await getAiReport(userInput);
        console.log("--- Generated AI Report ---");
        console.log(report);
        console.log("---------------------------");

    } catch (error) {
        console.error("An error occurred:", error.message);
    } finally {
        rl.close();
    }
}

main(); 