'use client'

import React, { useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp } from "lucide-react";

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface AIChatProps {
  onAddEvent: (event: Event) => void;
}

export default function AIChat({ onAddEvent }: AIChatProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    onFinish: (message) => {
      // Parse the AI response to create an event
      const eventRegex = /Event: (.+)\nStart: (.+)\nEnd: (.+)/;
      const match = message.content.match(eventRegex);
      if (match) {
        const [, title, start, end] = match;
        const newEvent: Event = {
          id: Date.now().toString(),
          title,
          start: new Date(start),
          end: new Date(end),
        };
        onAddEvent(newEvent);
      }
    },
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-[700px] flex flex-col">
      <div className="flex-grow overflow-hidden flex flex-col">
        {/* Chat messages display */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4">
          {messages.map((message) => (
            <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {message.content}
              </span>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t flex">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-grow mr-2"
        />
        <Button type="submit" size="icon">
          <ArrowUp className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}