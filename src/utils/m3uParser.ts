import { Channel } from '../types/iptv';

/**
 * Generate a clean, unique ID for client-side state
 */
export function generateId(): string {
  return 'ch_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

/**
 * Parses raw M3U text into an array of Channel objects
 */
export function parseM3U(content: string): Channel[] {
  if (!content || typeof content !== 'string') return [];

  // Remove BOM if present
  let cleanContent = content;
  if (cleanContent.charCodeAt(0) === 0xFEFF) {
    cleanContent = cleanContent.slice(1);
  }

  const lines = cleanContent.split(/\r?\n/);
  const channels: Channel[] = [];

  let currentAttributes: Record<string, string> = {};
  let currentExtraLines: string[] = [];
  let currentName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTM3U')) {
      // Header line, can skip or parse playlist-level info
      continue;
    }

    if (line.startsWith('#EXTINF:')) {
      currentAttributes = {};
      currentExtraLines = [];
      
      // Syntax: #EXTINF:duration tvg-id="id" tvg-name="name" group-title="group",Display Name
      const commaIndex = line.indexOf(',');
      let rawHeader = line;
      if (commaIndex !== -1) {
        rawHeader = line.substring(0, commaIndex);
        currentName = line.substring(commaIndex + 1).trim();
      } else {
        currentName = 'Saluran Tanpa Nama';
      }

      // Regex to extract all key="value" or key='value' pairs
      const attrRegex = /([a-zA-Z0-9_\-:]+)=["']([^"']*)["']/g;
      let match: RegExpExecArray | null;
      while ((match = attrRegex.exec(rawHeader)) !== null) {
        const key = match[1].toLowerCase();
        const value = match[2];
        currentAttributes[key] = value;
      }

      // Fallback for tvg-name if currentName is empty
      if (!currentName && currentAttributes['tvg-name']) {
        currentName = currentAttributes['tvg-name'];
      }
    } else if (line.startsWith('#')) {
      // Other directives like #EXTVLCOPT, #KODIPROP, #EXTGRP
      if (line.startsWith('#EXTGRP:')) {
        const extGrp = line.substring(8).trim();
        if (extGrp && !currentAttributes['group-title']) {
          currentAttributes['group-title'] = extGrp;
        }
      } else {
        currentExtraLines.push(line);
      }
    } else {
      // Stream URL line
      const url = line;
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('rtmp://') || url.startsWith('rtsp://') || url.startsWith('mms://') || url.startsWith('/')) {
        const groupTitle = currentAttributes['group-title'] || currentAttributes['group'] || 'Tanpa Grup';
        
        channels.push({
          id: generateId(),
          name: currentName || 'Saluran ' + (channels.length + 1),
          url,
          groupTitle: groupTitle.trim(),
          tvgId: currentAttributes['tvg-id'] || '',
          tvgName: currentAttributes['tvg-name'] || '',
          tvgLogo: currentAttributes['tvg-logo'] || '',
          tvgCountry: currentAttributes['tvg-country'] || '',
          tvgLanguage: currentAttributes['tvg-language'] || '',
          rawAttributes: { ...currentAttributes },
          extraLines: [...currentExtraLines],
        });

        // Reset state for next channel
        currentAttributes = {};
        currentExtraLines = [];
        currentName = '';
      }
    }
  }

  return channels;
}

/**
 * Serializes Channel array back into standard M3U / M3U8 string
 */
export function exportM3U(channels: Channel[], playlistName = 'IPTV_Playlist'): string {
  const output: string[] = ['#EXTM3U'];

  for (const ch of channels) {
    const attrs: string[] = ['#EXTINF:-1'];

    if (ch.tvgId) attrs.push(`tvg-id="${escapeQuotes(ch.tvgId)}"`);
    if (ch.tvgName) attrs.push(`tvg-name="${escapeQuotes(ch.tvgName)}"`);
    if (ch.tvgLogo) attrs.push(`tvg-logo="${escapeQuotes(ch.tvgLogo)}"`);
    if (ch.tvgCountry) attrs.push(`tvg-country="${escapeQuotes(ch.tvgCountry)}"`);
    if (ch.tvgLanguage) attrs.push(`tvg-language="${escapeQuotes(ch.tvgLanguage)}"`);
    
    // Group Title is core!
    const groupName = ch.groupTitle ? ch.groupTitle : 'Tanpa Grup';
    attrs.push(`group-title="${escapeQuotes(groupName)}"`);

    // Append preserved raw custom attributes if any
    if (ch.rawAttributes) {
      for (const [key, value] of Object.entries(ch.rawAttributes)) {
        if (!['tvg-id', 'tvg-name', 'tvg-logo', 'tvg-country', 'tvg-language', 'group-title', 'group'].includes(key)) {
          attrs.push(`${key}="${escapeQuotes(value)}"`);
        }
      }
    }

    // Join header and name
    output.push(`${attrs.join(' ')},${ch.name}`);

    // Extra lines like #EXTVLCOPT or #EXTGRP
    if (ch.extraLines && ch.extraLines.length > 0) {
      for (const extra of ch.extraLines) {
        output.push(extra);
      }
    }

    // Stream URL
    output.push(ch.url);
  }

  return output.join('\n');
}

function escapeQuotes(str: string): string {
  return str.replace(/"/g, "'");
}
