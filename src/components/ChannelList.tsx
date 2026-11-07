import { useState, useMemo, useRef } from 'react';
import {
  Search,
  Play,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  FolderInput,
  CheckSquare,
  Square,
  Upload,
  Globe,
  Tv,
  X,
  Sparkles,
} from 'lucide-react';
import { Channel } from '../types/iptv';

interface ChannelListProps {
  channels: Channel[];
  selectedGroup: string;
  uniqueGroups: string[];
  onPlayChannel: (channel: Channel) => void;
  onEditChannel: (channel: Channel) => void;
  onDeleteChannel: (channelId: string) => void;
  onDeleteMultipleChannels: (channelIds: string[]) => void;
  onMoveChannelsToGroup: (channelIds: string[], targetGroup: string) => void;
  onReorderChannel: (channelId: string, direction: 'up' | 'down') => void;
  onSortChannelsInGroup: (group: string, asc: boolean) => void;
  onOpenBatchRename: (group: string) => void;
  onTriggerFileUpload: () => void;
  onOpenUrlModal: () => void;
  onOpenRemoveDataModal: () => void;
  onOpenAutoSyncModal: () => void;
  onBatchAutoSync?: (channelIds: string[]) => void;
  onRemoveDuplicates: () => void;
  onLoadSample: () => void;
}

