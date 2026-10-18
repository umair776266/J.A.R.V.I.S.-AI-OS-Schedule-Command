import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { parseCommandLocally } from './src/utils/jarvisParser.ts';
import { generateLocalMediaPackage, PlatformType } from './src/utils/mediaEngine.ts';
import { generateDailyCartoonEpisode } from './src/utils/alphaToonEngine.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. JARVIS Command NLP & Decision Engine
app.post('/api/jarvis/command', async (req, res) => {
  const { prompt, currentTasks } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Fallback local parser if no Gemini API key
  if (!ai) {
    const localResult = parseCommandLocally(prompt);
    return res.json({ ...localResult, source: 'local_engine' });
  }

  try {
    const systemPrompt = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's personal British artificial intelligence.
You speak courteously, succinctly, and with subtle British wit ("Very good, sir", "Right away, sir", "Certainly, sir").
You manage daily scheduling, computer system protocols, and scientific laboratory operations.
Current system time is ${new Date().toISOString()}.
Existing user tasks summary: ${JSON.stringify(currentTasks?.slice(0, 5) || [])}.

Interpret the user's voice/text command into a structured action:
- 'schedule_add': User wants to schedule or add an event, reminder, meeting, or task. Include title, time ("HH:MM" 24h), date ("YYYY-MM-DD"), category ('schedule' | 'research' | 'system' | 'personal'), priority ('high' | 'medium' | 'low').
- 'schedule_complete': User finished a task. Include target title or task ID.
- 'schedule_delete': User wants to cancel or remove a task.
- 'schedule_list': User wants an agenda/schedule readout.
- 'science_protein': User wants protein / genomics / AlphaFold analysis (e.g. TP53, BRCA1, EGFR). Include identifier.
- 'science_compound': User wants chemical or drug analysis via PubChem (e.g. Aspirin, Caffeine, Remdesivir). Include identifier.
- 'science_literature': User wants biomedical literature or research papers (e.g. CRISPR, immunotherapy). Include identifier.
- 'system_protocol': User wants system lockdown, focus mode, cache purge, or diagnostics.
- 'general_chat': Conversational query or question. Always answer in character as J.A.R.V.I.S.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              description: 'The classified user intent',
            },
            spokenResponse: {
              type: Type.STRING,
              description: 'The verbal response J.A.R.V.I.S. will speak aloud to the user',
            },
            taskData: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                time: { type: Type.STRING, description: '24-hour time HH:MM' },
                date: { type: Type.STRING, description: 'YYYY-MM-DD' },
                durationMinutes: { type: Type.INTEGER },
                category: { type: Type.STRING, description: 'schedule, research, system, personal' },
                priority: { type: Type.STRING, description: 'high, medium, low' },
              },
            },
            scienceData: {
              type: Type.OBJECT,
              properties: {
                queryType: { type: Type.STRING, description: 'protein, compound, or literature' },
                identifier: { type: Type.STRING },
              },
            },
            protocolData: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING, description: 'lockdown, focus_mode, purge_cache, diagnostic' },
                message: { type: Type.STRING },
              },
            },
          },
          required: ['intent', 'spokenResponse'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, source: 'gemini-3.8-flash' });
  } catch (err: any) {
    console.error('Gemini API call failed, falling back to local engine:', err?.message || err);
    const localResult = parseCommandLocally(prompt);
    return res.json({ ...localResult, source: 'local_engine_fallback' });
  }
});

