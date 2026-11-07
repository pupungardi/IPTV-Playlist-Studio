import { useRef } from 'react';
import { Tv, Download, Upload, Replace, ListOrdered, Undo2, Redo2, Globe, Trash2, Sparkles } from 'lucide-react';
import { Channel } from '../types/iptv';
import { parseM3U } from '../utils/m3uParser';

interface HeaderProps {
  channelCount: number;
  groupCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onImportChannels: (channels: Channel[], sourceName: string) => void;
  onOpenUrlModal: () => void;
  onOpenRemoveDataModal: () => void;
  onOpenAutoSyncModal: () => void;
  onOpenFindReplace: () => void;
  onOpenOrganize: () => void;
  onOpenExport: () => void;
}

export function Header({
  channelCount,
  groupCount,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onImportChannels,
  onOpenUrlModal,
  onOpenRemoveDataModal,
  onOpenAutoSyncModal,
  onOpenFindReplace,
  onOpenOrganize,
  onOpenExport,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseM3U(text);
        if (parsed.length > 0) {
          onImportChannels(parsed, file.name);
        } else {
          alert('File tidak berisi format saluran M3U yang valid.');
        }
      } catch (err) {
        alert('Gagal membaca file M3U: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-selected if desired
    e.target.value = '';
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Hidden file input for direct Upload File .m3u */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".m3u,.m3u8,text/plain"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Zone 1: Brand title, single line text */}
      <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Tv className="w-4 h-4" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">
          IPTV Studio
        </span>
      </div>

      {/* Zone 2: Navigation Links / Direct Actions */}
      <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-300">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          Upload File .m3u
        </button>

        <button
          onClick={onOpenUrlModal}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          URL Playlist m3u8
        </button>

        <button
          onClick={onOpenAutoSyncModal}
          className="flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer bg-indigo-950/40 hover:bg-indigo-900/50 px-2.5 py-1 rounded-md border border-indigo-800/60"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Auto Sync tvg-id & tvg-country
        </button>

        <button
          onClick={onOpenOrganize}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
          Susun Grup
        </button>

        <button
          onClick={onOpenFindReplace}
          className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Replace className="w-3.5 h-3.5 text-amber-400" />
          Cari & Ganti
        </button>

        <span className="text-slate-700" aria-hidden="true">|</span>

        <button
          onClick={onOpenRemoveDataModal}
          className="flex items-center gap-1.5 hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer text-slate-400"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400" />
          Remove Data IPTV
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Batal perubahan terakhir (Undo)"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Ulangi perubahan (Redo)"
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-sm ml-1"
        >
          <Download className="w-3.5 h-3.5" />
          Ekspor M3U
        </button>
      </div>
    </header>
  );
}
