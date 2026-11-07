import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Channel } from './types/iptv';
import { SAMPLE_CHANNELS } from './utils/samplePlaylists';
import { parseM3U } from './utils/m3uParser';
import { Header } from './components/Header';
import { GroupSidebar } from './components/GroupSidebar';
import { ChannelList } from './components/ChannelList';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { FindReplaceModal } from './components/FindReplaceModal';
import { BatchRenameModal } from './components/BatchRenameModal';
import { OrganizeGroupsModal } from './components/OrganizeGroupsModal';
import { ChannelEditModal } from './components/ChannelEditModal';
import { ImportExportModal } from './components/ImportExportModal';
import { UrlPlaylistModal } from './components/UrlPlaylistModal';
import { RemoveDataModal } from './components/RemoveDataModal';
import { AutoSyncTvgModal } from './components/AutoSyncTvgModal';
import { calculateTvgSync } from './utils/tvgSync';

const STORAGE_KEY = 'iptv_studio_playlist_v1';
const STORAGE_ORDER_KEY = 'iptv_studio_order_v1';

export default function App() {
  const appFileInputRef = useRef<HTMLInputElement>(null);

  // Load initial playlist from localStorage or fallback to SAMPLE_CHANNELS
  const [channels, setChannels] = useState<Channel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return SAMPLE_CHANNELS;
  });

  // Extract unique group names preserving order
  const extractUniqueGroups = (channelList: Channel[]): string[] => {
    const set = new Set<string>();
    for (const c of channelList) {
      set.add(c.groupTitle ? c.groupTitle.trim() : 'Tanpa Grup');
    }
    return Array.from(set);
  };

  // Group order
  const [groupOrder, setGroupOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return extractUniqueGroups(SAMPLE_CHANNELS);
  });

  // Active selected group in sidebar
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');

  // History stack for Undo / Redo
  const [history, setHistory] = useState<{
    channels: Channel[];
    groupOrder: string[];
  }[]>([
    {
      channels: channels,
      groupOrder: groupOrder,
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sync group order whenever channels change (adding any new groups)
  useEffect(() => {
    const presentGroups = extractUniqueGroups(channels);
    setGroupOrder((prevOrder) => {
      // Keep existing ordered groups that still exist
      const remaining = prevOrder.filter((g) => presentGroups.includes(g));
      // Append any newly introduced groups
      for (const g of presentGroups) {
        if (!remaining.includes(g)) {
          remaining.push(g);
        }
      }
      return remaining;
    });
  }, [channels]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
      localStorage.setItem(STORAGE_ORDER_KEY, JSON.stringify(groupOrder));
    } catch {}
  }, [channels, groupOrder]);

  // Group Counts Map
  const groupCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const g of groupOrder) {
      map.set(g, 0);
    }
    for (const c of channels) {
      const g = c.groupTitle ? c.groupTitle.trim() : 'Tanpa Grup';
      map.set(g, (map.get(g) || 0) + 1);
    }
    return map;
  }, [channels, groupOrder]);

  // Record a change into undo/redo history
  const pushState = useCallback(
    (newChannels: Channel[], newOrder?: string[]) => {
      const order = newOrder || groupOrder;
      const sliced = history.slice(0, historyIndex + 1);
      const nextHistory = [...sliced, { channels: newChannels, groupOrder: order }];
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
      setChannels(newChannels);
      if (newOrder) setGroupOrder(newOrder);
    },
    [history, historyIndex, groupOrder]
  );

  // Undo / Redo Handlers
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (!canUndo) return;
    const target = history[historyIndex - 1];
    setHistoryIndex(historyIndex - 1);
    setChannels(target.channels);
    setGroupOrder(target.groupOrder);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const target = history[historyIndex + 1];
    setHistoryIndex(historyIndex + 1);
    setChannels(target.channels);
    setGroupOrder(target.groupOrder);
  };

  // Modals state
  const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [batchRenameTargetGroup, setBatchRenameTargetGroup] = useState<string | null>(null);
  const [isOrganizeOpen, setIsOrganizeOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isRemoveDataModalOpen, setIsRemoveDataModalOpen] = useState(false);
  const [isAutoSyncModalOpen, setIsAutoSyncModalOpen] = useState(false);
  const [importExportModal, setImportExportModal] = useState<{
    open: boolean;
    tab: 'import' | 'export';
  }>({ open: false, tab: 'import' });

  // Batch Auto Sync for selected channels
  const handleBatchAutoSync = (channelIds: string[]) => {
    const idSet = new Set(channelIds);
    const targetList = channels.filter((c) => idSet.has(c.id));
    const syncResults = calculateTvgSync(targetList);
    const resultMap = new Map(syncResults.map((r) => [r.channelId, r]));

    let changedCount = 0;
    const updated = channels.map((c) => {
      if (idSet.has(c.id)) {
        const res = resultMap.get(c.id);
        if (res && res.hasChange) {
          changedCount++;
          return {
            ...c,
            tvgId: res.proposedTvgId,
            tvgCountry: res.proposedCountry,
            tvgLogo: res.proposedLogo || c.tvgLogo,
          };
        }
      }
      return c;
    });

    if (changedCount > 0) {
      pushState(updated);
      alert(`Berhasil menyinkronkan tvg-id & tvg-country pada ${changedCount} saluran terpilih!`);
    } else {
      alert('Seluruh saluran yang dipilih sudah memiliki tvg-id dan tvg-country yang lengkap.');
    }
  };

  // Direct File Upload handler (triggered by input)
  const handleDirectFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseM3U(text);
        if (parsed.length > 0) {
          const unique = extractUniqueGroups(parsed);
          pushState(parsed, unique);
          setSelectedGroup('ALL');
        } else {
          alert('File tidak berisi format saluran M3U yang valid.');
        }
      } catch (err) {
        alert('Gagal membaca file M3U: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // REMOVE DATA IPTV (Clear All)
  const handleRemoveAllData = () => {
    pushState([], []);
    setSelectedGroup('ALL');
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_ORDER_KEY);
    } catch {}
  };

  // LOAD SAMPLE (Demo)
  const handleLoadSample = () => {
    const unique = extractUniqueGroups(SAMPLE_CHANNELS);
    pushState(SAMPLE_CHANNELS, unique);
    setSelectedGroup('ALL');
  };

  // 1. EDIT NAME GROUP-TITLE
  const handleRenameGroup = (oldName: string, newName: string) => {
    const updatedChannels = channels.map((c) => {
      const current = c.groupTitle || 'Tanpa Grup';
      if (current === oldName) {
        return { ...c, groupTitle: newName };
      }
      return c;
    });

    const updatedOrder = groupOrder.map((g) => (g === oldName ? newName : g));
    const dedupedOrder = Array.from(new Set(updatedOrder));

    if (selectedGroup === oldName) {
      setSelectedGroup(newName);
    }

    pushState(updatedChannels, dedupedOrder);
  };

  // 2. CARI & GANTI NAMA GROUP-TITLE (Mass Find & Replace)
  const handleBatchFindReplace = (
    findText: string,
    replaceText: string,
    matchCase: boolean,
    exactMatch: boolean
  ) => {
    const updatedChannels = channels.map((c) => {
      const g = c.groupTitle || 'Tanpa Grup';
      let isMatch = false;
      let newName = g;

      if (exactMatch) {
        if (matchCase ? g === findText : g.toLowerCase() === findText.toLowerCase()) {
          isMatch = true;
          newName = replaceText.trim() || 'Tanpa Grup';
        }
      } else {
        if (matchCase ? g.includes(findText) : g.toLowerCase().includes(findText.toLowerCase())) {
          isMatch = true;
          const regex = new RegExp(
            findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            matchCase ? 'g' : 'gi'
          );
          newName = g.replace(regex, replaceText).trim() || 'Tanpa Grup';
        }
      }

      return isMatch ? { ...c, groupTitle: newName } : c;
    });

    const unique = extractUniqueGroups(updatedChannels);
    pushState(updatedChannels, unique);
  };

  // 3. MENUSUN GROUP-TITLE (Reorder Groups)
  const handleSaveGroupOrder = (newOrder: string[]) => {
    const groupOrderMap = new Map<string, number>();
    newOrder.forEach((name, i) => groupOrderMap.set(name, i));

    const reorderedChannels = [...channels].sort((a, b) => {
      const gA = a.groupTitle || 'Tanpa Grup';
      const gB = b.groupTitle || 'Tanpa Grup';
      const indexA = groupOrderMap.has(gA) ? groupOrderMap.get(gA)! : 9999;
      const indexB = groupOrderMap.has(gB) ? groupOrderMap.get(gB)! : 9999;
      return indexA - indexB;
    });

    pushState(reorderedChannels, newOrder);
  };

  const handleMoveGroup = (groupName: string, direction: 'up' | 'down') => {
    const idx = groupOrder.indexOf(groupName);
    if (idx === -1) return;
    const newOrder = [...groupOrder];
    if (direction === 'up' && idx > 0) {
      newOrder[idx] = newOrder[idx - 1];
      newOrder[idx - 1] = groupName;
    } else if (direction === 'down' && idx < newOrder.length - 1) {
      newOrder[idx] = newOrder[idx + 1];
      newOrder[idx + 1] = groupName;
    }
    handleSaveGroupOrder(newOrder);
  };

  // 4. CREATE NEW GROUP
  const handleCreateGroup = (newGroupName: string) => {
    if (!newGroupName.trim() || groupOrder.includes(newGroupName.trim())) {
      setSelectedGroup(newGroupName.trim());
      return;
    }
    const name = newGroupName.trim();
    const newOrder = [...groupOrder, name];
    setGroupOrder(newOrder);
    setSelectedGroup(name);
  };

  // 5. DELETE GROUP
  const handleDeleteGroup = (groupName: string) => {
    const count = groupCounts.get(groupName) || 0;
    if (count > 0) {
      if (
        !window.confirm(
          `Grup "${groupName}" memiliki ${count} saluran. Apakah Anda ingin memindahkan saluran ke "Tanpa Grup"?`
        )
      ) {
        return;
      }
      const updatedChannels = channels.map((c) =>
        (c.groupTitle || 'Tanpa Grup') === groupName ? { ...c, groupTitle: 'Tanpa Grup' } : c
      );
      const newOrder = groupOrder.filter((g) => g !== groupName);
      if (!newOrder.includes('Tanpa Grup')) newOrder.push('Tanpa Grup');
      setSelectedGroup('ALL');
      pushState(updatedChannels, newOrder);
    } else {
      const newOrder = groupOrder.filter((g) => g !== groupName);
      if (selectedGroup === groupName) setSelectedGroup('ALL');
      setGroupOrder(newOrder);
    }
  };

  // 6. CHANNEL ACTIONS
  const handleDeleteChannel = (channelId: string) => {
    const updated = channels.filter((c) => c.id !== channelId);
    pushState(updated);
  };

  const handleDeleteMultipleChannels = (channelIds: string[]) => {
    const idsSet = new Set(channelIds);
    const updated = channels.filter((c) => !idsSet.has(c.id));
    pushState(updated);
  };

  const handleMoveChannelsToGroup = (channelIds: string[], targetGroup: string) => {
    const idsSet = new Set(channelIds);
    const updated = channels.map((c) =>
      idsSet.has(c.id) ? { ...c, groupTitle: targetGroup.trim() } : c
    );
    let newOrder = groupOrder;
    if (!groupOrder.includes(targetGroup.trim())) {
      newOrder = [...groupOrder, targetGroup.trim()];
    }
    pushState(updated, newOrder);
  };

  const handleReorderChannel = (channelId: string, direction: 'up' | 'down') => {
    const index = channels.findIndex((c) => c.id === channelId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= channels.length) return;

    const list = [...channels];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    pushState(list);
  };

  const handleSortChannelsInGroup = (group: string, asc = true) => {
    const targetChannels = channels.filter(
      (c) => (c.groupTitle || 'Tanpa Grup') === group
    );
    const otherChannels = channels.filter(
      (c) => (c.groupTitle || 'Tanpa Grup') !== group
    );

    targetChannels.sort((a, b) =>
      asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );

    const updated = [...otherChannels, ...targetChannels];
    pushState(updated);
  };

  // 7. REMOVE DUPLICATE STREAM URLS
  const handleRemoveDuplicates = () => {
    const seen = new Set<string>();
    const deduplicated: Channel[] = [];
    let removedCount = 0;

    for (const c of channels) {
      if (seen.has(c.url)) {
        removedCount++;
      } else {
        seen.add(c.url);
        deduplicated.push(c);
      }
    }

    if (removedCount > 0) {
      pushState(deduplicated);
      alert(`Berhasil menghapus ${removedCount} saluran duplikat!`);
    }
  };

  // 8. UPDATE CHANNEL
  const handleSaveChannel = (updated: Channel) => {
    const list = channels.map((c) => (c.id === updated.id ? updated : c));
    let newOrder = groupOrder;
    if (!groupOrder.includes(updated.groupTitle)) {
      newOrder = [...groupOrder, updated.groupTitle];
    }
    pushState(list, newOrder);
  };

  // 9. IMPORT PLAYLIST
  const handleImportPlaylist = (newChannels: Channel[], sourceName: string) => {
    const unique = extractUniqueGroups(newChannels);
    pushState(newChannels, unique);
    setSelectedGroup('ALL');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Hidden file input for Upload File .m3u */}
      <input
        ref={appFileInputRef}
        type="file"
        accept=".m3u,.m3u8,text/plain"
        onChange={handleDirectFileUpload}
        className="hidden"
      />

      {/* Top Header */}
      <Header
        channelCount={channels.length}
        groupCount={groupOrder.length}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onImportChannels={handleImportPlaylist}
        onOpenUrlModal={() => setIsUrlModalOpen(true)}
        onOpenRemoveDataModal={() => setIsRemoveDataModalOpen(true)}
        onOpenAutoSyncModal={() => setIsAutoSyncModalOpen(true)}
        onOpenFindReplace={() => setIsFindReplaceOpen(true)}
        onOpenOrganize={() => setIsOrganizeOpen(true)}
        onOpenExport={() => setImportExportModal({ open: true, tab: 'export' })}
      />

      {/* Main Two-Column IPTV Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Menusun, Cari & Edit Group-Title */}
        <GroupSidebar
          selectedGroup={selectedGroup}
          groupOrder={groupOrder}
          groupCounts={groupCounts}
          totalChannels={channels.length}
          onSelectGroup={setSelectedGroup}
          onRenameGroup={handleRenameGroup}
          onDeleteGroup={handleDeleteGroup}
          onCreateGroup={handleCreateGroup}
          onOpenOrganizeModal={() => setIsOrganizeOpen(true)}
          onMoveGroup={handleMoveGroup}
        />

        {/* Right Main Panel: Channel Management Grid */}
        <ChannelList
          channels={channels}
          selectedGroup={selectedGroup}
          uniqueGroups={groupOrder}
          onPlayChannel={setPlayingChannel}
          onEditChannel={setEditingChannel}
          onDeleteChannel={handleDeleteChannel}
          onDeleteMultipleChannels={handleDeleteMultipleChannels}
          onMoveChannelsToGroup={handleMoveChannelsToGroup}
          onReorderChannel={handleReorderChannel}
          onSortChannelsInGroup={handleSortChannelsInGroup}
          onOpenBatchRename={(group) => setBatchRenameTargetGroup(group)}
          onTriggerFileUpload={() => appFileInputRef.current?.click()}
          onOpenUrlModal={() => setIsUrlModalOpen(true)}
          onOpenRemoveDataModal={() => setIsRemoveDataModalOpen(true)}
          onOpenAutoSyncModal={() => setIsAutoSyncModalOpen(true)}
          onBatchAutoSync={handleBatchAutoSync}
          onRemoveDuplicates={handleRemoveDuplicates}
          onLoadSample={handleLoadSample}
        />
      </div>

      {/* MODALS */}

      {/* 1. Live Video Player Modal */}
      {playingChannel && (
        <VideoPlayerModal
          channel={playingChannel}
          allChannels={
            selectedGroup === 'ALL'
              ? channels
              : channels.filter((c) => (c.groupTitle || 'Tanpa Grup') === selectedGroup)
          }
          onClose={() => setPlayingChannel(null)}
          onSelectChannel={setPlayingChannel}
        />
      )}

      {/* 2. Mass Find & Replace Group-Title Modal */}
      {isFindReplaceOpen && (
        <FindReplaceModal
          channels={channels}
          uniqueGroups={groupOrder}
          onApply={handleBatchFindReplace}
          onClose={() => setIsFindReplaceOpen(false)}
        />
      )}

      {/* 3. Batch Rename / Merge Group Modal */}
      {batchRenameTargetGroup && (
        <BatchRenameModal
          currentGroup={batchRenameTargetGroup}
          uniqueGroups={groupOrder}
          channelCount={groupCounts.get(batchRenameTargetGroup) || 0}
          onRename={handleRenameGroup}
          onClose={() => setBatchRenameTargetGroup(null)}
        />
      )}

      {/* 4. Organize Group Order Modal */}
      {isOrganizeOpen && (
        <OrganizeGroupsModal
          groupOrder={groupOrder}
          groupCounts={groupCounts}
          onSaveOrder={handleSaveGroupOrder}
          onClose={() => setIsOrganizeOpen(false)}
        />
      )}

      {/* 5. Channel Edit Modal */}
      {editingChannel && (
        <ChannelEditModal
          channel={editingChannel}
          uniqueGroups={groupOrder}
          onSave={handleSaveChannel}
          onClose={() => setEditingChannel(null)}
        />
      )}

      {/* 6. URL Playlist M3U8 Modal */}
      {isUrlModalOpen && (
        <UrlPlaylistModal
          onImport={handleImportPlaylist}
          onClose={() => setIsUrlModalOpen(false)}
        />
      )}

      {/* 7. Remove Data IPTV Modal */}
      {isRemoveDataModalOpen && (
        <RemoveDataModal
          channelCount={channels.length}
          groupCount={groupOrder.length}
          onConfirm={handleRemoveAllData}
          onClose={() => setIsRemoveDataModalOpen(false)}
        />
      )}

      {/* 8. Export Modal */}
      {importExportModal.open && (
        <ImportExportModal
          channels={channels}
          initialTab={importExportModal.tab}
          onImport={handleImportPlaylist}
          onClose={() => setImportExportModal({ open: false, tab: 'export' })}
        />
      )}

      {/* 9. Auto Sync tvg-id & tvg-country Modal */}
      {isAutoSyncModalOpen && (
        <AutoSyncTvgModal
          channels={channels}
          onApplySync={(updated) => pushState(updated)}
          onClose={() => setIsAutoSyncModalOpen(false)}
        />
      )}
    </div>
  );
}
