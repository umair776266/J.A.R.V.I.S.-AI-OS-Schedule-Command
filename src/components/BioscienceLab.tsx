import React, { useState } from 'react';
import {
  Dna,
  Search,
  ExternalLink,
  BookOpen,
  FlaskConical,
  Atom,
  CalendarPlus,
  Loader2,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { CompoundInfo, LiteratureItem, ProteinInfo } from '../types/jarvis';

interface BioscienceLabProps {
  onScheduleLiteratureReview: (title: string) => void;
  onSpeak: (text: string) => void;
}

const SAMPLE_PROTEINS = ['TP53', 'EGFR', 'BRCA1', 'INS', 'PCSK9'];
const SAMPLE_COMPOUNDS = ['Caffeine', 'Aspirin', 'Ibuprofen', 'Metformin', 'Remdesivir'];
const SAMPLE_TOPICS = ['CRISPR-Cas9', 'mRNA vaccines', 'AlphaFold structural biology', 'CAR-T cell therapy'];

export const BioscienceLab: React.FC<BioscienceLabProps> = ({
  onScheduleLiteratureReview,
  onSpeak,
}) => {
  const [activeTab, setActiveTab] = useState<'protein' | 'compound' | 'literature'>('protein');
  const [searchQuery, setSearchQuery] = useState('TP53');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Results state
  const [proteinData, setProteinData] = useState<ProteinInfo | null>({
    accession: 'P04637',
    id: 'P53_HUMAN',
    geneName: 'TP53',
    proteinName: 'Cellular tumor antigen p53',
    organism: 'Homo sapiens',
    length: 393,
    functionSummary:
      'Acts as a tumor suppressor in many tumor types; induces growth arrest or apoptosis depending on the physiological circumstances and cell type. Involved in cell cycle regulation as a trans-activator that acts to negatively regulate cell division.',
    alphaFoldId: 'AF-P04637-F1',
    alphaFoldPdbUrl: 'https://alphafold.ebi.ac.uk/files/AF-P04637-F1-model_v6.pdb',
    alphaFoldCifUrl: 'https://alphafold.ebi.ac.uk/files/AF-P04637-F1-model_v6.cif',
    plddtCategory: 'Confident',
    plddtScore: 86.4,
  });

  const [compoundData, setCompoundData] = useState<CompoundInfo | null>(null);
  const [literatureList, setLiteratureList] = useState<LiteratureItem[]>([]);

  const handleSearch = async (queryOverride?: string) => {
    const query = (queryOverride || searchQuery).trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (activeTab === 'protein') {
        const res = await fetch(`/api/science/protein/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Protein not found: ${query}`);
        const data = await res.json();
        setProteinData(data);
        onSpeak(`Protein ${data.geneName || query} loaded from UniProt and AlphaFold database.`);
      } else if (activeTab === 'compound') {
        const res = await fetch(`/api/science/compound/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Compound not found: ${query}`);
        const data = await res.json();
        setCompoundData(data);
        onSpeak(`PubChem entry for ${data.name} retrieved successfully.`);
      } else if (activeTab === 'literature') {
        const res = await fetch(`/api/science/literature/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Literature query failed for: ${query}`);
        const data = await res.json();
        setLiteratureList(data.results || []);
        onSpeak(`Retrieved ${data.results?.length || 0} peer-reviewed articles from Europe PMC and PubMed.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Scientific intelligence query failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-950/80 border border-purple-900/40 rounded-xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-purple-950">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-purple-400" />
            <h2 className="font-hud text-lg sm:text-xl font-bold tracking-wide text-slate-100 uppercase">
              Stark Biotech & Scientific Lab
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time live queries: UniProtKB • AlphaFold DB • PubChem • Europe PMC/PubMed
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('protein');
              setSearchQuery('TP53');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'protein'
                ? 'bg-purple-950 text-purple-300 border border-purple-800/60 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="View Protein Intelligence tab"
          >
            <Dna className="w-3.5 h-3.5" />
            <span>Proteins & AF</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('compound');
              setSearchQuery('Caffeine');
              if (!compoundData) handleSearch('Caffeine');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'compound'
                ? 'bg-purple-950 text-purple-300 border border-purple-800/60 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="View Chemical Compounds tab"
          >
            <Atom className="w-3.5 h-3.5" />
            <span>PubChem Drugs</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('literature');
              setSearchQuery('CRISPR');
              if (literatureList.length === 0) handleSearch('CRISPR');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              activeTab === 'literature'
                ? 'bg-purple-950 text-purple-300 border border-purple-800/60 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            aria-label="View Biomedical Literature tab"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>PubMed Papers</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="my-3.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-purple-400/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'protein'
                  ? 'Search gene / protein (e.g., TP53, EGFR, BRCA1)...'
                  : activeTab === 'compound'
                  ? 'Search chemical name (e.g., Aspirin, Caffeine, Imatinib)...'
                  : 'Search biomedical literature topic (e.g., CRISPR, mRNA)...'
              }
              className="w-full bg-slate-950 border border-purple-900/50 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
              aria-label="Bioscience query input"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 text-white font-mono text-xs font-semibold transition-all border border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] disabled:opacity-50"
            aria-label="Execute scientific query"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span>Query API</span>
          </button>
        </form>

        {/* Quick Example Pills */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Sample Queries:</span>
          </span>
          <div className="flex items-center gap-1">
            {(activeTab === 'protein'
              ? SAMPLE_PROTEINS
              : activeTab === 'compound'
              ? SAMPLE_COMPOUNDS
              : SAMPLE_TOPICS
            ).map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setSearchQuery(sample);
                  handleSearch(sample);
                }}
                className="px-2 py-0.5 rounded bg-slate-900 border border-purple-900/60 hover:border-purple-500/80 text-[11px] font-mono text-slate-300 hover:text-purple-300 transition-all whitespace-nowrap"
                aria-label={`Query ${sample}`}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 mb-3 rounded-lg bg-rose-950/40 border border-rose-800 text-xs font-mono text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Main Scientific Display Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        {activeTab === 'protein' && proteinData && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold font-hud text-slate-100">
                    {proteinData.geneName}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                    UniProt: {proteinData.accession}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {proteinData.organism}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{proteinData.proteinName}</p>
              </div>

              {/* Provenance Badge */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>UniProtKB Reviewed (Swiss-Prot)</span>
              </div>
            </div>

            {/* Protein Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">Sequence Length</div>
                <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">
                  {proteinData.length} aa
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">AlphaFold Model</div>
                <div className="text-sm font-mono font-bold text-cyan-400 mt-0.5 truncate">
                  {proteinData.alphaFoldId}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">pLDDT Confidence</div>
                <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                  <span>{proteinData.plddtCategory}</span>
                  <span className="text-[10px] font-normal text-slate-400">(&gt;70)</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-center">
                <a
                  href={`https://alphafold.ebi.ac.uk/entry/${proteinData.accession}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                  aria-label="Open 3D AlphaFold structure in new tab"
                >
                  <span>View 3D AFDB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Biological Function Summary */}
            <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80">
              <div className="text-[11px] font-mono text-purple-400 font-semibold mb-1 uppercase flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Biological & Molecular Function</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {proteinData.functionSummary}
              </p>
            </div>

            {/* Directives quick bridge */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-mono text-slate-400">
                Integrate protein target into schedule:
              </span>
              <button
                onClick={() =>
                  onScheduleLiteratureReview(`Analyze ${proteinData.geneName} structural dynamics`)
                }
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-cyan-900/60"
                aria-label="Schedule research directive for this protein"
              >
                <CalendarPlus className="w-3.5 h-3.5" />
                <span>Add Target to Schedule</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'compound' && compoundData && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-bold font-hud text-slate-100">
                    {compoundData.name}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                    CID: {compoundData.cid}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-md">
                  {compoundData.iupacName}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>NCBI PubChem PUG REST</span>
              </div>
            </div>

            {/* Compound Details & 2D Depiction Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* 2D Structure Render from PubChem */}
              <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-950 border border-slate-800 text-center">
                <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">2D Depiction</div>
                {compoundData.structure2dUrl && (
                  <img
                    src={compoundData.structure2dUrl}
                    alt={`${compoundData.name} 2D Structure`}
                    className="w-32 h-32 object-contain bg-white rounded-md p-1 shadow-inner"
                  />
                )}
              </div>

              {/* Physicochemical Properties */}
              <div className="sm:col-span-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Formula</span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      {compoundData.formula}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">Weight</span>
                    <span className="text-sm font-mono font-bold text-slate-200">
                      {compoundData.molecularWeight} g/mol
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-0.5">
                    Canonical SMILES
                  </span>
                  <code className="text-xs font-mono text-cyan-300 break-all select-all">
                    {compoundData.canonicalSmiles}
                  </code>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compoundData.cid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 underline"
                    aria-label="View on PubChem site"
                  >
                    <span>View in PubChem</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => onScheduleLiteratureReview(`PubChem assay analysis for ${compoundData.name}`)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-cyan-900/60"
                    aria-label="Schedule assay review"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    <span>Schedule Assay Review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'literature' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span>Peer-Reviewed Literature indexed on Europe PMC & PubMed</span>
              <span className="text-purple-400 font-semibold">{literatureList.length} articles retrieved</span>
            </div>

            {literatureList.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-slate-500">
                No articles loaded. Enter a topic or click a sample query chip above.
              </div>
            ) : (
              <div className="space-y-2">
                {literatureList.map((article) => (
                  <div
                    key={article.id}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-purple-800/60 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-200 leading-snug">
                          {article.title}
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 mt-1">
                          {article.authorString} • {article.journalTitle} ({article.pubYear})
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          onScheduleLiteratureReview(`Review: ${article.title.slice(0, 35)}...`)
                        }
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-[10px] font-mono text-purple-300 whitespace-nowrap"
                        title="Add reading task to daily schedule"
                        aria-label={`Schedule review for ${article.title}`}
                      >
                        <CalendarPlus className="w-3 h-3" />
                        <span>Add to Schedule</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-slate-400">
                      {article.pmid && <span>PMID: {article.pmid}</span>}
                      {article.doi && (
                        <a
                          href={`https://doi.org/${article.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>DOI: {article.doi}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