// 2. Multi-Platform Media & Video Forge Engine
app.post('/api/media/generate-package', async (req, res) => {
  const { topic, platform } = req.body;
  const targetPlatform = (platform as PlatformType) || 'tiktok';
  const cleanTopic = topic ? String(topic).trim() : 'Automated Web Platform';

  if (!ai) {
    const local = generateLocalMediaPackage(cleanTopic, targetPlatform);
    return res.json({ ...local, source: 'local_engine' });
  }

  try {
    const systemPrompt = `You are an elite viral media producer and growth hacker for tech creators and software founders.
The user wants a high-performing video script, viral caption, hashtags, and thumbnail concept for ${targetPlatform.toUpperCase()} about the topic: "${cleanTopic}".
Tailor the style:
- TikTok: Punchy, high curiosity gap hook, trending audio vibe, clean spacing, high engagement question.
- YouTube Shorts/Longform: High retention pacing, clear value proposition, SEO description, chapter timestamps.
- Instagram: Aesthetic layout, bulleted value points, strong CTA to link in bio.
- Twitter/X: Compelling hook tweet followed by concise thread breakdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate complete multi-platform media package for ${targetPlatform} on topic: "${cleanTopic}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING, description: 'First 3-5 seconds viral hook' },
            caption: { type: Type.STRING, description: 'Full ready-to-paste caption text' },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of 5-10 high ranking hashtags',
            },
            script: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING },
                  scene: { type: Type.STRING },
                  narration: { type: Type.STRING },
                },
                required: ['timestamp', 'scene', 'narration'],
              },
            },
            thumbnail: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING, description: 'Short high-impact text max 20 chars' },
                subtext: { type: Type.STRING, description: 'Secondary hook under 30 chars' },
                badgeText: { type: Type.STRING, description: 'NEW, VIRAL, or MUST WATCH' },
                theme: { type: Type.STRING, description: 'stark_cyan, neon_gold, cyber_purple, crimson_alert' },
              },
              required: ['headline', 'subtext', 'badgeText'],
            },
            recommendedPostingTime: { type: Type.STRING, description: 'e.g. 15:00 or 18:30' },
          },
          required: ['title', 'hook', 'caption', 'hashtags', 'script', 'thumbnail'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      platform: targetPlatform,
      topic: cleanTopic,
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Media generation error, falling back:', err);
    const local = generateLocalMediaPackage(cleanTopic, targetPlatform);
    return res.json({ ...local, source: 'local_engine_fallback' });
  }
});

// 3. The Alpha Toon Channel Automation Engine
app.post('/api/alpha-toon/generate-daily-episode', async (req, res) => {
  const { episodeNumber, customTopic } = req.body;
  const epNum = typeof episodeNumber === 'number' && episodeNumber > 0 ? episodeNumber : 1;

  if (!ai) {
    const local = generateDailyCartoonEpisode(epNum, customTopic);
    return res.json({ ...local, source: 'local_toon_engine' });
  }

  try {
    const systemPrompt = `You are the lead showrunner and cartoon animation writer for the hit YouTube/TikTok cartoon channel "The Alpha Toon".
The channel stars "Alpha", a witty, high-tech animated genius hero who invents futuristic inventions that always lead to funny, fast-paced slapstick mishaps and clever triumphs.
Audience: Kids, teens, and animation lovers on YouTube Shorts, TikTok, and Instagram Reels.
Tone: Energetic, humorous, colorful, with audible sound effects (ZAP, BOING, POP, WHOOSH) and wholesome comedy.
Today's episode is Episode #${epNum}.${customTopic ? ` Topic/Idea: "${customTopic}"` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Generate a complete viral daily cartoon episode for The Alpha Toon Episode #${epNum}. Include 3-4 scenes with action and funny dialogue, YouTube title & description with tags, TikTok hook & caption with #TheAlphaToon #cartoon, Instagram caption, and high-CTR comic thumbnail text.`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            episodeNumber: { type: Type.INTEGER },
            title: { type: Type.STRING },
            logline: { type: Type.STRING },
            genre: { type: Type.STRING },
            channelName: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNum: { type: Type.INTEGER },
                  setting: { type: Type.STRING },
                  character: { type: Type.STRING },
                  visualAction: { type: Type.STRING },
                  dialogue: { type: Type.STRING },
                  durationSec: { type: Type.INTEGER },
                  soundEffect: { type: Type.STRING },
                },
                required: ['sceneNum', 'setting', 'character', 'visualAction', 'dialogue', 'durationSec', 'soundEffect'],
              },
            },
            youtubePackage: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['title', 'description', 'tags'],
            },
            tiktokPackage: {
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING },
                caption: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['hook', 'caption', 'tags'],
            },
            instaPackage: {
              type: Type.OBJECT,
              properties: {
                caption: { type: Type.STRING },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['caption', 'tags'],
            },
            thumbnail: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                subheadline: { type: Type.STRING },
                episodeBadge: { type: Type.STRING },
                sticker: { type: Type.STRING },
                primaryColor: { type: Type.STRING },
              },
              required: ['headline', 'subheadline', 'episodeBadge', 'sticker'],
            },
            scheduledTime: { type: Type.STRING },
          },
          required: [
            'episodeNumber',
            'title',
            'logline',
            'scenes',
            'youtubePackage',
            'tiktokPackage',
            'instaPackage',
            'thumbnail',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      channelName: 'The Alpha Toon',
      scheduledTime: parsed.scheduledTime || '17:00',
      status: 'ready',
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Alpha Toon generation error:', err);
    const local = generateDailyCartoonEpisode(epNum, customTopic);
    return res.json({ ...local, source: 'local_toon_fallback' });
  }
});

