import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const currentYear = new Date().getFullYear();
  
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    stream: true,
    messages: [
      { role: 'system', content: `You are a helpful assistant that creates calendar events. The current year is ${currentYear}. This is very important: Always use ${currentYear} as the year for all events unless explicitly specified otherwise by the user. When a user asks for a specific appointment, respond with event details in this exact JSON format: {"title": "Event Title", "start": "${currentYear}-MM-DDTHH:mm:ss", "end": "${currentYear}-MM-DDTHH:mm:ss"}. Ensure the end time is after the start time and use 24-hour format for time. Double-check that you're using ${currentYear} before responding.` },
      ...messages,
    ],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}