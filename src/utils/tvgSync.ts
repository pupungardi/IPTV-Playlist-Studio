import { Channel } from '../types/iptv';

// ISO 3166-1 alpha-2 mapping from country names and keywords
export const COUNTRY_KEYWORD_MAP: Record<string, string> = {
  // Indonesia
  'indonesia': 'ID',
  'indonesian': 'ID',
  'indo': 'ID',
  'ina': 'ID',
  'id': 'ID',
  'jakarta': 'ID',

  // United States
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'america': 'US',

  // United Kingdom
  'united kingdom': 'GB',
  'uk': 'GB',
  'britain': 'GB',
  'great britain': 'GB',
  'gb': 'GB',
  'england': 'GB',

  // Malaysia & Singapore
  'malaysia': 'MY',
  'my': 'MY',
  'singapore': 'SG',
  'sg': 'SG',

  // Other Asian countries
  'japan': 'JP',
  'japanese': 'JP',
  'jp': 'JP',
  'korea': 'KR',
  'korean': 'KR',
  'kr': 'KR',
  'south korea': 'KR',
  'philippines': 'PH',
  'ph': 'PH',
  'thailand': 'TH',
  'th': 'TH',
  'vietnam': 'VN',
  'vn': 'VN',
  'india': 'IN',
  'indian': 'IN',
  'in': 'IN',
  'china': 'CN',
  'chinese': 'CN',
  'cn': 'CN',
  'hong kong': 'HK',
  'hk': 'HK',
  'taiwan': 'TW',
  'tw': 'TW',

  // Middle East
  'qatar': 'QA',
  'qa': 'QA',
  'saudi': 'SA',
  'saudi arabia': 'SA',
  'sa': 'SA',
  'uae': 'AE',
  'dubai': 'AE',
  'ae': 'AE',
  'turkey': 'TR',
  'turkish': 'TR',
  'tr': 'TR',

  // Europe & Americas
  'france': 'FR',
  'french': 'FR',
  'fr': 'FR',
  'germany': 'DE',
  'german': 'DE',
  'de': 'DE',
  'italy': 'IT',
  'italian': 'IT',
  'it': 'IT',
  'spain': 'ES',
  'spanish': 'ES',
  'es': 'ES',
  'netherlands': 'NL',
  'nl': 'NL',
  'russia': 'RU',
  'russian': 'RU',
  'ru': 'RU',
  'australia': 'AU',
  'au': 'AU',
  'canada': 'CA',
  'ca': 'CA',
  'brazil': 'BR',
  'br': 'BR',
};

// Known popular channel catalog with canonical tvg-id and tvg-country
export interface KnownChannelInfo {
  matchPatterns: (string | RegExp)[];
  canonicalId: string;
  country: string;
  logo?: string;
}

