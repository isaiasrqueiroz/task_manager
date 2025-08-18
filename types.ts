
export interface Task {
  id: string; // Task ID
  description: string;
  category: string;
  status: string;
  isUrgent: boolean;
  isImportant: boolean;
  deadlineHours: number;
  startDate: string; // ISO string format for dates
  completionDate?: string | null; // ISO string format for dates
}