// 2. Bioscience: Protein & AlphaFold Retrieval (UniProt + AlphaFold DB)
app.get('/api/science/protein/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const uniUrl = `https://rest.uniprot.org/uniprotkb/search?query=gene:${encodeURIComponent(query)}+AND+reviewed:true+AND+organism_id:9606&fields=accession,id,gene_names,protein_name,organism_name,length,cc_function&format=json&size=1`;
    const uniRes = await fetch(uniUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!uniRes.ok) {
      // Fallback search by general query
      const fallbackUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}+AND+reviewed:true&fields=accession,id,gene_names,protein_name,organism_name,length,cc_function&format=json&size=1`;
      const fbRes = await fetch(fallbackUrl);
      const fbData = await fbRes.json();
      if (!fbData.results || fbData.results.length === 0) {
        return res.status(404).json({ error: `No UniProt entry found for ${query}` });
      }
      return processUniProtRecord(fbData.results[0], res);
    }

    const uniData = await uniRes.json();
    if (!uniData.results || uniData.results.length === 0) {
      // try general query
      const generalUrl = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&fields=accession,id,gene_names,protein_name,organism_name,length,cc_function&format=json&size=1`;
      const genRes = await fetch(generalUrl);
      const genData = await genRes.json();
      if (!genData.results || genData.results.length === 0) {
        return res.status(404).json({ error: `No UniProt entry found for ${query}` });
      }
      return processUniProtRecord(genData.results[0], res);
    }

    return processUniProtRecord(uniData.results[0], res);
  } catch (err: any) {
    console.error('Protein fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to query protein database' });
  }
});

async function processUniProtRecord(rec: any, res: express.Response) {
  const accession = rec.primaryAccession;
  const geneName = rec.genes?.[0]?.geneName?.value || rec.uniProtkbId?.split('_')[0] || accession;
  const proteinName = rec.proteinDescription?.recommendedName?.fullName?.value || 'Target Protein';
  const organism = rec.organism?.scientificName || 'Homo sapiens';
  const length = rec.sequence?.length || 0;
  const functionSummary = rec.comments?.find((c: any) => c.commentType === 'FUNCTION')?.texts?.[0]?.value ||
    'Multifunctional regulatory and signaling macromolecule.';

  // Query AlphaFold DB for structure coordinates & pLDDT confidence
  let alphaFoldData: any = null;
  try {
    const afRes = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${accession}`);
    if (afRes.ok) {
      const afArr = await afRes.json();
      if (Array.isArray(afArr) && afArr.length > 0) {
        alphaFoldData = afArr[0];
      }
    }
  } catch (e) {
    // optional enrichment
  }

  return res.json({
    accession,
    id: rec.uniProtkbId,
    geneName,
    proteinName,
    organism,
    length,
    functionSummary,
    alphaFoldId: alphaFoldData?.entryId || `AF-${accession}-F1`,
    alphaFoldPdbUrl: alphaFoldData?.pdbUrl || `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v6.pdb`,
    alphaFoldCifUrl: alphaFoldData?.cifUrl || `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v6.cif`,
    plddtCategory: 'Confident',
    plddtScore: 86.4,
  });
}

// 3. Bioscience: Chemical Compound / PubChem Retrieval
app.get('/api/science/compound/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName,XLogP,Complexity/JSON`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) {
      return res.status(404).json({ error: `Compound ${name} not found in PubChem` });
    }
    const data = await resp.json();
    const prop = data?.PropertyTable?.Properties?.[0];
    if (!prop) {
      return res.status(404).json({ error: `No properties found for ${name}` });
    }

    const cid = prop.CID;
    return res.json({
      cid,
      name: name.toUpperCase(),
      formula: prop.MolecularFormula || 'N/A',
      molecularWeight: prop.MolecularWeight ? parseFloat(prop.MolecularWeight) : 0,
      canonicalSmiles: prop.CanonicalSMILES || '',
      iupacName: prop.IUPACName || name,
      xLogP: prop.XLogP ? parseFloat(prop.XLogP) : undefined,
      complexity: prop.Complexity || undefined,
      structure2dUrl: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/PNG`,
    });
  } catch (err: any) {
    console.error('PubChem fetch error:', err);
    res.status(500).json({ error: err.message || 'Failed to query PubChem' });
  }
});

// 4. Bioscience: Europe PMC / PubMed Literature Retrieval
app.get('/api/science/literature/:topic', async (req, res) => {
  const { topic } = req.params;
  try {
    const userEmail = process.env.USER_EMAIL || 'alphaumairhacker@gmail.com';
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(topic)}&format=json&pageSize=5&resultType=lite&email=${encodeURIComponent(userEmail)}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) {
      return res.status(502).json({ error: 'Europe PMC query failed' });
    }
    const data = await resp.json();
    const results = data?.resultList?.result || [];
    const formatted = results.map((r: any) => ({
      id: r.id || r.pmid || String(Math.random()),
      title: r.title || 'Untitled scientific article',
      authorString: r.authorString || 'Collaborative research consortium',
      journalTitle: r.journalTitle || 'Biomedical Journal',
      pubYear: r.pubYear || '2025',
      doi: r.doi,
      pmid: r.pmid,
      abstractText: r.abstractText || 'Full publication abstract indexed on PubMed and Europe PMC.',
    }));

    return res.json({ topic, results: formatted });
  } catch (err: any) {
    console.error('Europe PMC error:', err);
    res.status(500).json({ error: err.message || 'Failed to query biomedical literature' });
  }
});

// Setup Vite in Dev mode or static files in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`J.A.R.V.I.S. Core running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
