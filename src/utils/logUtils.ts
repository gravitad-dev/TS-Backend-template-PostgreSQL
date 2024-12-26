// Function to remove ANSI codes from log lines
export const removeAnsiCodes = (text: string): string => {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
};

// Function to extract the date from a log line and return it as a Date object
export const extractDateFromLogLine = (line: string): Date | null => {
  // Regular expression to extract the date in the format: 18/Nov/2024:16:48:23 +0000
  const dateRegex =
    /Date:\s*(\d{1,2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}\s[+-]\d{4})/;
  const match = line.match(dateRegex);
  if (match && match[1]) {
    const dateString = match[1];
    // Convert the date string to a Date object
    const date = new Date(dateString.replace(/:/, ' '));
    return date;
  }
  return null;
};
