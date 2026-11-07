import { useState } from 'react';
import { X, Globe, Link, AlertCircle, Check, Loader2 } from 'lucide-react';
import { Channel } from '../types/iptv';
import { parseM3U } from '../utils/m3uParser';

interface UrlPlaylistModalProps {
  onImport: (channels: Channel[], sourceName: string) => void;
  onClose: () => void;
}

export function UrlPlaylistModal({ onImport, onClose }: UrlPlaylistModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();
    if (!cleanUrl) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      let text = '';
      try {
        const res = await fetch(cleanUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
      } catch {
        // Fallback using CORS proxy
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`;
        const proxyRes = await fetch(proxyUrl);
        if (!proxyRes.ok) throw new Error('Gagal mengakses URL atau server memblokir akses web.');
        text = await proxyRes.text();
      }

      const parsed = parseM3U(text);
      if (parsed.length === 0) {
        setErrorMessage('URL berhasil diakses, namun tidak ditemukan format saluran M3U/M3U8 yang valid.');
        setIsLoading(false);
        return;
      }

      const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'URL Playlist';
      onImport(parsed, filename);
      onClose();
    } catch (err) {
      setErrorMessage(
        'Gagal memuat URL: ' +
          (err as Error).message +
          '. Pastikan link playlist dapat diakses secara publik.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Muat URL Playlist M3U8</h3>
              <p className="text-xs text-slate-400">Masukkan link online playlist IPTV (.m3u / .m3u8)</p>
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
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-400" />
              URL Playlist M3U / M3U8
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/playlist.m3u8"
              required
              autoFocus
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800 leading-relaxed">
            Sistem akan otomatis mengekstrak seluruh saluran, nama stasiun, dan tag <span className="text-blue-400 font-mono">group-title</span>. Jika server membatasi koneksi browser, proxy CORS otomatis digunakan.
          </div>

          {/* Quick preset URLs for testing */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Contoh Link Publik untuk Uji Coba:</span>
            <div className="flex flex-col gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setUrl('https://iptv-org.github.io/iptv/countries/id.m3u')}
                className="text-left text-blue-400 hover:text-blue-300 font-mono truncate hover:underline"
              >
                IPTV-ORG: Saluran Indonesia (id.m3u)
              </button>
              <button
                type="button"
                onClick={() => setUrl('https://iptv-org.github.io/iptv/categories/news.m3u')}
                className="text-left text-blue-400 hover:text-blue-300 font-mono truncate hover:underline"
              >
                IPTV-ORG: Kategori Berita Dunia (news.m3u)
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!url.trim() || isLoading}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mengunduh Playlist...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Muat Playlist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
