'use client'

import React, { useRef, useEffect, useState } from 'react';
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
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    onFinish: async (message) => {
      console.log('AI response received:', message.content);
      if (isCreatingEvent) return; // Prevent multiple event creations
      setIsCreatingEvent(true);
      try {
        console.log('Sending request to create-event API...');
        const response = await fetch('/api/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message.content }),
        });

        console.log('create-event API response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to create event: ${errorData.details || response.statusText}`);
        }

        const event: Event = await response.json();
        console.log('Event created:', event);

        onAddEvent(event);
        console.log('onAddEvent called with:', event);
        
        alert(`Event "${event.title}" has been created for ${new Date(event.start).toLocaleString()}`);
      } catch (error) {
        console.error('Error in create-event process:', error);
        alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsCreatingEvent(false);
      }
    },
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  console.log('Current messages:', messages);

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