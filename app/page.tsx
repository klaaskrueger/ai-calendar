'use client'

import { useState, useEffect } from 'react';
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
    // Load events from localStorage when the component mounts
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents).map((event: Event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      })));
    }
  }, []);

  const handleAddEvent = (newEvent: Event) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    // Save updated events to localStorage
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    const title = prompt('Enter a title for your event:');
    if (title) {
      const newEvent: Event = {
        id: Date.now().toString(),
        title,
        start: slotInfo.start,
        end: slotInfo.end,
      };
      handleAddEvent(newEvent);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, width: '100%' }}
        view={view}
        onView={(newView) => setView(newView)}
        selectable={true}
        onSelectSlot={handleSelectSlot}
      />
      <AIChat onAddEvent={handleAddEvent} />
    </main>
  );
}
