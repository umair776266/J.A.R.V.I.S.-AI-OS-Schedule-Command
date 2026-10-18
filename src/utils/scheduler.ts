import type { TaskCategory, TaskItem, TaskPriority, ScheduleMetrics } from '../types/jarvis.ts';

/**
 * Returns today's date in YYYY-MM-DD local format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Standardize 24-hour time "HH:MM"
 */
export function normalizeTime(raw?: string): string {
  if (!raw) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  const clean = raw.trim().toLowerCase();
  
  // match "3pm", "3:30 pm", "15:00", "3:15pm"
  const ampmMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPm = ampmMatch[3] === 'pm';
    if (isPm && hours < 12) hours += 12;
    if (!isPm && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // match "15:00" or "9:30"
  const standardMatch = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (standardMatch) {
    const hours = Math.min(23, Math.max(0, parseInt(standardMatch[1], 10)));
    const minutes = Math.min(59, Math.max(0, parseInt(standardMatch[2], 10)));
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // default fallback to 10:00
  return '10:00';
}

/**
 * Format 24h string "15:30" to "3:30 PM"
 */
export function formatTime12h(time24: string): string {
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  return `${hours}:${minutes} ${ampm}`;
}

export function createTask(params: {
  title: string;
  time?: string;
  date?: string;
  durationMinutes?: number;
  category?: TaskCategory;
  priority?: TaskPriority;
  description?: string;
  source?: 'voice' | 'manual' | 'protocol';
}): TaskItem {
  const today = getTodayDateString();
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: params.title.trim() || 'Untitled Protocol',
    description: params.description || '',
    time: normalizeTime(params.time),
    date: params.date || today,
    durationMinutes: params.durationMinutes && params.durationMinutes > 0 ? params.durationMinutes : 30,
    category: params.category || 'schedule',
    priority: params.priority || 'medium',
    completed: false,
    createdAt: Date.now(),
    source: params.source || 'manual',
  };
}

export function toggleTaskComplete(tasks: TaskItem[], id: string): TaskItem[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
}

export function deleteTask(tasks: TaskItem[], id: string): TaskItem[] {
  return tasks.filter((task) => task.id !== id);
}

export function filterTasks(
  tasks: TaskItem[],
  options: {
    category?: string;
    query?: string;
    date?: string;
    priority?: string;
  }
): TaskItem[] {
  return tasks.filter((task) => {
    if (options.category && options.category !== 'all' && task.category !== options.category) {
      return false;
    }
    if (options.priority && options.priority !== 'all' && task.priority !== options.priority) {
      return false;
    }
    if (options.date && task.date !== options.date) {
      return false;
    }
    if (options.query && options.query.trim()) {
      const q = options.query.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  }).sort((a, b) => {
    // Sort primarily by date then by time
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });
}

export function getScheduleMetrics(tasks: TaskItem[], targetDate?: string): ScheduleMetrics {
  const relevantTasks = targetDate ? tasks.filter((t) => t.date === targetDate) : tasks;
  const total = relevantTasks.length;
  const completed = relevantTasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = relevantTasks.filter((t) => t.priority === 'high' && !t.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const todayStr = getTodayDateString();
  const todayCount = tasks.filter((t) => t.date === todayStr).length;

  return {
    total,
    completed,
    pending,
    highPriority,
    todayCount,
    completionRate,
  };
}

export function findMatchingTask(tasks: TaskItem[], query: string): TaskItem | undefined {
  const clean = query.toLowerCase().trim();
  return tasks.find(
    (t) =>
      t.title.toLowerCase().includes(clean) ||
      clean.includes(t.title.toLowerCase())
  );
}
