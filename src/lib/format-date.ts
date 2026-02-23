const dateFormatter = new Intl.DateTimeFormat('es-UY', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(date: string | Date): string {
  const parsed = typeof date === 'string' ? new Date(date) : date;
  return dateFormatter.format(parsed);
}
