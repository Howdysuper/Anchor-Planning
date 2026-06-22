export const getCalendarToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('google_calendar_token');
};

export const fetchCalendarEvents = async (timeMin: Date, timeMax: Date) => {
  const token = getCalendarToken();
  if (!token) return [];

  try {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.status === 401) {
      localStorage.removeItem('google_calendar_token');
      return [];
    }
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

export const createCalendarEvent = async (title: string, dateObj: Date) => {
  const token = getCalendarToken();
  if (!token) return null;

  const startFormat = dateObj.toISOString().split('T')[0];
  const nextDay = new Date(dateObj);
  nextDay.setDate(nextDay.getDate() + 1);
  const endFormat = nextDay.toISOString().split('T')[0];

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: title,
        description: 'Created from your Anchor App',
        start: {
          date: startFormat
        },
        end: {
          date: endFormat
        }
      })
    });
    if (!res.ok) throw new Error('Failed to create event');
    return await res.json();
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
};
