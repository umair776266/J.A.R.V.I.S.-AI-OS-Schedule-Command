export type TaskCategory = 'schedule' | 'research' | 'system' | 'personal';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  time: string; // "HH:MM" in 24h format, e.g. "09:00", "15:30"
  date: string; // "YYYY-MM-DD"
  durationMinutes: number;
  category: TaskCategory;
  priority: TaskPriority;
  completed: boolean;
  createdAt: number;
  source?: 'voice' | 'manual' | 'protocol';
}

export interface ScheduleMetrics {
  total: number;
  completed: number;
  pending: number;
  highPriority: number;
  todayCount: number;
  completionRate: number; // 0 to 100
}

export interface ParsedJarvisCommand {
  intent: 
    | 'schedule_add'
    | 'schedule_complete'
    | 'schedule_delete'
    | 'schedule_list'
    | 'science_protein'
    | 'science_compound'
    | 'science_literature'
    | 'system_protocol'
    | 'system_diagnostic'
    | 'media_forge'
    | 'alpha_toon'
    | 'general_chat';
  spokenResponse: string;
  taskData?: {
    title: string;
    time?: string;
    date?: string;
    durationMinutes?: number;
    category?: TaskCategory;
    priority?: TaskPriority;
    targetTaskId?: string;
  };
  scienceData?: {
    queryType: 'protein' | 'compound' | 'literature';
    identifier: string;
  };
  protocolData?: {
    action: 'lockdown' | 'focus_mode' | 'normal' | 'diagnostic' | 'purge_cache';
    message: string;
  };
}

export interface ProteinInfo {
  accession: string;
  id: string;
  geneName: string;
  proteinName: string;
  organism: string;
  length: number;
  functionSummary: string;
  alphaFoldId?: string;
  alphaFoldPdbUrl?: string;
  alphaFoldCifUrl?: string;
  plddtCategory?: 'Very High' | 'Confident' | 'Low' | 'Very Low';
  plddtScore?: number;
}

export interface CompoundInfo {
  cid: number;
  name: string;
  formula: string;
  molecularWeight: number;
  canonicalSmiles: string;
  iupacName: string;
  xLogP?: number;
  complexity?: number;
  structure2dUrl?: string;
}

export interface LiteratureItem {
  id: string;
  title: string;
  authorString: string;
  journalTitle: string;
  pubYear: string;
  doi?: string;
  pmid?: string;
  abstractText?: string;
}

export interface SystemVitals {
  cpuUsage: number;
  cpuCores: number[];
  ramUsagePercent: number;
  ramUsedGb: number;
  ramTotalGb: number;
  networkUploadKb: number;
  networkDownloadKb: number;
  batteryLevel: number | null;
  isCharging: boolean | null;
  securityStatus: 'OPTIMAL' | 'ELEVATED' | 'LOCKDOWN' | 'FOCUS';
  activeProtocol: string | null;
}

export interface VoiceInteractionLog {
  id: string;
  timestamp: string;
  type: 'user' | 'jarvis' | 'system';
  message: string;
  intent?: string;
}
