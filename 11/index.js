import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import * as mm from 'music-metadata';

// --- Setup ---
dotenv.config({ path: path.resolve(process.cwd(), './.env') });

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

const inputDirectory = './input';
const outputDirectory = './output';

/**
 * Parses the combined text from the AI to separate Summary and Analytics JSON.
 * @param {string} content The raw content from the AI.
 * @returns {{summary: string, analysis: object}}
 */
function parseAIResponse(content) {
  const summaryMatch = content.match(/^\*\*Summary:\*\*\n([\s\S]*?)\n\*\*Analytics:\*\*/);
  const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);

  const summary = summaryMatch ? summaryMatch[1].trim() : 'Summary could not be parsed.';
  const analysis = jsonMatch ? JSON.parse(jsonMatch[1].trim()) : { error: 'Analytics JSON could not be parsed.' };

  return { summary, analysis };
}


async function main() {
  try {
    // 0. Ensure input/output directories exist
    await fsPromises.mkdir(inputDirectory, { recursive: true });
    await fsPromises.mkdir(outputDirectory, { recursive: true });

    // 1. Find audio files in the specified directory
    const files = await fsPromises.readdir(inputDirectory);
    const audioFiles = files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));

    if (audioFiles.length === 0) {
      console.log(`No audio files found in the '${inputDirectory}' directory.`);
      return;
    }

    const audioFileName = audioFiles[0];
    const audioFilePath = path.join(inputDirectory, audioFileName);
    const baseFileName = path.parse(audioFileName).name;
    const fileOutputDir = path.join(outputDirectory, baseFileName);

    // Create a dedicated output directory for this file's results
    await fsPromises.mkdir(fileOutputDir, { recursive: true });

    console.log(`Processing file: ${audioFileName}`);

    // 2. Transcribe the audio file using Whisper
    console.log('🎤 Transcribing audio... (This may take a moment)');
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-1',
    });

    const transcriptionText = transcription.text;
    const transcriptionOutputPath = path.join(fileOutputDir, 'transcription.md');
    await fsPromises.writeFile(transcriptionOutputPath, transcriptionText);
    console.log(`✅ Transcription saved to ${transcriptionOutputPath}`);

    // 3. Get audio duration for analysis
    const metadata = await mm.parseFile(audioFilePath);
    const durationInSeconds = metadata.format.duration;
    
    // 4. Summarize and analyze the transcript using the GPT model
    console.log('🧠 Analyzing transcription...');
    const systemPrompt = await fsPromises.readFile('prompt.txt', 'utf-8');
    const userMessage = `Transcription Text:
---
${transcriptionText}
---
Audio Duration (in seconds): ${durationInSeconds}
`;

    const response = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    const aiContent = response.choices[0].message.content;

    // 5. Parse the response and save the outputs
    const { summary, analysis } = parseAIResponse(aiContent);

    const summaryOutputPath = path.join(fileOutputDir, 'summary.md');
    await fsPromises.writeFile(summaryOutputPath, summary);
    console.log(`✅ Summary saved to ${summaryOutputPath}`);

    const analysisOutputPath = path.join(fileOutputDir, 'analysis.json');
    await fsPromises.writeFile(analysisOutputPath, JSON.stringify(analysis, null, 2));
    console.log(`✅ Analysis saved to ${analysisOutputPath}`);
    
    // 6. Move the processed audio file to the output directory
    const newAudioFilePath = path.join(fileOutputDir, audioFileName);
    await fsPromises.rename(audioFilePath, newAudioFilePath);
    console.log(`✅ Original audio file moved to ${newAudioFilePath}`);

    // 7. Return summary and analytics to the user in the console
    console.log('\n--- Analysis Complete ---');
    console.log('\n**Summary:**');
    console.log(summary);
    console.log('\n**Analytics:**');
    console.log(JSON.stringify(analysis, null, 2));
    console.log('\n-------------------------');

  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

main(); 