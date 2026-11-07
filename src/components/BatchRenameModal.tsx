import { useState } from 'react';
import { X, Edit3, Merge, Sparkles, Check } from 'lucide-react';

interface BatchRenameModalProps {
  currentGroup: string;
  uniqueGroups: string[];
  channelCount: number;
  onRename: (oldName: string, newName: string) => void;
  onClose: () => void;
}

export function BatchRenameModal({
  currentGroup,
  uniqueGroups,
  channelCount,
  onRename,
  onClose,
}: BatchRenameModalProps) {
  const [newName, setNewName] = useState(currentGroup);
  const [selectedMergeTarget, setSelectedMergeTarget] = useState('');
  const [activeTab, setActiveTab] = useState<'rename' | 'merge' | 'tools'>('rename');

  const otherGroups = uniqueGroups.filter((g) => g !== currentGroup);

  const handleApplyRename = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed || trimmed === currentGroup) {
      onClose();
      return;
    }
    onRename(currentGroup, trimmed);
    onClose();
  };

  const handleApplyMerge = () => {
    if (!selectedMergeTarget || selectedMergeTarget === currentGroup) return;
    onRename(currentGroup, selectedMergeTarget);
    onClose();
  };

  const handleQuickCase = (type: 'upper' | 'lower' | 'title') => {
    if (type === 'upper') {
      setNewName(newName.toUpperCase());
    } else if (type === 'lower') {
      setNewName(newName.toLowerCase());
    } else {
      setNewName(
        newName
          .toLowerCase()
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      );
    }
  };

  const handleCleanPrefix = () => {
    // Strips prefixes like "01 - ", "01. ", "[ID] ", "ID: "
    const cleaned = newName.replace(/^([0-9]+[\.\-\s]+|\[[^\]]+\]\s*|[A-Z]{2,3}[:\|\-]\s*)/i, '');
    setNewName(cleaned.trim() || newName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Edit Nama Group-Title</h3>
              <p className="text-xs text-slate-400">
                Grup: <span className="text-slate-200 font-medium">"{currentGroup}"</span> ({channelCount} saluran)
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

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800/80 bg-slate-950/30">
          <button
            onClick={() => setActiveTab('rename')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'rename'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Ganti Nama
          </button>
          <button
            onClick={() => setActiveTab('merge')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'merge'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Gabungkan Grup (Merge)
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'tools'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Format & Rapikan
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === 'rename' && (
            <form onSubmit={handleApplyRename} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Nama Baru Group-Title
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="Masukkan nama grup baru..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                Semua {channelCount} saluran yang terdaftar di grup ini akan otomatis dialihkan ke nama baru.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || newName.trim() === currentGroup}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>
            </form>
          )}

          {activeTab === 'merge' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Gabungkan saluran dari "{currentGroup}" ke dalam grup:
                </label>
                <select
                  value={selectedMergeTarget}
                  onChange={(e) => setSelectedMergeTarget(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">-- Pilih Grup Tujuan --</option>
                  {otherGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800 flex items-start gap-2">
                <Merge className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Grup "{currentGroup}" akan dilebur dan seluruh {channelCount} salurannya akan bergabung ke dalam grup tujuan yang dipilih.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyMerge}
                  disabled={!selectedMergeTarget}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <Merge className="w-3.5 h-3.5" />
                  Gabungkan Sekarang
                </button>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Hasil Modifikasi Nama</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Alat Bantu Format Cepat:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickCase('title')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Format Title Case
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCase('upper')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
                  >
                    HURUF BESAR (UPPER)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCase('lower')}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
                  >
                    huruf kecil (lower)
                  </button>
                  <button
                    type="button"
                    onClick={handleCleanPrefix}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
                  >
                    Hapus Prefiks / Angka
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newName.trim() && newName.trim() !== currentGroup) {
                      onRename(currentGroup, newName.trim());
                    }
                    onClose();
                  }}
                  disabled={!newName.trim() || newName.trim() === currentGroup}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Terapkan Hasil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
