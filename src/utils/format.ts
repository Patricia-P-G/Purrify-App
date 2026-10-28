// Converts milliseconds to "m:ss"
export const formatDuration = (milliseconds?: number): string => {
  if (milliseconds === undefined) return "—";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Converts milliseconds to a screen-reader friendly sentence
export const formatDurationAccessible = (milliseconds?: number): string => {
  if (milliseconds === undefined) return "Duration unavailable";

  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const minuteText = `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  const secondText = `${seconds} ${seconds === 1 ? "second" : "seconds"}`;

  return `${minuteText} and ${secondText}`;
};
