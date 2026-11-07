import { useState } from 'react';
import { X, Tv, Link, Folder, Check, Sparkles } from 'lucide-react';
import { Channel } from '../types/iptv';
import { calculateTvgSync } from '../utils/tvgSync';

interface ChannelEditModalProps {
  channel: Channel;
  uniqueGroups: string[];
  onSave: (updated: Channel) => void;
  onClose: () => void;
}

export function ChannelEditModal({
  channel,
  uniqueGroups,
  onSave,
  onClose,
}: ChannelEditModalProps) {
  const [name, setName] = useState(channel.name);
  const [groupTitle, setGroupTitle] = useState(channel.groupTitle || 'Tanpa Grup');
  const [url, setUrl] = useState(channel.url);
  const [tvgId, setTvgId] = useState(channel.tvgId || '');
  const [tvgLogo, setTvgLogo] = useState(channel.tvgLogo || '');
  const [tvgCountry, setTvgCountry] = useState(channel.tvgCountry || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    onSave({
      ...channel,
      name: name.trim(),
      groupTitle: groupTitle.trim() || 'Tanpa Grup',
      url: url.trim(),
      tvgId: tvgId.trim(),
      tvgLogo: tvgLogo.trim(),
      tvgCountry: tvgCountry.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Edit Saluran</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{channel.name}</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Nama Saluran (Channel Name)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Contoh: HBO HD, Kompas TV, beIN Sports 1"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-blue-400" />
                Group-Title (Nama Grup)
              </span>
              <span className="text-[11px] text-slate-400">Pilih dari daftar atau ketik baru</span>
            </label>
            <input
              type="text"
              list="existing-groups"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              required
              placeholder="Contoh: ID: Nasional, SPORT: Football"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
            <datalist id="existing-groups">
              {uniqueGroups.map((g) => (
                <option key={g} value={g} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-blue-400" />
              Stream URL (.m3u8, .ts, direct stream)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://.../stream.m3u8"
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-slate-300">Data EPG & Identitas Saluran</span>
            <button
              type="button"
              onClick={() => {
                const dummy: Channel = {
                  ...channel,
                  name,
                  groupTitle,
                  tvgId,
                  tvgCountry,
                  tvgLogo,
                };
                const [result] = calculateTvgSync([dummy], {
                  onlyFillMissing: false,
                  detectFromGroup: true,
                  synthesizeMissingId: true,
                  autoFillLogo: true,
                });
                if (result) {
                  if (result.proposedTvgId) setTvgId(result.proposedTvgId);
                  if (result.proposedCountry) setTvgCountry(result.proposedCountry);
                  if (result.proposedLogo && !tvgLogo) setTvgLogo(result.proposedLogo);
                }
              }}
              className="flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-0.5 rounded transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Auto-Detect tvg-id & Negara
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">tvg-id (EPG ID)</label>
              <input
                type="text"
                value={tvgId}
                onChange={(e) => setTvgId(e.target.value)}
                placeholder="Contoh: HBO.us"
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">tvg-country</label>
              <input
                type="text"
                value={tvgCountry}
                onChange={(e) => setTvgCountry(e.target.value)}
                placeholder="ID, US, GB, etc."
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">tvg-logo (URL Logo Saluran)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tvgLogo}
                onChange={(e) => setTvgLogo(e.target.value)}
                placeholder="https://.../logo.png"
                className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              {tvgLogo && (
                <img
                  src={tvgLogo}
                  alt="Preview"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 object-contain bg-slate-800 rounded p-0.5 border border-slate-700 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
