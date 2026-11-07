import { X, Trash2, AlertTriangle } from 'lucide-react';

interface RemoveDataModalProps {
  channelCount: number;
  groupCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export function RemoveDataModal({
  channelCount,
  groupCount,
  onConfirm,
  onClose,
}: RemoveDataModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Remove Data IPTV</h3>
              <p className="text-xs text-slate-400">Kosongkan daftar saluran & playlist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus seluruh data IPTV saat ini?
          </p>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Saluran:</span>
              <span className="text-white font-mono font-semibold tabular-nums">
                {channelCount} saluran
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Group-Title:</span>
              <span className="text-white font-mono font-semibold tabular-nums">
                {groupCount} grup
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Setelah dikosongkan, Anda dapat mengunggah file <span className="text-slate-200 font-mono">.m3u</span> baru atau memasukkan URL playlist <span className="text-slate-200 font-mono">m3u8</span> dari awal.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-800 bg-slate-900/60">
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
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus Semua Data
          </button>
        </div>
      </div>
    </div>
  );
}
