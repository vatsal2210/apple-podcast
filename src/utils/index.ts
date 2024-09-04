export const parseDuration = (duration: string | number): number => {
  if (typeof duration === "number") {
    return duration;
  }

  if (typeof duration === "string") {
    // Check if the string is just a number
    if (/^\d+$/.test(duration)) {
      return parseInt(duration, 10);
    }

    // Parse time format (HH:MM:SS or MM:SS)
    const parts = duration.split(":").map((part) => parseInt(part, 10));

    if (parts.length === 3) {
      // HH:MM:SS
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      // MM:SS
      return parts[0] * 60 + parts[1];
    }
  }

  // Return 0 if unable to parse
  return 0;
};
