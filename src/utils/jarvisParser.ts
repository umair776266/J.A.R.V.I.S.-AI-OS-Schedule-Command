import type { ParsedJarvisCommand, TaskCategory, TaskPriority } from '../types/jarvis.ts';
import { normalizeTime } from './scheduler.ts';

/**
 * Intelligent local intent parser for JARVIS voice commands.
 * Handles scheduling, science lookups, system protocols, and conversational replies.
 */
export function parseCommandLocally(rawText: string): ParsedJarvisCommand {
  const text = rawText.trim();
  const lower = text.toLowerCase().replace(/^(hey\s+jarvis|jarvis|ok\s+jarvis|hey\s+alpha|alpha|ok\s+alpha)[,\s]*/i, '').trim();

  // 1. BIOSCIENCE INTENT: Protein
  const proteinMatch = lower.match(/(?:analyze|check|lookup|search|fetch|inspect)\s+(?:protein|gene)\s+([a-z0-9_-]+)/i) ||
    lower.match(/^protein\s+([a-z0-9_-]+)/i);
  if (proteinMatch) {
    const gene = proteinMatch[1].toUpperCase();
    return {
      intent: 'science_protein',
      spokenResponse: `Accessing biological database for protein ${gene}. Retrieving UniProt sequence and AlphaFold structure models now, sir.`,
      scienceData: {
        queryType: 'protein',
        identifier: gene,
      },
    };
  }

  // 2. BIOSCIENCE INTENT: Chemical Compound / PubChem
  const compoundMatch = lower.match(/(?:analyze|check|lookup|search|fetch|inspect)\s+(?:compound|chemical|drug|molecule)\s+([a-z0-9\s-]+)/i) ||
    lower.match(/^compound\s+([a-z0-9\s-]+)/i) ||
    lower.match(/(?:pubchem\s+(?:lookup|search|query)\s+(?:for\s+)?)([a-z0-9\s-]+)/i);
  if (compoundMatch) {
    const rawName = compoundMatch[1].trim();
    const name = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';
    return {
      intent: 'science_compound',
      spokenResponse: `Querying PubChem database for compound ${name}. Analyzing molecular structure and pharmacophore properties, sir.`,
      scienceData: {
        queryType: 'compound',
        identifier: name,
      },
    };
  }

  // 3. BIOSCIENCE INTENT: Biomedical Literature / PubMed
  const literatureMatch = lower.match(/(?:search|find|lookup)\s+(?:literature|papers|research|pubmed|articles)\s+(?:on|about|for)?\s*([a-z0-9\s-]+)/i);
  if (literatureMatch) {
    const topic = literatureMatch[1].trim();
    return {
      intent: 'science_literature',
      spokenResponse: `Searching PubMed and Europe PMC for biomedical literature on ${topic}, sir.`,
      scienceData: {
        queryType: 'literature',
        identifier: topic,
      },
    };
  }

  // 4. THE ALPHA TOON CHANNEL INTENT
  if (lower.includes('alpha toon') || lower.includes('cartoon') || lower.includes('animation channel')) {
    return {
      intent: 'alpha_toon',
      spokenResponse: "Accessing The Alpha Toon Channel Automation Pipeline, sir. Generating today's animated cartoon episode, comic thumbnail, and multi-platform upload package for YouTube, TikTok, and Instagram.",
    };
  }

  // 5. MEDIA & VIDEO FORGE INTENT
  const mediaMatch = lower.match(/(?:make|create|generate|forge|produce|render)\s+(?:a\s+)?(?:video|reel|shorts?|tiktok|thumbnail|caption|post)\s*(?:about|for|on)?\s*([a-z0-9\s-]+)?/i) ||
    lower.match(/(?:video|thumbnail|caption|media)\s+(?:for|about)\s+([a-z0-9\s-]+)/i);
  if (mediaMatch) {
    const topic = (mediaMatch[1] || 'Web Platform Showcase').trim();
    return {
      intent: 'media_forge',
      spokenResponse: `Initiating Media Forge Studio, sir. Crafting viral video script, high-CTR thumbnail, and platform captions for "${topic}".`,
    };
  }

  // 4. SYSTEM PROTOCOLS
  if (lower.includes('lockdown') || lower.includes('security lockdown') || lower.includes('protocol lockdown')) {
    return {
      intent: 'system_protocol',
      spokenResponse: 'Initiating Security Protocol Lockdown. All telemetry encrypted and perimeter defenses elevated, sir.',
      protocolData: {
        action: 'lockdown',
        message: 'Security Protocol Lockdown Active',
      },
    };
  }

  if (lower.includes('focus mode') || lower.includes('deep work') || lower.includes('protocol focus')) {
    return {
      intent: 'system_protocol',
      spokenResponse: 'Focus Protocol engaged, sir. Minimizing auxiliary notifications and prioritizing primary computation queues.',
      protocolData: {
        action: 'focus_mode',
        message: 'Deep Focus Protocol Engaged',
      },
    };
  }

  if (lower.includes('purge cache') || lower.includes('clear memory') || lower.includes('clean cache')) {
    return {
      intent: 'system_protocol',
      spokenResponse: 'Purging transient application memory buffers. RAM allocation optimized, sir.',
      protocolData: {
        action: 'purge_cache',
        message: 'System Buffers Flushed',
      },
    };
  }

  if (lower.includes('diagnostic') || lower.includes('system scan') || lower.includes('check vitals')) {
    return {
      intent: 'system_diagnostic',
      spokenResponse: 'Running comprehensive diagnostic scan on all computer subsystems. CPU, memory, and telemetry within nominal parameters, sir.',
      protocolData: {
        action: 'diagnostic',
        message: 'Subsystems Diagnostic Complete',
      },
    };
  }

  // 5. SCHEDULE COMPLETE INTENT
  const completeMatch = lower.match(/(?:mark|complete|finish|check\s+off)\s+(?:task\s+)?['"]?([^'"]+)['"]?/i);
  if (completeMatch && !lower.startsWith('schedule') && !lower.startsWith('add') && !lower.startsWith('remind')) {
    const rawTarget = completeMatch[1].trim();
    const target = rawTarget ? rawTarget.charAt(0).toUpperCase() + rawTarget.slice(1) : '';
    return {
      intent: 'schedule_complete',
      spokenResponse: `Marking "${target}" as complete, sir. Well done.`,
      taskData: {
        title: target,
      },
    };
  }

  // 6. SCHEDULE DELETE / CLEAR INTENT
  const deleteMatch = lower.match(/(?:delete|remove|cancel)\s+(?:task\s+)?['"]?([^'"]+)['"]?/i);
  if (deleteMatch) {
    const rawTarget = deleteMatch[1].trim();
    const target = rawTarget ? rawTarget.charAt(0).toUpperCase() + rawTarget.slice(1) : '';
    return {
      intent: 'schedule_delete',
      spokenResponse: `Removing "${target}" from your schedule, sir.`,
      taskData: {
        title: target,
      },
    };
  }

  // 7. SCHEDULE ADD / REMINDER INTENT
  const isScheduleCmd =
    lower.startsWith('schedule') ||
    lower.startsWith('add task') ||
    lower.startsWith('add ') ||
    lower.startsWith('remind me to') ||
    lower.startsWith('create task') ||
    lower.includes('at ') ||
    lower.includes('tomorrow') ||
    lower.includes('pm') ||
    lower.includes('am');

  if (isScheduleCmd) {
    let cleanTitle = lower
      .replace(/^(schedule|add task to|add task|add|remind me to|create task)\s+/i, '')
      .replace(/^a\s+/i, '')
      .trim();

    // Extract time if specified (e.g., "at 3pm", "at 14:00", "for 10:30 am")
    let extractedTime: string | undefined;
    const timeMatch = cleanTitle.match(/(?:at|for|around)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
    if (timeMatch) {
      extractedTime = normalizeTime(timeMatch[1]);
      cleanTitle = cleanTitle.replace(timeMatch[0], '').trim();
    }

    // Extract priority if specified
    let priority: TaskPriority = 'medium';
    if (cleanTitle.includes('urgent') || cleanTitle.includes('high priority') || cleanTitle.includes('important')) {
      priority = 'high';
      cleanTitle = cleanTitle.replace(/(urgent|high priority|important)/i, '').trim();
    } else if (cleanTitle.includes('low priority')) {
      priority = 'low';
      cleanTitle = cleanTitle.replace(/low priority/i, '').trim();
    }

    // Extract category if specified
    let category: TaskCategory = 'schedule';
    if (cleanTitle.includes('lab') || cleanTitle.includes('research') || cleanTitle.includes('protein') || cleanTitle.includes('science')) {
      category = 'research';
    } else if (cleanTitle.includes('system') || cleanTitle.includes('backup') || cleanTitle.includes('clean')) {
      category = 'system';
    } else if (cleanTitle.includes('workout') || cleanTitle.includes('personal') || cleanTitle.includes('dinner') || cleanTitle.includes('lunch')) {
      category = 'personal';
    }

    // Clean up trailing/leading prepositions
    cleanTitle = cleanTitle.replace(/^(to\s+|for\s+)/i, '').replace(/(\s+today|\s+tomorrow)$/i, '').trim();

    // Capitalize first letter
    const finalTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Scheduled Directive';

    return {
      intent: 'schedule_add',
      spokenResponse: `Right away, sir. I have added "${finalTitle}" to your schedule${extractedTime ? ` for ${extractedTime}` : ''}.`,
      taskData: {
        title: finalTitle,
        time: extractedTime,
        category,
        priority,
      },
    };
  }

  // 8. GENERAL J.A.R.V.I.S. QUERY
  return {
    intent: 'general_chat',
    spokenResponse: `Always at your service, sir. All computer subsystems are operational. How may I assist your schedule or research today?`,
  };
}
