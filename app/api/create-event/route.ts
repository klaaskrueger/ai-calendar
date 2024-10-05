import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

function ensureCurrentYear(dateString: string): string {
  const currentYear = new Date().getFullYear();
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;
  const match = dateString.match(dateRegex);
  
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    if (parseInt(year) !== currentYear) {
      return `${currentYear}-${month}-${day}T${hour}:${minute}:${second}`;
    }
  }
  
  return dateString;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    console.log('Received message in create-event API:', message);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: `You are a helpful assistant that creates calendar events. The current year is ${new Date().getFullYear()}. Always use this year unless explicitly specified otherwise. Extract event details from the user message and respond with a JSON object containing title, start, and end properties. Use the format YYYY-MM-DDTHH:mm:ss for dates and times.` },
        { role: 'user', content: message },
      ],
    });

    const result = await completion.json();
    console.log('OpenAI response:', result);

    let eventDetails;
    try {
      eventDetails = JSON.parse(result.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return NextResponse.json({ error: 'Invalid response format from AI' }, { status: 400 });
    }

    console.log('Parsed event details:', eventDetails);

    const event = {
      id: Date.now().toString(),
      title: eventDetails.title,
      start: new Date(eventDetails.start).toISOString(),
      end: new Date(eventDetails.end).toISOString(),
    };

    if (isNaN(new Date(event.start).getTime()) || isNaN(new Date(event.end).getTime())) {
      return NextResponse.json({ error: 'Invalid date in event object' }, { status: 400 });
    }

    console.log('Created event object:', event);
    return NextResponse.json(event);
  } catch (error) {
    console.error('Detailed error in create-event:', error);
    return NextResponse.json({ error: 'Failed to create event', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}