export const KNOWN_CHANNELS: KnownChannelInfo[] = [
  // INDONESIA
  {
    matchPatterns: [/^tvri\s*nasional/i, /^tvri$/i, /^tvri\s*hd/i],
    canonicalId: 'TVRINasional.id',
    country: 'ID',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_TVRI_2019.svg/200px-Logo_TVRI_2019.svg.png',
  },
  {
    matchPatterns: [/^tvri\s*world/i],
    canonicalId: 'TVRIWorld.id',
    country: 'ID',
  },
  {
    matchPatterns: [/^tvri\s*sport/i],
    canonicalId: 'TVRISport.id',
    country: 'ID',
  },
  {
    matchPatterns: [/kompas\s*tv/i],
    canonicalId: 'KompasTV.id',
    country: 'ID',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Kompas_TV_2017.svg/200px-Kompas_TV_2017.svg.png',
  },
  {
    matchPatterns: [/beritasatu/i, /b1\s*news/i],
    canonicalId: 'BeritaSatu.id',
    country: 'ID',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/BeritaSatu_2022.svg/200px-BeritaSatu_2022.svg.png',
  },
  {
    matchPatterns: [/metro\s*tv/i],
    canonicalId: 'MetroTV.id',
    country: 'ID',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/MetroTV_2010.svg/200px-MetroTV_2010.svg.png',
  },
  {
    matchPatterns: [/sea\s*today/i],
    canonicalId: 'SEAToday.id',
    country: 'ID',
  },
  {
    matchPatterns: [/\brcti\b/i],
    canonicalId: 'RCTI.id',
    country: 'ID',
  },
  {
    matchPatterns: [/\bsctv\b/i],
    canonicalId: 'SCTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/indosiar/i],
    canonicalId: 'Indosiar.id',
    country: 'ID',
  },
  {
    matchPatterns: [/trans\s*tv/i],
    canonicalId: 'TransTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/trans\s*7/i],
    canonicalId: 'Trans7.id',
    country: 'ID',
  },
  {
    matchPatterns: [/\bantv\b/i],
    canonicalId: 'ANTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/\bgtv\b/i, /global\s*tv/i],
    canonicalId: 'GTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/tv\s*one/i, /tvone/i],
    canonicalId: 'TVOne.id',
    country: 'ID',
  },
  {
    matchPatterns: [/cnn\s*indonesia/i],
    canonicalId: 'CNNIndonesia.id',
    country: 'ID',
  },
  {
    matchPatterns: [/cnbc\s*indonesia/i],
    canonicalId: 'CNBCIndonesia.id',
    country: 'ID',
  },
  {
    matchPatterns: [/inews/i],
    canonicalId: 'iNews.id',
    country: 'ID',
  },
  {
    matchPatterns: [/net\s*tv/i, /\bnet\.\b/i],
    canonicalId: 'NET.id',
    country: 'ID',
  },
  {
    matchPatterns: [/\brtv\b/i, /rajawali\s*televisi/i],
    canonicalId: 'RTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/mnc\s*tv/i, /\btpi\b/i],
    canonicalId: 'MNCTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/jak\s*tv/i],
    canonicalId: 'JakTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/bali\s*tv/i],
    canonicalId: 'BaliTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/jtv/i],
    canonicalId: 'JTV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/daai\s*tv/i],
    canonicalId: 'DAAITV.id',
    country: 'ID',
  },
  {
    matchPatterns: [/rodja\s*tv/i],
    canonicalId: 'RodjaTV.id',
    country: 'ID',
  },

  // INTERNATIONAL & GLOBAL CHANNELS
  {
    matchPatterns: [/red\s*bull\s*tv/i],
    canonicalId: 'RedBullTV.at',
    country: 'AT',
  },
  {
    matchPatterns: [/nasa\s*tv/i],
    canonicalId: 'NASA.us',
    country: 'US',
  },
  {
    matchPatterns: [/bloomberg/i],
    canonicalId: 'Bloomberg.us',
    country: 'US',
  },
  {
    matchPatterns: [/euronews/i],
    canonicalId: 'Euronews.fr',
    country: 'FR',
  },
  {
    matchPatterns: [/france\s*24/i],
    canonicalId: 'France24.fr',
    country: 'FR',
  },
  {
    matchPatterns: [/dw\s*documentary/i, /dw\s*deutsch/i, /dw\s*english/i, /deutsche\s*welle/i],
    canonicalId: 'DWDoc.de',
    country: 'DE',
  },
  {
    matchPatterns: [/al\s*jazeera/i],
    canonicalId: 'AlJazeera.qa',
    country: 'QA',
  },
  {
    matchPatterns: [/pbs\s*kids/i],
    canonicalId: 'PBSKids.us',
    country: 'US',
  },
  {
    matchPatterns: [/rakuten/i],
    canonicalId: 'RakutenAction.es',
    country: 'ES',
  },
  {
    matchPatterns: [/pluto\s*tv/i],
    canonicalId: 'PlutoTV.us',
    country: 'US',
  },
  {
    matchPatterns: [/filmrise/i],
    canonicalId: 'FilmRiseClassic.us',
    country: 'US',
  },
  {
    matchPatterns: [/world\s*poker\s*tour/i, /\bwpt\b/i],
    canonicalId: 'WPT.us',
    country: 'US',
  },
  {
    matchPatterns: [/mavtv/i],
    canonicalId: 'MAVTV.us',
    country: 'US',
  },
  {
    matchPatterns: [/clubbing\s*tv/i],
    canonicalId: 'ClubbingTV.fr',
    country: 'FR',
  },
  {
    matchPatterns: [/trace\s*urban/i],
    canonicalId: 'TraceUrban.fr',
    country: 'FR',
  },
  {
    matchPatterns: [/vevo\s*pop/i],
    canonicalId: 'VevoPop.us',
    country: 'US',
  },
  {
    matchPatterns: [/wildearth/i],
    canonicalId: 'WildEarth.za',
    country: 'ZA',
  },
  {
    matchPatterns: [/cna\b/i, /channel\s*news\s*asia/i],
    canonicalId: 'CNA.sg',
    country: 'SG',
  },
  {
    matchPatterns: [/nhk\s*world/i],
    canonicalId: 'NHKWorld.jp',
    country: 'JP',
  },
  {
    matchPatterns: [/kbs\s*world/i],
    canonicalId: 'KBSWorld.kr',
    country: 'KR',
  },
  {
    matchPatterns: [/arirang/i],
    canonicalId: 'Arirang.kr',
    country: 'KR',
  },
  {
    matchPatterns: [/bbc\s*news/i],
    canonicalId: 'BBCNews.uk',
    country: 'GB',
  },
  {
    matchPatterns: [/bbc\s*one/i],
    canonicalId: 'BBCOne.uk',
    country: 'GB',
  },
  {
    matchPatterns: [/bbc\s*two/i],
    canonicalId: 'BBCTwo.uk',
    country: 'GB',
  },
  {
    matchPatterns: [/sky\s*news/i],
    canonicalId: 'SkyNews.uk',
    country: 'GB',
  },
  {
    matchPatterns: [/cnn\s*international/i, /^cnn$/i, /^cnn\s*hd/i],
    canonicalId: 'CNN.us',
    country: 'US',
  },
  {
    matchPatterns: [/\bhbo\b/i],
    canonicalId: 'HBO.us',
    country: 'US',
  },
  {
    matchPatterns: [/espn\s*2/i, /^espn$/i],
    canonicalId: 'ESPN.us',
    country: 'US',
  },
  {
    matchPatterns: [/astro\s*awani/i],
    canonicalId: 'AstroAwani.my',
    country: 'MY',
  },
  {
    matchPatterns: [/tv3\s*malaysia/i],
    canonicalId: 'TV3.my',
    country: 'MY',
  },
];

