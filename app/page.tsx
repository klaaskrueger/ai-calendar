'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import AIChat from './components/AIChat';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<View>('week');

  useEffect(() => {
    console.log('Home component mounted');
    // Load events from localStorage when the component mounts
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: Event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      }));
      console.log('Loaded events from localStorage:', parsedEvents);
      setEvents(parsedEvents);
    }
  }, []);

  const handleAddEvent = useCallback((newEvent: Event) => {
    console.log('handleAddEvent called with:', newEvent);
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents, {
        ...newEvent,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end)
      }];
      localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      console.log('Updated events:', updatedEvents);
      return updatedEvents;
    });
  }, []);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    console.log('Slot selected:', slotInfo);
    const title = prompt('Enter a title for your event:');
    if (title) {
      const newEvent: Event = {
        id: Date.now().toString(),
        title,
        start: slotInfo.start,
        end: slotInfo.end,
      };
      console.log('New event created from slot selection:', newEvent);
      handleAddEvent(newEvent);
    }
  };

  console.log('Rendering Home component with events:', events);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-2xl mb-4">AI Kalender</h1>
      <div className="flex w-full">
        <div className="w-2/3" style={{ marginRight: '20px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor={(event) => new Date(event.start)}
            endAccessor={(event) => new Date(event.end)}
            style={{ height: '100%', width: '100%' }}
            view={view}
            onView={(newView) => {
              console.log('Calendar view changed to:', newView);
              setView(newView);
            }}
            selectable={true}
            onSelectSlot={handleSelectSlot}
          />
        </div>
        <div className="w-1/3 flex flex-col">
          <AIChat onAddEvent={handleAddEvent} />
        </div>
      </div>
    </main>
  );
}
