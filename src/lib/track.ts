export const track = (event: string) => (window as { umami?: { track: (e: string) => void } }).umami?.track(event);
