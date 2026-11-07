import { useState } from 'react';
import { X, ArrowUp, ArrowDown, ArrowUpDown, ChevronsUp, ChevronsDown, RotateCcw, Check, ListOrdered } from 'lucide-react';

interface OrganizeGroupsModalProps {
  groupOrder: string[];
  groupCounts: Map<string, number>;
  onSaveOrder: (newOrder: string[]) => void;
  onClose: () => void;
}

export function OrganizeGroupsModal({
  groupOrder,
  groupCounts,
  onSaveOrder,
  onClose,
}: OrganizeGroupsModalProps) {
  const [currentOrder, setCurrentOrder] = useState<string[]>([...groupOrder]);

  const moveItem = (index: number, direction: 'up' | 'down' | 'top' | 'bottom') => {
    const list = [...currentOrder];
    const item = list[index];

    if (direction === 'up' && index > 0) {
      list[index] = list[index - 1];
      list[index - 1] = item;
    } else if (direction === 'down' && index < list.length - 1) {
      list[index] = list[index + 1];
      list[index + 1] = item;
    } else if (direction === 'top' && index > 0) {
      list.splice(index, 1);
      list.unshift(item);
    } else if (direction === 'bottom' && index < list.length - 1) {
      list.splice(index, 1);
      list.push(item);
    }

    setCurrentOrder(list);
  };

  const handleSortAlpha = (asc = true) => {
    const sorted = [...currentOrder].sort((a, b) =>
      asc ? a.localeCompare(b) : b.localeCompare(a)
    );
    setCurrentOrder(sorted);
  };

  const handleSortCount = (desc = true) => {
    const sorted = [...currentOrder].sort((a, b) => {
      const countA = groupCounts.get(a) || 0;
      const countB = groupCounts.get(b) || 0;
      return desc ? countB - countA : countA - countB;
    });
    setCurrentOrder(sorted);
  };

  const handleReset = () => {
    setCurrentOrder([...groupOrder]);
  };

  const handleSave = () => {
    onSaveOrder(currentOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Menyusun Urutan Group-Title</h3>
              <p className="text-xs text-slate-400">
                Atur prioritas dan susunan grup playlist ({currentOrder.length} grup)
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

        {/* Quick Sort Presets Bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/40 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Urut Cepat:</span>
          <button
            onClick={() => handleSortAlpha(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-blue-400" />
            Nama (A-Z)
          </button>
          <button
            onClick={() => handleSortAlpha(false)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-blue-400" />
            Nama (Z-A)
          </button>
          <button
            onClick={() => handleSortCount(true)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Saluran Terbanyak
          </button>
          <button
            onClick={handleReset}
            title="Kembalikan ke urutan awal"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-md transition-colors ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>

        {/* List of Groups with reorder buttons */}
        <div className="p-5 overflow-y-auto flex-1 space-y-1.5">
          {currentOrder.map((group, index) => {
            const count = groupCounts.get(group) || 0;
            const isFirst = index === 0;
            const isLast = index === currentOrder.length - 1;

            return (
              <div
                key={group}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs text-slate-400 w-6 text-right tabular-nums">
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">{group}</div>
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      {count} saluran
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => moveItem(index, 'top')}
                    disabled={isFirst}
                    title="Pindahkan ke Paling Atas"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ChevronsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={isFirst}
                    title="Naikkan 1 Posisi"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={isLast}
                    title="Turunkan 1 Posisi"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'bottom')}
                    disabled={isLast}
                    title="Pindahkan ke Paling Bawah"
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:hover:bg-transparent"
                  >
                    <ChevronsDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/90">
          <span className="text-xs text-slate-400">
            Perubahan susunan grup akan diterapkan pada hasil ekspor M3U.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Terapkan Urutan Grup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
