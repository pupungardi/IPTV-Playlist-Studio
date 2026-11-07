import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Folder,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';

interface GroupSidebarProps {
  selectedGroup: string; // 'ALL' or specific group name
  groupOrder: string[];
  groupCounts: Map<string, number>;
  totalChannels: number;
  onSelectGroup: (group: string) => void;
  onRenameGroup: (oldName: string, newName: string) => void;
  onDeleteGroup: (groupName: string) => void;
  onCreateGroup: (newGroupName: string) => void;
  onOpenOrganizeModal: () => void;
  onMoveGroup: (groupName: string, direction: 'up' | 'down') => void;
}

export function GroupSidebar({
  selectedGroup,
  groupOrder,
  groupCounts,
  totalChannels,
  onSelectGroup,
  onRenameGroup,
  onDeleteGroup,
  onCreateGroup,
  onOpenOrganizeModal,
  onMoveGroup,
}: GroupSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [inlineEditName, setInlineEditName] = useState('');

  // Filtered groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupOrder;
    const q = searchQuery.toLowerCase();
    return groupOrder.filter((group) => group.toLowerCase().includes(q));
  }, [groupOrder, searchQuery]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onCreateGroup(newGroupName.trim());
    setNewGroupName('');
    setIsCreating(false);
  };

  const handleStartEdit = (group: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingGroup(group);
    setInlineEditName(group);
  };

  const handleSaveInlineEdit = (group: string, e: React.FormEvent) => {
    e.preventDefault();
    if (inlineEditName.trim() && inlineEditName.trim() !== group) {
      onRenameGroup(group, inlineEditName.trim());
    }
    setEditingGroup(null);
  };

  return (
    <aside className="w-80 flex-shrink-0 border-r border-slate-800 bg-slate-900/60 flex flex-col h-[calc(100vh-57px)]">
      {/* Search group-title input */}
      <div className="p-3.5 border-b border-slate-800/80 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama group-title..."
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Group toolbar */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] text-slate-400 tabular-nums">
            {filteredGroups.length} dari {groupOrder.length} grup
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenOrganizeModal}
              title="Susun Urutan Grup (Reorder)"
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <ArrowUpDown className="w-3 h-3 text-blue-400" />
              Susun
            </button>
            <button
              onClick={() => setIsCreating(true)}
              title="Buat Group-Title Baru"
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <Plus className="w-3 h-3 text-emerald-400" />
              + Grup
            </button>
          </div>
        </div>

        {/* Inline create group box */}
        {isCreating && (
          <form onSubmit={handleCreateSubmit} className="pt-2 flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nama grup baru..."
              className="flex-1 bg-slate-800 border border-blue-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newGroupName.trim()}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs rounded font-medium"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* Group Items Scroll List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* All Channels Option */}
        <button
          onClick={() => onSelectGroup('ALL')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left group ${
            selectedGroup === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Layers className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-white" />
            <span className="truncate">Semua Saluran (Playlist)</span>
          </div>
          <span
            className={`font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded ${
              selectedGroup === 'ALL' ? 'bg-blue-700 text-white' : 'text-slate-400'
            }`}
          >
            {totalChannels}
          </span>
        </button>

        <div className="my-1.5 border-t border-slate-800/80" />

        {/* Group list */}
        {filteredGroups.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            Tidak ada group-title yang cocok dengan kata pencarian "{searchQuery}".
          </div>
        ) : (
          filteredGroups.map((group, idx) => {
            const count = groupCounts.get(group) || 0;
            const isSelected = selectedGroup === group;
            const isEditing = editingGroup === group;
            const isFirst = idx === 0;
            const isLast = idx === filteredGroups.length - 1;

            if (isEditing) {
              return (
                <form
                  key={group}
                  onSubmit={(e) => handleSaveInlineEdit(group, e)}
                  className="p-1.5 bg-slate-800 border border-blue-500 rounded-lg flex items-center gap-1.5"
                >
                  <input
                    type="text"
                    autoFocus
                    value={inlineEditName}
                    onChange={(e) => setInlineEditName(e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none px-1"
                  />
                  <button
                    type="submit"
                    className="px-2 py-0.5 bg-blue-600 text-white text-[11px] rounded font-medium"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGroup(null)}
                    className="p-0.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              );
            }

            return (
              <div
                key={group}
                onClick={() => onSelectGroup(group)}
                className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Folder
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-white' : 'text-blue-400'
                    }`}
                  />
                  <span className="truncate" title={group}>
                    {group}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {/* Channel count */}
                  <span
                    className={`font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-blue-700 text-white' : 'text-slate-400'
                    }`}
                  >
                    {count}
                  </span>

                  {/* Actions visible on hover or selection */}
                  <div
                    className={`flex items-center gap-0.5 ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    } transition-opacity`}
                  >
                    <button
                      onClick={(e) => handleStartEdit(group, e)}
                      title="Edit Nama Group-Title Ini"
                      className="p-1 rounded hover:bg-black/20 text-slate-300 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isFirst) onMoveGroup(group, 'up');
                      }}
                      disabled={isFirst}
                      title="Naikkan Urutan Grup"
                      className="p-1 rounded hover:bg-black/20 text-slate-300 hover:text-white disabled:opacity-20"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isLast) onMoveGroup(group, 'down');
                      }}
                      disabled={isLast}
                      title="Turunkan Urutan Grup"
                      className="p-1 rounded hover:bg-black/20 text-slate-300 hover:text-white disabled:opacity-20"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {count === 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteGroup(group);
                        }}
                        title="Hapus Grup Kosong"
                        className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Susunan otomatis disimpan</span>
        <button
          onClick={onOpenOrganizeModal}
          className="text-blue-400 hover:text-blue-300 font-medium"
        >
          Urutkan Semua
        </button>
      </div>
    </aside>
  );
}
