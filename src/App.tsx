import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  TaskItem,
  VoiceInteractionLog,
  SystemVitals,
  TaskCategory,
  TaskPriority,
  ParsedJarvisCommand,
} from './types/jarvis';
import {
  createTask,
  toggleTaskComplete,
  deleteTask,
  getTodayDateString,
  findMatchingTask,
} from './utils/scheduler';
import {
  JarvisSpeechRecognizer,
  playJarvisSound,
  speakJarvis,
} from './services/voiceService';
import { HeaderHUD } from './components/HeaderHUD';
import { ArcReactorVisualizer } from './components/ArcReactorVisualizer';
import { VoiceCommandBar } from './components/VoiceCommandBar';
import { ScheduleManager } from './components/ScheduleManager';
import { BioscienceLab } from './components/BioscienceLab';
import { SystemTelemetry } from './components/SystemTelemetry';
import { JarvisLog } from './components/JarvisLog';
import { MediaForgeStudio } from './components/MediaForgeStudio';
import { AlphaToonAutomation } from './components/AlphaToonAutomation';
import { ListTodo, FlaskConical, Shield, Activity, Volume2, Video, Film, Sparkles } from 'lucide-react';

export default function App() {
  const today = getTodayDateString();

  // Initial Demo Tasks
  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 'task-1',
      title: 'Stark Industries Executive Briefing',
      description: 'Review quarterly renewable arc-reactor distribution targets',
      time: '09:30',
      date: today,
      durationMinutes: 45,
      category: 'schedule',
      priority: 'high',
      completed: true,
      createdAt: Date.now() - 3600000,
      source: 'manual',
    },
    {
      id: 'task-2',
      title: 'AlphaFold TP53 Structural Validation',
      description: 'Inspect pLDDT confidence scores for DNA-binding domain mutations',
      time: '14:00',
      date: today,
      durationMinutes: 60,
      category: 'research',
      priority: 'high',
      completed: false,
      createdAt: Date.now() - 1800000,
      source: 'voice',
    },
    {
      id: 'task-3',
      title: 'Subsystem Memory Cache Sweep',
      description: 'Purge transient application telemetry and optimize process heap',
      time: '16:30',
      date: today,
      durationMinutes: 15,
      category: 'system',
      priority: 'medium',
      completed: false,
      createdAt: Date.now() - 900000,
      source: 'protocol',
    },
    {
      id: 'task-4',
      title: 'The Alpha Toon Ep #14: Automated Dispatch (YT, TikTok, Insta)',
      description: 'Daily automated cartoon release: Alpha vs The Rogue AI Coffee Machine with comic thumbnail and viral captions.',
      time: '17:00',
      date: today,
      durationMinutes: 30,
      category: 'schedule',
      priority: 'high',
      completed: false,
      createdAt: Date.now() - 450000,
      source: 'protocol',
    },
  ]);

  // Communication & Activity Logs
  const [logs, setLogs] = useState<VoiceInteractionLog[]>([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'jarvis',
      message:
        'Good day, Sir. All computer subsystems are operating within nominal parameters. Daily schedule and Biotech lab modules are online.',
    },
  ]);

  // System Vitals
  const [vitals, setVitals] = useState<SystemVitals>({
    cpuUsage: 28,
    cpuCores: [20, 35, 18, 45, 22, 40, 16, 38],
    ramUsagePercent: 58,
    ramUsedGb: 9.3,
    ramTotalGb: 16.0,
    networkUploadKb: 420,
    networkDownloadKb: 1480,
    batteryLevel: 0.96,
    isCharging: true,
    securityStatus: 'OPTIMAL',
    activeProtocol: null,
  });

  // Voice & Interaction states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isContinuousListening, setIsContinuousListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [mainActiveTab, setMainActiveTab] = useState<'schedule' | 'alphatoon' | 'media' | 'science' | 'all'>('alphatoon');

  const recognizerRef = useRef<JarvisSpeechRecognizer | null>(null);

  // Helper to add to log
  const addLog = useCallback(
    (type: 'user' | 'jarvis' | 'system', message: string, intent?: string) => {
      setLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          type,
          message,
          intent,
        },
      ]);
    },
    []
  );

  // Play verbal reply from J.A.R.V.I.S.
  const handleJarvisSpeak = useCallback(
    (text: string) => {
      if (isMuted) return;
      setIsSpeaking(true);
      speakJarvis(text, () => {
        setIsSpeaking(false);
      });
    },
    [isMuted]
  );

  // Execute Command Logic
  const executeCommand = useCallback(
    async (commandText: string) => {
      if (!commandText.trim()) return;

      setIsProcessing(true);
      addLog('user', commandText);
      if (!isMuted) playJarvisSound('activate');

      try {
        const response = await fetch('/api/jarvis/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: commandText,
            currentTasks: tasks.map((t) => ({ id: t.id, title: t.title, time: t.time, completed: t.completed })),
          }),
        });

        if (!response.ok) {
          throw new Error('Command processing request failed');
        }

        const parsed: ParsedJarvisCommand = await response.json();

        // 1. Spoken response & log
        addLog('jarvis', parsed.spokenResponse, parsed.intent);
        handleJarvisSpeak(parsed.spokenResponse);

        // 2. Perform requested actions
        if (parsed.intent === 'schedule_add' && parsed.taskData) {
          const newTask = createTask({
            title: parsed.taskData.title,
            time: parsed.taskData.time,
            date: parsed.taskData.date || today,
            durationMinutes: parsed.taskData.durationMinutes || 30,
            category: parsed.taskData.category || 'schedule',
            priority: parsed.taskData.priority || 'medium',
            source: 'voice',
          });
          setTasks((prev) => [...prev, newTask]);
          if (!isMuted) playJarvisSound('confirm');
        } else if (parsed.intent === 'schedule_complete' && parsed.taskData) {
          const match = findMatchingTask(tasks, parsed.taskData.title);
          if (match) {
            setTasks((prev) => toggleTaskComplete(prev, match.id));
            if (!isMuted) playJarvisSound('complete');
          }
        } else if (parsed.intent === 'schedule_delete' && parsed.taskData) {
          const match = findMatchingTask(tasks, parsed.taskData.title);
          if (match) {
            setTasks((prev) => deleteTask(prev, match.id));
          }
        } else if (parsed.intent === 'system_protocol' && parsed.protocolData) {
          if (parsed.protocolData.action === 'lockdown') {
            setVitals((v) => ({ ...v, securityStatus: 'LOCKDOWN', activeProtocol: 'DEFENSE LOCKDOWN' }));
            if (!isMuted) playJarvisSound('alert');
          } else if (parsed.protocolData.action === 'focus_mode') {
            setVitals((v) => ({ ...v, securityStatus: 'FOCUS', activeProtocol: 'DEEP FOCUS' }));
            if (!isMuted) playJarvisSound('confirm');
          } else if (parsed.protocolData.action === 'purge_cache') {
            setVitals((v) => ({ ...v, ramUsagePercent: 38, ramUsedGb: 6.1 }));
            if (!isMuted) playJarvisSound('confirm');
          }
        } else if (parsed.intent === 'system_diagnostic') {
          setVitals((v) => ({
            ...v,
            cpuUsage: 19,
            securityStatus: 'OPTIMAL',
            activeProtocol: null,
          }));
          if (!isMuted) playJarvisSound('confirm');
        } else if (parsed.intent === 'media_forge') {
          setMainActiveTab('media');
          if (!isMuted) playJarvisSound('confirm');
        } else if (parsed.intent === 'alpha_toon') {
          setMainActiveTab('alphatoon');
          if (!isMuted) playJarvisSound('confirm');
        } else if (
          parsed.intent === 'science_protein' ||
          parsed.intent === 'science_compound' ||
          parsed.intent === 'science_literature'
        ) {
          // Switch view if needed
          if (mainActiveTab === 'schedule') {
            setMainActiveTab('science');
          }
          if (!isMuted) playJarvisSound('confirm');
        }
      } catch (err: any) {
        console.error('Command execution error:', err);
        const fallbackMsg = `Understood, sir. Processing directive: "${commandText}". Command logged.`;
        addLog('jarvis', fallbackMsg);
        handleJarvisSpeak(fallbackMsg);
      } finally {
        setIsProcessing(false);
      }
    },
    [tasks, today, isMuted, addLog, handleJarvisSpeak, mainActiveTab]
  );

  // Setup Web Speech recognition
  useEffect(() => {
    const recognizer = new JarvisSpeechRecognizer();
    recognizerRef.current = recognizer;

    return () => {
      recognizer.stop();
    };
  }, []);

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognizerRef.current) return;

    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
      setInterimTranscript('');
    } else {
      if (!isMuted) playJarvisSound('activate');
      setIsListening(true);
      recognizerRef.current.start(
        isContinuousListening,
        (transcript, isFinal) => {
          if (isFinal) {
            setInterimTranscript('');
            if (!isContinuousListening) {
              setIsListening(false);
            }
            executeCommand(transcript);
          } else {
            setInterimTranscript(transcript);
          }
        },
        (listening) => {
          setIsListening(listening);
        }
      );
    }
  };

  // Toggle continuous always-listening mode
  const toggleContinuous = () => {
    const nextState = !isContinuousListening;
    setIsContinuousListening(nextState);
    if (nextState && !isListening) {
      toggleListening();
    }
    const message = nextState
      ? 'Always-listening continuous voice input engaged, sir.'
      : 'Continuous listener paused. Push-to-talk mode active.';
    addLog('system', message);
    handleJarvisSpeak(message);
  };

  // Protocols trigger handler
  const handleTriggerProtocol = (protocol: 'lockdown' | 'focus_mode' | 'normal') => {
    if (protocol === 'lockdown') {
      setVitals((v) => ({ ...v, securityStatus: 'LOCKDOWN', activeProtocol: 'DEFENSE LOCKDOWN' }));
      if (!isMuted) playJarvisSound('alert');
      const msg = 'Security Protocol Lockdown activated. Computer perimeter defenses secured.';
      addLog('system', msg);
      handleJarvisSpeak(msg);
    } else if (protocol === 'focus_mode') {
      setVitals((v) => ({ ...v, securityStatus: 'FOCUS', activeProtocol: 'DEEP FOCUS' }));
      if (!isMuted) playJarvisSound('confirm');
      const msg = 'Deep Focus Protocol engaged. Subsystem background tasks throttled.';
      addLog('system', msg);
      handleJarvisSpeak(msg);
    } else {
      setVitals((v) => ({ ...v, securityStatus: 'OPTIMAL', activeProtocol: null }));
      if (!isMuted) playJarvisSound('confirm');
      const msg = 'Protocols restored to standard operating parameters, sir.';
      addLog('system', msg);
      handleJarvisSpeak(msg);
    }
  };

  // Diagnostics sweep handler
  const handleRunDiagnostic = () => {
    if (!isMuted) playJarvisSound('confirm');
    const msg = 'Comprehensive diagnostic sweep complete. All CPU cores, memory buffers, and telemetry nominal, sir.';
    addLog('system', msg);
    handleJarvisSpeak(msg);
  };

  // RAM cache purge handler
  const handlePurgeCache = () => {
    setVitals((v) => ({ ...v, ramUsagePercent: 36, ramUsedGb: 5.8 }));
    if (!isMuted) playJarvisSound('confirm');
    const msg = 'Memory cache purged. 3.5 GB released into primary buffer.';
    addLog('system', msg);
    handleJarvisSpeak(msg);
  };

  // Add task handler
  const handleAddTask = (params: {
    title: string;
    time?: string;
    date?: string;
    durationMinutes?: number;
    category?: TaskCategory;
    priority?: TaskPriority;
    description?: string;
  }) => {
    const newTask = createTask({
      ...params,
      source: 'manual',
    });
    setTasks((prev) => [...prev, newTask]);
    if (!isMuted) playJarvisSound('confirm');
    const confirmMsg = `Directive "${newTask.title}" scheduled for ${newTask.time}.`;
    addLog('jarvis', confirmMsg);
    handleJarvisSpeak(confirmMsg);
  };

  // Toggle complete handler
  const handleToggleComplete = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const updated = toggleTaskComplete(prev, id);
      if (target) {
        if (!target.completed) {
          if (!isMuted) playJarvisSound('complete');
          handleJarvisSpeak(`Directive "${target.title}" accomplished, sir.`);
          addLog('system', `Completed directive: ${target.title}`);
        }
      }
      return updated;
    });
  };

  // Delete task handler
  const handleDeleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => deleteTask(prev, id));
    if (target) {
      addLog('system', `Deleted directive: ${target.title}`);
    }
  };

  // Read task aloud
  const handleSpeakTask = (task: TaskItem) => {
    const text = `Directive: ${task.title}. Scheduled for ${task.time}, priority is ${task.priority}. Status is ${
      task.completed ? 'completed' : 'pending'
    }.`;
    handleJarvisSpeak(text);
  };

  // Schedule literature review bridge
  const handleScheduleLiteratureReview = (title: string) => {
    handleAddTask({
      title: title,
      time: '15:30',
      category: 'research',
      priority: 'high',
      description: 'Review structural dynamics and peer-reviewed biological literature.',
    });
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 bg-scanline flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Header HUD with Live Clock & Telemetry */}
      <HeaderHUD
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        isContinuousListening={isContinuousListening}
        onToggleContinuous={toggleContinuous}
        securityStatus={vitals.securityStatus}
        activeProtocol={vitals.activeProtocol}
        onTriggerProtocol={handleTriggerProtocol}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* 2. Hero Interactive Command Center */}
        <section className="relative rounded-2xl bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950/90 border border-cyan-900/40 p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Centerpiece: Holographic Arc Reactor Visualizer */}
            <div className="flex flex-col items-center justify-center">
              <ArcReactorVisualizer
                isListening={isListening}
                isSpeaking={isSpeaking}
                isProcessing={isProcessing}
                onToggleListen={toggleListening}
                statusText={vitals.activeProtocol || 'J.A.R.V.I.S. MARK-85 ONLINE'}
              />
            </div>

            {/* Voice & Command Directive Console */}
            <div className="flex-1 w-full space-y-4">
              <div className="flex items-center justify-between border-b border-cyan-950/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-hud text-sm sm:text-base font-bold text-cyan-300 uppercase tracking-wider">
                    Voice & Scheduling Directive Interface
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Model: <span className="text-cyan-400 font-semibold">gemini-3.8-flash</span>
                </div>
              </div>

              {/* The Command Bar */}
              <VoiceCommandBar
                onSendCommand={executeCommand}
                isListening={isListening}
                onToggleListen={toggleListening}
                interimTranscript={interimTranscript}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </section>

        {/* 3. Computer Subsystems & Vitals Telemetry */}
        <section>
          <SystemTelemetry
            vitals={vitals}
            onRunDiagnostic={handleRunDiagnostic}
            onPurgeCache={handlePurgeCache}
            onTriggerProtocol={handleTriggerProtocol}
          />
        </section>

        {/* 4. Main Multi-Pane Workbench Navigation */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-900 pb-2">
          <div className="flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-800 text-xs font-mono overflow-x-auto">
            <button
              onClick={() => setMainActiveTab('alphatoon')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                mainActiveTab === 'alphatoon'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500 font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-amber-400 hover:text-amber-200 bg-amber-950/30 border border-amber-900/40'
              }`}
              aria-label="View The Alpha Toon Channel Automation"
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>The Alpha Toon (1 Vid/Day)</span>
            </button>
            <button
              onClick={() => setMainActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                mainActiveTab === 'all'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="View All Modules"
            >
              Complete Command View
            </button>
            <button
              onClick={() => setMainActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                mainActiveTab === 'schedule'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="View Schedule Only"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Daily Schedule</span>
            </button>
            <button
              onClick={() => setMainActiveTab('media')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                mainActiveTab === 'media'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="View Media & Video Forge"
            >
              <Video className="w-3.5 h-3.5 text-cyan-400" />
              <span>Media & Video Forge</span>
            </button>
            <button
              onClick={() => setMainActiveTab('science')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                mainActiveTab === 'science'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="View Biotech Science Lab Only"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Biotech Lab</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
            {tasks.filter((t) => !t.completed).length} Pending Tasks • The Alpha Toon Pipeline ACTIVE
          </div>
        </div>

        {/* 5. The Alpha Toon Channel Automation Studio */}
        {(mainActiveTab === 'alphatoon' || mainActiveTab === 'all') && (
          <div>
            <AlphaToonAutomation
              onScheduleDirective={(title, time, desc) =>
                handleAddTask({
                  title,
                  time: time || '17:00',
                  category: 'schedule',
                  priority: 'high',
                  description: desc,
                })
              }
              onSpeak={handleJarvisSpeak}
            />
          </div>
        )}

        {/* 6. Media Forge Studio */}
        {mainActiveTab === 'media' && (
          <div>
            <MediaForgeStudio
              onScheduleUpload={(title, time, desc) =>
                handleAddTask({
                  title,
                  time: time || '16:00',
                  category: 'schedule',
                  priority: 'high',
                  description: desc,
                })
              }
              onSpeak={handleJarvisSpeak}
            />
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 ${mainActiveTab === 'media' || mainActiveTab === 'alphatoon' ? 'hidden' : ''}`}>
          {/* Daily Schedule Command Component */}
          {(mainActiveTab === 'all' || mainActiveTab === 'schedule') && (
            <div className={mainActiveTab === 'all' ? 'lg:col-span-7' : 'lg:col-span-12'}>
              <ScheduleManager
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleComplete={handleToggleComplete}
                onDeleteTask={handleDeleteTask}
                onSpeakTask={handleSpeakTask}
              />
            </div>
          )}

          {/* Stark Biotech Lab Component */}
          {(mainActiveTab === 'all' || mainActiveTab === 'science') && (
            <div className={mainActiveTab === 'all' ? 'lg:col-span-5' : 'lg:col-span-12'}>
              <BioscienceLab
                onScheduleLiteratureReview={handleScheduleLiteratureReview}
                onSpeak={handleJarvisSpeak}
              />
            </div>
          )}
        </div>

        {/* In Complete view, also render Media Forge Studio */}
        {mainActiveTab === 'all' && (
          <div>
            <MediaForgeStudio
              onScheduleUpload={(title, time, desc) =>
                handleAddTask({
                  title,
                  time: time || '16:00',
                  category: 'schedule',
                  priority: 'high',
                  description: desc,
                })
              }
              onSpeak={handleJarvisSpeak}
            />
          </div>
        )}

        {/* 6. Neural Speech & Directive Communication Feed */}
        <section>
          <JarvisLog
            logs={logs}
            onClearLogs={() => setLogs([])}
            onReplaySpeech={handleJarvisSpeak}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-3 px-4 text-center text-xs font-mono text-slate-500">
        <p>J.A.R.V.I.S. Operating System • Stark Industries AI Architecture • Real-Time Voice & Daily Scheduling Control</p>
      </footer>
    </div>
  );
}