/**
 * Detect country code from existing tvg-id (e.g. KompasTV.id -> ID, BBC.uk -> GB)
 */
export function detectCountryFromTvgId(tvgId?: string): string | null {
  if (!tvgId || typeof tvgId !== 'string') return null;
  const match = tvgId.trim().match(/\.([a-z]{2})$/i);
  if (match) {
    const ext = match[1].toLowerCase();
    if (ext === 'uk') return 'GB';
    return ext.toUpperCase();
  }
  return null;
}

/**
 * Detect country code from group-title (e.g. "ID: Nasional" -> "ID", "US | Sports" -> "US")
 */
export function detectCountryFromGroupTitle(groupTitle?: string): string | null {
  if (!groupTitle || typeof groupTitle !== 'string') return null;
  const clean = groupTitle.trim();

  // Pattern: "ID: ...", "[ID] ...", "ID | ...", "ID - ..."
  const prefixMatch = clean.match(/^(\[|\()?\s*([a-zA-Z]{2,3})\s*(\]|\))?[\s:\-|_]+/);
  if (prefixMatch) {
    const raw = prefixMatch[2].toLowerCase();
    if (COUNTRY_KEYWORD_MAP[raw]) {
      return COUNTRY_KEYWORD_MAP[raw];
    }
  }

  // Check known country names in group title
  const words = clean.toLowerCase().split(/[\s:\-|_\/]+/);
  for (const w of words) {
    if (COUNTRY_KEYWORD_MAP[w]) {
      return COUNTRY_KEYWORD_MAP[w];
    }
  }

  return null;
}

/**
 * Detect country code from channel name (e.g. "[ID] Kompas TV" -> "ID", "BBC One (UK)" -> "GB")
 */
export function detectCountryFromChannelName(name?: string): string | null {
  if (!name || typeof name !== 'string') return null;
  const clean = name.trim();

  // Prefix pattern: "[ID] ...", "ID: ..."
  const prefixMatch = clean.match(/^(\[|\()?\s*([a-zA-Z]{2,3})\s*(\]|\))?[\s:\-|_]+/);
  if (prefixMatch) {
    const raw = prefixMatch[2].toLowerCase();
    if (COUNTRY_KEYWORD_MAP[raw]) {
      return COUNTRY_KEYWORD_MAP[raw];
    }
  }

  // Suffix pattern: "... (ID)", "... [US]", "... (UK)"
  const suffixMatch = clean.match(/[\(\[]\s*([a-zA-Z]{2,3})\s*[\)\]]$/);
  if (suffixMatch) {
    const raw = suffixMatch[1].toLowerCase();
    if (COUNTRY_KEYWORD_MAP[raw]) {
      return COUNTRY_KEYWORD_MAP[raw];
    }
  }

  return null;
}

/**
 * Synthesizes a standardized, clean tvg-id from channel name and country
 * E.g., "Kompas TV HD" + "ID" -> "KompasTV.id"
 */
export function synthesizeTvgId(channelName: string, countryCode?: string): string {
  // Strip country prefixes/suffixes
  let clean = channelName
    .replace(/^(\[|\()?[a-zA-Z]{2,3}(\]|\))?[\s:\-|_]+/g, '')
    .replace(/[\(\[][a-zA-Z]{2,3}[\)\]]$/g, '')
    .trim();

  // Remove resolution markers like "HD", "FHD", "4K", "1080p", "720p" for standard ID
  clean = clean.replace(/\b(UHD|FHD|HD|SD|4K|1080p|720p)\b/gi, '').trim();

  // Remove special symbols and spaces
  const alphanumeric = clean
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');

  const base = alphanumeric || 'Channel';
  const c = countryCode ? countryCode.toLowerCase() : 'tv';
  return `${base}.${c}`;
}

