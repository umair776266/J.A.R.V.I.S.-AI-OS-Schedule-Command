import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Volume2,
  Filter,
  Flame,
  Dna,
  Cpu,
  User,
  ListTodo,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { TaskCategory, TaskItem, TaskPriority } from '../types/jarvis';
import { formatTime12h, getScheduleMetrics, getTodayDateString } from '../utils/scheduler';

interface ScheduleManagerProps {
  tasks: TaskItem[];
  onAddTask: (params: {
    title: string;
    time?: string;
    date?: string;
    durationMinutes?: number;
    category?: TaskCategory;
    priority?: TaskPriority;
    description?: string;
  }) => void;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onSpeakTask: (task: TaskItem) => void;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  tasks,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  onSpeakTask,
}) => {
  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'timeline' | 'list'>('timeline');

  // Form states for Add Modal
  const [formTitle, setFormTitle] = useState('');
  const [formTime, setFormTime] = useState('14:00');
  const [formDate, setFormDate] = useState(today);
  const [formCategory, setFormCategory] = useState<TaskCategory>('schedule');
  const [formPriority, setFormPriority] = useState<TaskPriority>('medium');
  const [formDuration, setFormDuration] = useState<number>(30);
  const [formDesc, setFormDesc] = useState('');

  const metrics = getScheduleMetrics(tasks, selectedDate === 'all' ? undefined : selectedDate);

  // Filter tasks based on selections
  const filteredTasks = tasks.filter((task) => {
    if (selectedDate !== 'all' && task.date !== selectedDate) return false;
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    return true;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    onAddTask({
      title: formTitle.trim(),
      time: formTime,
      date: formDate,
      durationMinutes: formDuration,
      category: formCategory,
      priority: formPriority,
      description: formDesc.trim(),
    });
    setFormTitle('');
    setFormDesc('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'research':
        return <Dna className="w-3.5 h-3.5 text-purple-400" />;
      case 'system':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'personal':
        return <User className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Calendar className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-700/60 font-semibold">
            <Flame className="w-2.5 h-2.5 text-rose-400" />
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700/60">
            MED
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700/60">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-cyan-900/50 rounded-xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-950">
        <div>
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-cyan-400" />
            <h2 className="font-hud text-lg sm:text-xl font-bold tracking-wide text-slate-100 uppercase">
              Schedule & Directives Command
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time chronological timeline & automated voice agenda
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* View Tab Selector */}
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveViewTab('timeline')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeViewTab === 'timeline'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Switch to Timeline View"
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveViewTab('list')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeViewTab === 'list'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Switch to Agenda List View"
            >
              List ({filteredTasks.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            aria-label="Add new scheduled task"
          >
            <Plus className="w-4 h-4" />
            <span>New Directive</span>
          </button>
        </div>
      </div>

      {/* Schedule Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Directives Total</div>
          <div className="text-xl font-mono font-bold text-slate-100 mt-1">{metrics.total}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Pending Actions</div>
          <div className="text-xl font-mono font-bold text-cyan-400 mt-1">{metrics.pending}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400 uppercase">High Priority</div>
          <div className="text-xl font-mono font-bold text-rose-400 mt-1">{metrics.highPriority}</div>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase">
            <span>Completion</span>
            <span className="text-emerald-400 font-semibold">{metrics.completionRate}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Date & Category Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-slate-900">
        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 text-xs font-mono">
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              selectedDate === today
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Filter tasks for today"
          >
            Today
          </button>
          <button
            onClick={() => {
              const tm = new Date();
              tm.setDate(tm.getDate() + 1);
              const tmStr = `${tm.getFullYear()}-${String(tm.getMonth() + 1).padStart(2, '0')}-${String(tm.getDate()).padStart(2, '0')}`;
              setSelectedDate(tmStr);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              selectedDate !== today && selectedDate !== 'all'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Filter tasks for tomorrow"
          >
            Upcoming
          </button>
          <button
            onClick={() => setSelectedDate('all')}
            className={`px-2.5 py-1 rounded text-xs transition-all ${
              selectedDate === 'all'
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="Filter tasks across all days"
          >
            All Dates
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 text-xs font-mono overflow-x-auto pb-0.5">
          {['all', 'schedule', 'research', 'system', 'personal'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded capitalize text-[11px] transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-slate-100 border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-label={`Filter by category ${cat}`}
            >
              {cat === 'all' ? 'All Types' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List / Timeline Content */}
      <div className="mt-4">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
            <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-mono text-sm text-slate-300 font-medium">No Directives Found</p>
            <p className="text-xs font-mono text-slate-500 mt-1 max-w-sm mx-auto">
              You can say "Jarvis, schedule lab briefing at 2:30 PM" or click the "New Directive" button above to add tasks.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 font-mono text-xs inline-flex items-center gap-1.5"
              aria-label="Add your first directive"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Directive</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`group flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900/50 border-cyan-950/80 hover:border-cyan-800 hover:bg-slate-900/80'
                }`}
              >
                {/* Left: Completion Checkbox & Info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleComplete(task.id)}
                    className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                    aria-label={task.completed ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`font-mono text-sm font-semibold truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-cyan-300 font-medium">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        {formatTime12h(task.time)}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span>{task.durationMinutes}m duration</span>
                      <span className="text-slate-500">•</span>
                      <span className="flex items-center gap-1 capitalize">
                        {getCategoryIcon(task.category)}
                        {task.category}
                      </span>
                      {task.date !== today && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="text-amber-400/90">{task.date}</span>
                        </>
                      )}
                      {task.source === 'voice' && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 text-[10px] text-cyan-400 border border-cyan-900/60">
                          Voice Ingested
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                  <button
                    onClick={() => onSpeakTask(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                    title="Ask J.A.R.V.I.S. to read directive aloud"
                    aria-label={`Read aloud "${task.title}"`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                    title="Remove directive"
                    aria-label={`Delete task "${task.title}"`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Directive Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-800/80 rounded-xl p-5 shadow-[0_0_40px_rgba(6,182,212,0.25)]">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <h3 className="font-hud text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Schedule New Directive</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
                aria-label="Close modal"
              >
                ESC
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Directive Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Review AlphaFold prediction model"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  aria-label="Directive title input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                    aria-label="Scheduled time input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                    aria-label="Scheduled date input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Domain Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                    aria-label="Domain category select"
                  >
                    <option value="schedule">Schedule / Meeting</option>
                    <option value="research">Biotech / Science</option>
                    <option value="system">System / Computer</option>
                    <option value="personal">Personal / Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                    aria-label="Priority level select"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={formDuration}
                  onChange={(e) => setFormDuration(parseInt(e.target.value, 10) || 30)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
                  aria-label="Duration in minutes"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Directive Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Additional context or links..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-400 resize-none"
                  aria-label="Directive details notes"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 font-mono text-xs hover:bg-slate-700"
                  aria-label="Cancel adding directive"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  aria-label="Save directive"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
