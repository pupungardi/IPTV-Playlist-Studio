import { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Check,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Search,
  SlidersHorizontal,
  Globe,
  Tag,
} from 'lucide-react';
import { Channel } from '../types/iptv';
import {
  calculateTvgSync,
  SyncOptions,
  DEFAULT_SYNC_OPTIONS,
  SyncCandidateResult,
} from '../utils/tvgSync';

interface AutoSyncTvgModalProps {
  channels: Channel[];
  onApplySync: (updatedChannels: Channel[]) => void;
  onClose: () => void;
}

export function AutoSyncTvgModal({
  channels,
  onApplySync,
  onClose,
}: AutoSyncTvgModalProps) {
  const [options, setOptions] = useState<SyncOptions>(DEFAULT_SYNC_OPTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'changes' | 'all' | 'id' | 'country'>('changes');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Compute sync candidates based on current options
  const syncCandidates = useMemo(() => {
    return calculateTvgSync(channels, options);
  }, [channels, options]);

  // Selected channel IDs for applying sync
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    // Default select all channels that have changes
    const initial = new Set<string>();
    for (const c of syncCandidates) {
      if (c.hasChange) {
        initial.add(c.channelId);
      }
    }
    return initial;
  });

  // Keep selection synced when options change
  const handleOptionToggle = (key: keyof SyncOptions) => {
    const nextOptions = { ...options, [key]: !options[key] };
    setOptions(nextOptions);
    const recalculated = calculateTvgSync(channels, nextOptions);
    const newSelected = new Set<string>();
    for (const c of recalculated) {
      if (c.hasChange) {
        newSelected.add(c.channelId);
      }
    }
    setSelectedIds(newSelected);
  };

  // Filtered view based on activeTab and searchQuery
  const filteredCandidates = useMemo(() => {
    let list = syncCandidates;

    if (activeTab === 'changes') {
      list = list.filter((c) => c.hasChange);
    } else if (activeTab === 'id') {
      list = list.filter((c) => c.proposedTvgId !== c.currentTvgId);
    } else if (activeTab === 'country') {
      list = list.filter((c) => c.proposedCountry !== c.currentCountry);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.originalName.toLowerCase().includes(q) ||
          c.groupTitle.toLowerCase().includes(q) ||
          c.proposedTvgId.toLowerCase().includes(q) ||
          c.proposedCountry.toLowerCase().includes(q) ||
          c.reason.toLowerCase().includes(q)
      );
    }

    return list;
  }, [syncCandidates, activeTab, searchQuery]);

  // Stats
  const totalWithChanges = useMemo(() => {
    return syncCandidates.filter((c) => c.hasChange).length;
  }, [syncCandidates]);

  const totalIdChanges = useMemo(() => {
    return syncCandidates.filter((c) => c.proposedTvgId !== c.currentTvgId).length;
  }, [syncCandidates]);

  const totalCountryChanges = useMemo(() => {
    return syncCandidates.filter((c) => c.proposedCountry !== c.currentCountry).length;
  }, [syncCandidates]);

  // Selection handlers
  const allFilteredSelected =
    filteredCandidates.length > 0 &&
    filteredCandidates.every((c) => selectedIds.has(c.channelId));

  const toggleSelectAllFiltered = () => {
    const next = new Set(selectedIds);
    if (allFilteredSelected) {
      filteredCandidates.forEach((c) => next.delete(c.channelId));
    } else {
      filteredCandidates.forEach((c) => next.add(c.channelId));
    }
    setSelectedIds(next);
  };

  const toggleSelectChannel = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleApply = () => {
    if (selectedIds.size === 0) return;

    const candidateMap = new Map<string, SyncCandidateResult>();
    syncCandidates.forEach((c) => candidateMap.set(c.channelId, c));

    const updatedChannels = channels.map((ch) => {
      if (selectedIds.has(ch.id)) {
        const match = candidateMap.get(ch.id);
        if (match) {
          return {
            ...ch,
            tvgId: match.proposedTvgId,
            tvgCountry: match.proposedCountry,
            tvgLogo: match.proposedLogo || ch.tvgLogo,
          };
        }
      }
      return ch;
    });

    onApplySync(updatedChannels);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Auto Sync tvg-id & tvg-country</h3>
              <p className="text-xs text-slate-400">
                Lengkapi dan sinkronkan ID EPG serta kode negara berdasarkan database resmi & nama grup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={options.onlyFillMissing}
                  onChange={() => handleOptionToggle('onlyFillMissing')}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span>Hanya lengkapi data yang kosong</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={options.detectFromGroup}
                  onChange={() => handleOptionToggle('detectFromGroup')}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span>Deteksi negara dari group-title</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={options.synthesizeMissingId}
                  onChange={() => handleOptionToggle('synthesizeMissingId')}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                />
                <span>Format otomatis (Nama.negara)</span>
              </label>
            </div>

            <button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              {showAdvancedOptions ? 'Sembunyikan Opsi' : 'Opsi Lanjutan'}
            </button>
          </div>

          {showAdvancedOptions && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-4 text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.autoFillLogo}
                  onChange={() => handleOptionToggle('autoFillLogo')}
                  className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Lengkapi juga tvg-logo resmi jika ada di katalog</span>
              </label>
            </div>
          )}
        </div>

        {/* Tab Filter & Search Row */}
        <div className="px-6 py-2.5 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('changes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'changes'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Perlu Sinkronisasi ({totalWithChanges})
            </button>
            <button
              onClick={() => setActiveTab('id')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'id'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Update tvg-id ({totalIdChanges})
            </button>
            <button
              onClick={() => setActiveTab('country')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'country'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Update tvg-country ({totalCountryChanges})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Semua Saluran ({syncCandidates.length})
            </button>
          </div>

          {/* Search filter in preview */}
          <div className="relative w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari saluran dalam tabel..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Table Header */}
        <div className="px-6 py-2 border-b border-slate-800/80 bg-slate-950/50 flex items-center text-[11px] font-medium text-slate-400 select-none">
          <div className="w-8 flex items-center justify-center">
            <button
              onClick={toggleSelectAllFiltered}
              className="text-slate-400 hover:text-white"
              title={allFilteredSelected ? 'Batalkan Semua Pilihan' : 'Pilih Semua'}
            >
              {allFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="w-56 px-2">SALURAN & GRUP</div>
          <div className="flex-1 px-3">tvg-id (SEBELUM → SESUDAH)</div>
          <div className="w-36 px-2">tvg-country</div>
          <div className="w-48 px-2 text-right">SUMBER DETEKSI</div>
        </div>

        {/* Candidates List Scroll Container */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
          {filteredCandidates.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Check className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-semibold text-white">Semua Saluran Sudah Tersinkronisasi</div>
              <p className="max-w-md mx-auto text-slate-400">
                Tidak ada saluran yang memerlukan sinkronisasi untuk kriteria filter ini. Seluruh tag tvg-id dan tvg-country sudah lengkap atau sesuai dengan aturan yang dipilih.
              </p>
            </div>
          ) : (
            filteredCandidates.map((candidate) => {
              const isSelected = selectedIds.has(candidate.channelId);
              const idChanged = candidate.proposedTvgId !== candidate.currentTvgId;
              const countryChanged = candidate.proposedCountry !== candidate.currentCountry;

              return (
                <div
                  key={candidate.channelId}
                  onClick={() => toggleSelectChannel(candidate.channelId)}
                  className={`flex items-center px-4 py-2.5 rounded-lg hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-950/20' : ''
                  }`}
                >
                  {/* Select Checkbox */}
                  <div className="w-8 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectChannel(candidate.channelId);
                      }}
                      className="text-slate-500 hover:text-white"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Channel Name & Group */}
                  <div className="w-56 px-2 min-w-0">
                    <div className="text-xs font-semibold text-white truncate" title={candidate.originalName}>
                      {candidate.originalName}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {candidate.groupTitle}
                    </div>
                  </div>

                  {/* tvg-id before -> after */}
                  <div className="flex-1 px-3 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`font-mono text-[11px] truncate max-w-[140px] ${
                          idChanged
                            ? 'text-slate-500 line-through'
                            : 'text-slate-300'
                        }`}
                        title={candidate.currentTvgId || '(Kosong)'}
                      >
                        {candidate.currentTvgId || '(Kosong)'}
                      </span>

                      {idChanged && (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span
                            className="font-mono text-[11px] font-semibold text-emerald-400 truncate max-w-[160px]"
                            title={candidate.proposedTvgId}
                          >
                            {candidate.proposedTvgId}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* tvg-country before -> after */}
                  <div className="w-36 px-2 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span
                        className={`font-mono uppercase text-[11px] ${
                          countryChanged
                            ? 'text-slate-500 line-through'
                            : 'text-slate-300'
                        }`}
                      >
                        {candidate.currentCountry || '-'}
                      </span>

                      {countryChanged && (
                        <>
                          <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="font-mono font-bold uppercase text-[11px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                            {candidate.proposedCountry}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Detection Reason */}
                  <div className="w-48 px-2 text-right min-w-0">
                    <span
                      title={candidate.reason}
                      className="text-[11px] text-slate-400 truncate block font-sans"
                    >
                      {candidate.reason}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span>
              <span className="font-mono font-semibold text-white tabular-nums">
                {selectedIds.size}
              </span>{' '}
              saluran dipilih untuk disinkronkan
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Terapkan Sinkronisasi ({selectedIds.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