export interface SyncCandidateResult {
  channelId: string;
  originalName: string;
  groupTitle: string;
  currentTvgId: string;
  proposedTvgId: string;
  currentCountry: string;
  proposedCountry: string;
  currentLogo: string;
  proposedLogo?: string;
  hasChange: boolean;
  reason: string;
}

export interface SyncOptions {
  onlyFillMissing: boolean; // If true, only populate empty tvg-id / tvg-country
  detectFromGroup: boolean; // Infer country from group-title
  synthesizeMissingId: boolean; // Generate ChannelName.country if no id is present
  autoFillLogo: boolean; // Fill logo from catalog if empty
}

export const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  onlyFillMissing: true,
  detectFromGroup: true,
  synthesizeMissingId: true,
  autoFillLogo: true,
};

/**
 * Calculates auto-sync proposals for all channels
 */
export function calculateTvgSync(
  channels: Channel[],
  options: SyncOptions = DEFAULT_SYNC_OPTIONS
): SyncCandidateResult[] {
  return channels.map((channel) => {
    let proposedCountry = channel.tvgCountry || '';
    let proposedTvgId = channel.tvgId || '';
    let proposedLogo = channel.tvgLogo || '';
    let reason = '';

    // Step 1: Check known channel database first
    const known = KNOWN_CHANNELS.find((k) =>
      k.matchPatterns.some((pattern) =>
        typeof pattern === 'string'
          ? channel.name.toLowerCase().includes(pattern.toLowerCase())
          : pattern.test(channel.name)
      )
    );

    if (known) {
      if (!options.onlyFillMissing || !proposedTvgId) {
        proposedTvgId = known.canonicalId;
      }
      if (!options.onlyFillMissing || !proposedCountry) {
        proposedCountry = known.country;
      }
      if (known.logo && (!proposedLogo || !options.onlyFillMissing)) {
        proposedLogo = known.logo;
      }
      reason = 'Database EPG Resmi (' + known.canonicalId + ')';
    }

    // Step 2: Country inference if country still missing or if overriding
    if (!proposedCountry || !options.onlyFillMissing) {
      // From tvg-id suffix
      const fromId = detectCountryFromTvgId(proposedTvgId || channel.tvgId);
      if (fromId) {
        proposedCountry = fromId;
        if (!reason) reason = `Ekstraksi dari ekstensi ID (${fromId})`;
      }

      // From channel name prefix/suffix
      if (!proposedCountry) {
        const fromName = detectCountryFromChannelName(channel.name);
        if (fromName) {
          proposedCountry = fromName;
          if (!reason) reason = `Pola nama saluran (${fromName})`;
        }
      }

      // From group title
      if (!proposedCountry && options.detectFromGroup) {
        const fromGroup = detectCountryFromGroupTitle(channel.groupTitle);
        if (fromGroup) {
          proposedCountry = fromGroup;
          if (!reason) reason = `Pola nama group-title (${fromGroup})`;
        }
      }
    }

    // Step 3: If tvg-id is still missing and user wants to synthesize
    if (!proposedTvgId && options.synthesizeMissingId) {
      proposedTvgId = synthesizeTvgId(channel.name, proposedCountry || undefined);
      if (!reason) reason = 'Format EPG otomatis (NamaSaluran.negara)';
    }

    // Normalize country code to uppercase 2 letters
    if (proposedCountry) {
      proposedCountry = proposedCountry.toUpperCase().trim();
    }

    const hasIdChange = proposedTvgId !== (channel.tvgId || '');
    const hasCountryChange = proposedCountry !== (channel.tvgCountry || '');
    const hasLogoChange = options.autoFillLogo && proposedLogo !== (channel.tvgLogo || '');

    const hasChange = hasIdChange || hasCountryChange || hasLogoChange;

    return {
      channelId: channel.id,
      originalName: channel.name,
      groupTitle: channel.groupTitle || 'Tanpa Grup',
      currentTvgId: channel.tvgId || '',
      proposedTvgId: proposedTvgId || (channel.tvgId || ''),
      currentCountry: channel.tvgCountry || '',
      proposedCountry: proposedCountry || (channel.tvgCountry || ''),
      currentLogo: channel.tvgLogo || '',
      proposedLogo: proposedLogo || (channel.tvgLogo || ''),
      hasChange,
      reason: reason || 'Sudah memiliki tvg-id dan tvg-country yang lengkap',
    };
  });
}
