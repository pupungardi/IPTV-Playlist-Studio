import { useState, useMemo } from 'react';
import { X, Search, Replace, ArrowRight, Check } from 'lucide-react';
import { Channel } from '../types/iptv';

interface FindReplaceModalProps {
  channels: Channel[];
  uniqueGroups: string[];
  onApply: (findText: string, replaceText: string, matchCase: boolean, exactMatch: boolean) => void;
  onClose: () => void;
}

export function FindReplaceModal({
  channels,
  uniqueGroups,
  onApply,
  onClose,
}: FindReplaceModalProps) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [exactMatch, setExactMatch] = useState(false);

  // Calculate preview of changes
  const affectedGroups = useMemo(() => {
    if (!findText.trim()) return [];

    const results: {
      original: string;
      updated: string;
      channelCount: number;
    }[] = [];

    const groupCounts = new Map<string, number>();
    for (const ch of channels) {
      const g = ch.groupTitle || 'Tanpa Grup';
      groupCounts.set(g, (groupCounts.get(g) || 0) + 1);
    }

    for (const group of uniqueGroups) {
      let isMatch = false;
      let newName = group;

      if (exactMatch) {
        if (matchCase ? group === findText : group.toLowerCase() === findText.toLowerCase()) {
          isMatch = true;
          newName = replaceText;
        }
      } else {
        if (matchCase ? group.includes(findText) : group.toLowerCase().includes(findText.toLowerCase())) {
          isMatch = true;
          const regex = new RegExp(
            findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            matchCase ? 'g' : 'gi'
          );
          newName = group.replace(regex, replaceText);
        }
      }

      if (isMatch && newName !== group) {
        results.push({
          original: group,
          updated: newName.trim() || 'Tanpa Grup',
          channelCount: groupCounts.get(group) || 0,
        });
      }
    }

    return results;
  }, [findText, replaceText, matchCase, exactMatch, uniqueGroups, channels]);

  const totalAffectedChannels = affectedGroups.reduce((acc, curr) => acc + curr.channelCount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!findText.trim() || affectedGroups.length === 0) return;
    onApply(findText, replaceText, matchCase, exactMatch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Replace className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Cari & Ganti Nama Group-Title</h3>
              <p className="text-xs text-slate-400">Ganti teks atau rapikan penamaan grup secara massal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Teks yang Dicari dalam Group-Title</span>
              <span className="text-[11px] text-slate-500">Contoh: "SPORT", "ID:", "HD"</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Masukkan kata / prefiks grup..."
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Ganti Menjadi (Teks Baru)</span>
              <span className="text-[11px] text-slate-500">Kosongkan jika ingin menghapus teks tersebut</span>
            </label>
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Contoh: Olahraga, ID | Saluran Lokal, atau kosong..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-6 pt-1 text-xs text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span>Cocokkan Huruf Besar/Kecil (Case sensitive)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={exactMatch}
                onChange={(e) => setExactMatch(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <span>Hanya Cocok Sama Persis (Exact match)</span>
            </label>
          </div>

          {/* Real-time Preview Table */}
          <div className="border border-slate-800 bg-slate-950/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-300">
                Pratinjau Perubahan ({affectedGroups.length} grup, {totalAffectedChannels} saluran)
              </span>
              {affectedGroups.length > 0 && (
                <span className="text-emerald-400 font-mono text-[11px]">Siap diganti</span>
              )}
            </div>

            {affectedGroups.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-500">
                {findText.trim()
                  ? 'Tidak ada group-title yang cocok dengan kata pencarian.'
                  : 'Ketik kata pencarian di atas untuk melihat pratinjau grup yang akan diubah.'}
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {affectedGroups.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-slate-900/80 border border-slate-800/60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-red-400/90 line-through truncate max-w-[150px]">
                        {item.original}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="text-emerald-400 font-medium truncate max-w-[150px]">
                        {item.updated}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0 tabular-nums font-mono">
                      {item.channelCount} saluran
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={affectedGroups.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Terapkan pada {affectedGroups.length} Grup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
