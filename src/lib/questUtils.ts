export const formatDueDisplay = (dueRaw: string, dueTime?: string): string => {
  const today = new Date().toISOString().split('T')[0];
  let baseStr = "Today";
  if (dueRaw !== today) {
    const dateObj = new Date(dueRaw + 'T00:00:00');
    baseStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  if (dueTime) {
    const [hourStr, minStr] = dueTime.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    // Format minutes nicely
    const formattedMin = minStr ? minStr.padStart(2, '0') : '00';
    return `${baseStr} at ${formattedHour}:${formattedMin} ${ampm}`;
  }
  return baseStr;
};