export function ChannelList({
  channels,
  selectedGroup,
  uniqueGroups,
  onPlayChannel,
  onEditChannel,
  onDeleteChannel,
  onDeleteMultipleChannels,
  onMoveChannelsToGroup,
  onReorderChannel,
  onSortChannelsInGroup,
  onOpenBatchRename,
  onTriggerFileUpload,
  onOpenUrlModal,
  onOpenRemoveDataModal,
  onOpenAutoSyncModal,
  onBatchAutoSync,
  onRemoveDuplicates,
  onLoadSample,
}: ChannelListProps) {
  const [channelSearch, setChannelSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetGroupForBatch, setTargetGroupForBatch] = useState('');

  // Filter channels belonging to current group
  const groupChannels = useMemo(() => {
    if (selectedGroup === 'ALL') return channels;
    return channels.filter((c) => (c.groupTitle || 'Tanpa Grup') === selectedGroup);
  }, [channels, selectedGroup]);

  // Filter channels based on channel search input
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return groupChannels;
    const q = channelSearch.toLowerCase();
    return groupChannels.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.tvgId && c.tvgId.toLowerCase().includes(q)) ||
        (c.groupTitle && c.groupTitle.toLowerCase().includes(q)) ||
        c.url.toLowerCase().includes(q)
    );
  }, [groupChannels, channelSearch]);

  // Multi-select handlers
  const allFilteredSelected =
    filteredChannels.length > 0 && filteredChannels.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(selectedIds);
      filteredChannels.forEach((c) => newSet.add(c.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelectChannel = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchMove = () => {
    if (selectedIds.size === 0 || !targetGroupForBatch.trim()) return;
    onMoveChannelsToGroup(Array.from(selectedIds), targetGroupForBatch.trim());
    setSelectedIds(new Set());
    setTargetGroupForBatch('');
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (
      window.confirm(
        `Yakin ingin menghapus ${selectedIds.size} saluran yang dipilih dari playlist?`
      )
    ) {
      onDeleteMultipleChannels(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  // Find duplicates count
  const duplicateUrlsCount = useMemo(() => {
    const urls = new Set<string>();
    let count = 0;
    for (const c of channels) {
      if (urls.has(c.url)) count++;
      else urls.add(c.url);
    }
    return count;
  }, [channels]);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-slate-950/40">
      {/* Group Header & Action Strip */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-base font-bold text-white truncate">
              {selectedGroup === 'ALL' ? 'Semua Saluran' : selectedGroup}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="tabular-nums font-mono">
                {groupChannels.length} saluran
              </span>
              {selectedGroup !== 'ALL' && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() => onOpenBatchRename(selectedGroup)}
                    className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                  >
                    Ganti Nama Group
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Action buttons requested: upload file.m3u, url playlist m3u8, remove data iptv */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedGroup !== 'ALL' && (
              <button
                onClick={() => onSortChannelsInGroup(selectedGroup, true)}
                title="Urutkan Saluran Dalam Grup A-Z"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
              >
                <ArrowUpDown className="w-3 h-3 text-blue-400" />
                Urut A-Z
              </button>
            )}

            {duplicateUrlsCount > 0 && (
              <button
                onClick={onRemoveDuplicates}
                title="Hapus Saluran dengan URL Duplikat"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Hapus {duplicateUrlsCount} Duplikat
              </button>
            )}

            {/* Direct Playlist Actions */}
            <button
              onClick={onTriggerFileUpload}
              title="Unggah file .m3u dari komputer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload File .m3u
            </button>

            <button
              onClick={onOpenUrlModal}
              title="Muat dari URL Playlist M3U8"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              URL Playlist m3u8
            </button>

            <button
              onClick={onOpenAutoSyncModal}
              title="Otomatis sinkronkan tvg-id & tvg-country saluran berdasarkan database dan nama grup"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:text-white bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/60 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Auto Sync tvg-id & tvg-country
            </button>

            <button
              onClick={onOpenRemoveDataModal}
              title="Hapus / kosongkan seluruh data playlist IPTV"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 bg-red-950/40 hover:bg-red-900/40 border border-red-800/60 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              Remove Data IPTV
            </button>
          </div>
        </div>

        {/* Search input for channels */}
        <div className="relative">
          <input
            type="text"
            value={channelSearch}
            onChange={(e) => setChannelSearch(e.target.value)}
            placeholder={`Cari nama saluran, tvg-id, atau link stream dalam ${
              selectedGroup === 'ALL' ? 'seluruh playlist' : selectedGroup
            }...`}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          {channelSearch && (
            <button
              onClick={() => setChannelSearch('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Batch Selection Action Bar (when channels are selected) */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-950/70 border-b border-blue-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">
              {selectedIds.size} saluran dipilih
            </span>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-xs text-blue-300 hover:text-white underline cursor-pointer"
            >
              Batalkan Pilihan
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-300">Pindahkan ke:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                list="batch-groups"
                value={targetGroupForBatch}
                onChange={(e) => setTargetGroupForBatch(e.target.value)}
                placeholder="Pilih atau ketik grup baru..."
                className="bg-slate-900 border border-blue-500/80 rounded px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none w-48"
              />
              <datalist id="batch-groups">
                {uniqueGroups.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>

              <button
                onClick={handleBatchMove}
                disabled={!targetGroupForBatch.trim()}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded font-medium transition-colors"
              >
                <FolderInput className="w-3.5 h-3.5" />
                Pindahkan
              </button>
            </div>

            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1 px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded font-medium transition-colors ml-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus ({selectedIds.size})
            </button>

            {onBatchAutoSync && (
              <button
                onClick={() => onBatchAutoSync(Array.from(selectedIds))}
                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium transition-colors ml-1"
                title="Sinkronkan tvg-id & tvg-country untuk saluran yang dipilih"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                Auto Sync ({selectedIds.size})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Header Strip */}
      <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/20 flex items-center text-[11px] font-medium text-slate-400 select-none">
        <div className="w-7 flex items-center justify-center">
          <button
            onClick={toggleSelectAll}
            className="text-slate-400 hover:text-white"
            title={allFilteredSelected ? 'Batalkan Semua' : 'Pilih Semua'}
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="w-10 text-center font-mono">#</div>
        <div className="w-10 text-center">LOGO</div>
        <div className="flex-1 px-3">NAMA SALURAN & METADATA</div>
        {selectedGroup === 'ALL' && <div className="w-40 px-2">GROUP-TITLE</div>}
        <div className="w-36 text-right pr-2">AKSI</div>
      </div>

      {/* Channel Rows Scroll Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {filteredChannels.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-400 mx-auto flex items-center justify-center border border-slate-700/60">
              <Tv className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-white mb-1">
                {channels.length === 0
                  ? 'Data IPTV Kosong'
                  : channelSearch
                  ? 'Tidak ada saluran yang cocok'
                  : 'Grup ini belum memiliki saluran'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                {channels.length === 0
                  ? 'Silakan unggah file playlist .m3u dari komputer atau muat menggunakan URL playlist m3u8.'
                  : channelSearch
                  ? `Tidak ada hasil pencarian untuk "${channelSearch}". Coba kata kunci lain.`
                  : 'Grup ini belum memiliki saluran. Silakan unggah file baru atau pilih grup lain.'}
              </p>
            </div>

            {/* Quick Actions in Empty State */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onTriggerFileUpload}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Upload File .m3u
              </button>

              <button
                onClick={onOpenUrlModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
              >
                <Globe className="w-4 h-4 text-indigo-400" />
                URL Playlist m3u8
              </button>

              {channels.length === 0 && (
                <button
                  onClick={onLoadSample}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Muat Contoh Saluran (Demo)
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredChannels.map((channel, index) => {
            const isSelected = selectedIds.has(channel.id);
            const isFirst = index === 0;
            const isLast = index === filteredChannels.length - 1;

            return (
              <div
                key={channel.id}
                className={`flex items-center px-4 py-2 hover:bg-slate-800/40 transition-colors group ${
                  isSelected ? 'bg-blue-950/30' : ''
                }`}
              >
                {/* Select Checkbox */}
                <div className="w-7 flex items-center justify-center">
                  <button
                    onClick={() => toggleSelectChannel(channel.id)}
                    className="text-slate-500 hover:text-white"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Index number */}
                <div className="w-10 text-center font-mono text-xs text-slate-400 tabular-nums">
                  {index + 1}
                </div>

                {/* Channel Logo with resilient fallback */}
                <div className="w-10 flex items-center justify-center">
                  {channel.tvgLogo ? (
                    <img
                      src={channel.tvgLogo}
                      alt={channel.name}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 object-contain rounded bg-slate-900 border border-slate-700/60 p-0.5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).nextElementSibling;
                        if (fallback) (fallback as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    style={{ display: channel.tvgLogo ? 'none' : 'flex' }}
                    className="w-7 h-7 rounded bg-slate-800 border border-slate-700/50 text-slate-400 text-[10px] font-bold items-center justify-center"
                  >
                    TV
                  </div>
                </div>

                {/* Channel Name & Details */}
                <div className="flex-1 px-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white truncate max-w-md">
                      {channel.name}
                    </span>
                    {channel.tvgCountry && (
                      <span className="text-[10px] text-slate-400 font-mono uppercase bg-slate-800 px-1 rounded">
                        {channel.tvgCountry}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 truncate">
                    {channel.tvgId && (
                      <>
                        <span className="font-mono text-[11px] text-slate-400">
                          ID: {channel.tvgId}
                        </span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span className="font-mono text-[11px] text-slate-500 truncate max-w-sm">
                      {channel.url}
                    </span>
                  </div>
                </div>

                {/* Group Title column in ALL view */}
                {selectedGroup === 'ALL' && (
                  <div className="w-40 px-2 min-w-0">
                    <span
                      title={channel.groupTitle}
                      className="text-xs text-blue-400/90 font-medium truncate block max-w-full"
                    >
                      {channel.groupTitle || 'Tanpa Grup'}
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="w-36 flex items-center justify-end gap-1 shrink-0">
                  <button
                    onClick={() => onPlayChannel(channel)}
                    title="Putar Live Preview"
                    className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditChannel(channel)}
                    title="Edit Saluran & Group-Title"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => !isFirst && onReorderChannel(channel.id, 'up')}
                    disabled={isFirst}
                    title="Naikkan Urutan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => !isLast && onReorderChannel(channel.id, 'down')}
                    disabled={isLast}
                    title="Turunkan Urutan"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteChannel(channel.id)}
                    title="Hapus Saluran"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan <span className="font-mono text-slate-200 tabular-nums">{filteredChannels.length}</span> dari <span className="font-mono text-slate-200 tabular-nums">{groupChannels.length}</span> saluran
          </span>
          {channelSearch && (
            <>
              <span aria-hidden="true">·</span>
              <button
                onClick={() => setChannelSearch('')}
                className="text-blue-400 hover:underline"
              >
                Reset pencarian saluran
              </button>
            </>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          Tip: Gunakan tombol 'Cari & Ganti' di menu atas untuk mengganti nama grup secara massal
        </div>
      </div>
    </div>
  );
}
