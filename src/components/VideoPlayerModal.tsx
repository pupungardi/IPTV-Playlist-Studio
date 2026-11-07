import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Play, AlertCircle, ExternalLink, Volume2, VolumeX, Maximize, SkipForward, SkipBack } from 'lucide-react';
import { Channel } from '../types/iptv';

interface VideoPlayerModalProps {
  channel: Channel | null;
  allChannels: Channel[];
  onClose: () => void;
  onSelectChannel: (channel: Channel) => void;
}

export function VideoPlayerModal({
  channel,
  allChannels,
  onClose,
  onSelectChannel,
}: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  if (!channel) return null;

  const currentIndex = allChannels.findIndex((c) => c.id === channel.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allChannels.length - 1;

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;
    if (!video || !channel.url) return;

    setErrorMsg(null);
    setIsBuffering(true);
    setIsPlaying(false);

    const isHlsStream = channel.url.includes('.m3u8') || channel.url.includes('hls') || channel.url.includes('playlist');

    if (isHlsStream && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(channel.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg('Koneksi jaringan atau CORS dibatasi oleh server stream penyedia.');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setErrorMsg('Format media tidak dapat didekodekan di browser ini.');
              hls?.recoverMediaError();
              break;
            default:
              setErrorMsg('Tidak dapat memuat stream saluran ini.');
              hls?.destroy();
              break;
          }
          setIsBuffering(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = channel.url;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setErrorMsg('Gagal memutar stream pada pemutar native browser.');
        setIsBuffering(false);
      });
    } else {
      // Direct mp4 or regular video fallback
      video.src = channel.url;
      video.addEventListener('canplay', () => {
        setIsBuffering(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setErrorMsg('Format stream atau pembatasan CORS mencegah pemutaran di peramban.');
        setIsBuffering(false);
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [channel.id, channel.url]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const handlePrev = () => {
    if (hasPrev) {
      onSelectChannel(allChannels[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onSelectChannel(allChannels[currentIndex + 1]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            {channel.tvgLogo ? (
              <img
                src={channel.tvgLogo}
                alt={channel.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded bg-slate-800 object-contain p-0.5 border border-slate-700/60 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                TV
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{channel.name}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-blue-400">{channel.groupTitle || 'Tanpa Grup'}</span>
                {channel.tvgCountry && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{channel.tvgCountry}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono text-[11px] text-slate-500">
                  {currentIndex + 1} / {allChannels.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              title="Saluran Sebelumnya"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              title="Saluran Berikutnya"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            playsInline
            controls={false}
          />

          {isBuffering && !errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-2 pointer-events-none">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-300">Menghubungkan stream HLS...</span>
            </div>
          )}

          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-center p-6 gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="max-w-md">
                <h4 className="text-sm font-semibold text-white mb-1">Stream Tidak Dapat Diputar di Browser</h4>
                <p className="text-xs text-slate-400 mb-3">{errorMsg}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                  Banyak penyedia IPTV membatasi pemutaran di web browser (CORS policy) atau memerlukan player aplikasi native seperti VLC, TiviMate, OTT Navigator, atau Kodi.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <a
                    href={channel.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Buka URL Langsung
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(channel.url);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    Salin URL Stream
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick playback control overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto bg-slate-950/70 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 opacity-90 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const video = videoRef.current;
                  if (!video) return;
                  if (video.paused) {
                    video.play().then(() => setIsPlaying(true));
                  } else {
                    video.pause();
                    setIsPlaying(false);
                  }
                }}
                className="p-1 rounded text-white hover:text-blue-400 transition-colors"
              >
                <Play className={`w-4 h-4 ${isPlaying ? 'fill-white' : ''}`} />
              </button>
              <button
                onClick={toggleMute}
                className="p-1 rounded text-white hover:text-blue-400 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <span className="text-[11px] text-slate-300 font-mono tabular-nums">
                LIVE
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 truncate max-w-xs font-mono">
                {channel.url}
              </span>
              <button
                onClick={toggleFullScreen}
                title="Layar Penuh"
                className="p-1 rounded text-slate-300 hover:text-white transition-colors"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Info */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span>tvg-id: <span className="font-mono text-slate-300">{channel.tvgId || '-'}</span></span>
            <span aria-hidden="true">·</span>
            <span>Grup: <span className="text-slate-300">{channel.groupTitle}</span></span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(channel.url);
            }}
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-xs"
          >
            Salin Link Stream
          </button>
        </div>
      </div>
    </div>
  );
}
