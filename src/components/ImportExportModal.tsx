import { useState, useRef } from 'react';
import { X, Upload, Download, FileText, Globe, Check, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { Channel } from '../types/iptv';
import { parseM3U, exportM3U } from '../utils/m3uParser';
import { SAMPLE_CHANNELS } from '../utils/samplePlaylists';

interface ImportExportModalProps {
  channels: Channel[];
  initialTab?: 'import' | 'export';
  onImport: (channels: Channel[], sourceName: string) => void;
  onClose: () => void;
}

export function ImportExportModal({
  channels,
  initialTab = 'import',
  onImport,
  onClose,
}: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'url' | 'samples' | 'export'>(
    initialTab === 'export' ? 'export' : 'upload'
  );
  const [pasteText, setPasteText] = useState('');
  const [m3uUrl, setM3uUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = parseM3U(content);
        if (parsed.length === 0) {
          setErrorMessage('File tidak memiliki saluran M3U yang valid atau format rusak.');
          return;
        }
        onImport(parsed, file.name);
        onClose();
      } catch (err) {
        setErrorMessage('Gagal memproses file M3U: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  // Raw Text Handler
  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!pasteText.trim()) return;

    try {
      const parsed = parseM3U(pasteText);
      if (parsed.length === 0) {
        setErrorMessage('Teks M3U tidak berisi entri saluran yang valid (#EXTINF).');
        return;
      }
      onImport(parsed, 'Daftar Teks M3U');
      onClose();
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat memproses playlist: ' + (err as Error).message);
    }
  };

  // URL Fetch Handler
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uUrl.trim()) return;

    setErrorMessage(null);
    setIsLoadingUrl(true);

    try {
      // First try direct fetch
      let text = '';
      try {
        const response = await fetch(m3uUrl.trim());
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        text = await response.text();
      } catch (directErr) {
        // Try via CORS proxy fallback
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(m3uUrl.trim())}`;
        const proxyRes = await fetch(proxyUrl);
        if (!proxyRes.ok) throw new Error('Gagal mengambil playlist dari URL atau diblokir CORS.');
        text = await proxyRes.text();
      }

      const parsed = parseM3U(text);
      if (parsed.length === 0) {
        setErrorMessage('URL berhasil diakses, namun tidak ditemukan entri saluran M3U yang valid.');
        setIsLoadingUrl(false);
        return;
      }

      onImport(parsed, m3uUrl.split('/').pop() || 'URL Playlist');
      onClose();
    } catch (err) {
      setErrorMessage(
        'Gagal mengunduh M3U dari link: ' +
          (err as Error).message +
          '. Anda dapat menyalin isi file dan menempelkannya di tab "Tempel Teks M3U".'
      );
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Load Built-in Demo
  const handleLoadSample = () => {
    onImport(SAMPLE_CHANNELS, 'Contoh Playlist Saluran ID & Global');
    onClose();
  };

  // Export Download
  const handleDownloadM3U = () => {
    const content = exportM3U(channels);
    const blob = new Blob([content], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iptv_playlist_organized_${Date.now()}.m3u8`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export Copy
  const handleCopyM3U = () => {
    const content = exportM3U(channels);
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              {activeTab === 'export' ? <Download className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {activeTab === 'export' ? 'Ekspor Playlist M3U / M3U8' : 'Impor & Kelola Playlist'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeTab === 'export'
                  ? 'Unduh playlist yang sudah dirapikan untuk VLC / TiviMate'
                  : 'Buka playlist M3U dari file, tautan web, atau contoh bawaan'}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-800 bg-slate-950/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Unggah File .M3U
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'paste'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Tempel Teks M3U
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'url'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Dari URL Web
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'samples'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Contoh Bawaan
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ml-auto ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            Ekspor Hasil
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".m3u,.m3u8,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-800/20 hover:bg-slate-800/40"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/10 text-blue-400 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Pilih file .m3u atau .m3u8 dari komputer
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Klik di sini untuk menjelajah file playlist Anda. Format standar `#EXTINF` dan tag `group-title` akan diekstrak otomatis.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <form onSubmit={handlePasteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Tempel Isi Playlist M3U / M3U8
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={8}
                  placeholder="#EXTM3U&#10;#EXTINF:-1 group-title=&quot;ID: Nasional&quot; tvg-logo=&quot;...&quot;,TVRI&#10;https://.../stream.m3u8"
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  disabled={!pasteText.trim()}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-colors"
                >
                  Proses & Muat Playlist
                </button>
              </div>
            </form>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  URL Playlist IPTV (.m3u / .m3u8)
                </label>
                <input
                  type="url"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/.../playlist.m3u"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Aplikasi akan mengunduh daftar saluran secara langsung. Jika dibatasi oleh perlindungan CORS server asal, fallback proxy otomatis diaktifkan.
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="submit"
                  disabled={!m3uUrl.trim() || isLoadingUrl}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-colors"
                >
                  {isLoadingUrl ? 'Mengunduh...' : 'Muat dari URL'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Playlist Demonstrasi (Indonesia & Global)
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  Memuat 20+ saluran legal (TVRI, Kompas TV, BeritaSatu, NASA TV, DW, Red Bull TV, Rakuten Cinema) dengan berbagai kategori group-title yang siap Anda susun, cari, dan ganti namanya!
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-4 py-2 text-xs font-medium text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors font-semibold"
              >
                Muat Contoh Playlist Sekarang
              </button>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Daftar Siap Diekspor</h4>
                  <p className="text-xs text-slate-400">
                    {channels.length} saluran terorganisir dengan tag `group-title` terbaru.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyM3U}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin!' : 'Salin M3U'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadM3U}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh File .m3u8
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-medium">Pratinjau Kode M3U:</span>
                <pre className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre">
                  {exportM3U(channels.slice(0, 5))}
                  {channels.length > 5 ? `\n... (+ ${channels.length - 5} saluran lainnya)` : ''}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
