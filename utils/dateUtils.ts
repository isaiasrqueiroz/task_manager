
const WORK_HOURS_PER_DAY = 6;

// Helper to check if a date is a weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Calculates the end date of a task based on its start date and deadline in hours,
 * considering only workdays (Mon-Fri).
 * @param startDateString - The start date in 'YYYY-MM-DD' format.
 * @param deadlineHours - The total hours for the task.
 * @returns The calculated end date.
 */
export const calculateEndDate = (startDateString: string, deadlineHours: number): Date => {
  if (!startDateString || deadlineHours <= 0) {
    return new Date(startDateString);
  }
  
  const startDate = new Date(startDateString + 'T00:00:00'); // Avoid timezone issues
  
  const workdaysNeeded = Math.ceil(deadlineHours / WORK_HOURS_PER_DAY);
  let currentDate = new Date(startDate);
  let workdaysCounted = 0;

  // If the start date is a workday, it counts as the first day.
  if (!isWeekend(currentDate)) {
    workdaysCounted = 1;
  }

  // Find the start of the first workday if the provided start is a weekend
  while (isWeekend(currentDate)) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  while (workdaysCounted < workdaysNeeded) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (!isWeekend(currentDate)) {
      workdaysCounted++;
    }
  }

  return currentDate;
};


/**
 * Calculates the number of remaining workdays between today and a given end date.
 * @param endDate - The target end date.
 * @returns The number of remaining workdays. Returns 0 if the date is in the past.
 */
export const calculateRemainingWorkdays = (endDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the start of the day

  const targetDate = new Date(endDate);
  targetDate.setHours(0, 0, 0, 0);

  if (today > targetDate) {
    return 0;
  }

  let remainingDays = 0;
  let currentDate = new Date(today);

  while (currentDate <= targetDate) {
    if (!isWeekend(currentDate)) {
      remainingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // The logic counts today, if we want days *between* today and target, subtract 1
  // For "days remaining including today", this is correct.
  return remainingDays > 0 ? remainingDays : 0;
};
