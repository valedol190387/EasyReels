// Сгенерировано tools/brand.py из profile.json — руками не править, перезапусти анкету.
export type Brand = {
  name: string; instagram: string; handle: string; niche: string;
  links: Partial<Record<"youtube" | "telegram" | "tiktok" | "vk" | "site", string>>;
  telegramHandle: string; leadTo: string[];
  colors: { bg: string; surface: string; text: string; accent: string; accent2: string };
  fonts: { display: string; text: string; mono: string };
  avatar: string; logo: string;
  outro: boolean; codeword: string; word: string; offer: string;
  subs: { style: string; caps: boolean };
  sfx: boolean; music: string; speed: number;
};
export const brand: Brand = {
  "name": "",
  "instagram": "",
  "handle": "",
  "niche": "",
  "links": {},
  "telegramHandle": "",
  "leadTo": [
    "follow"
  ],
  "colors": {
    "bg": "#0B0B0C",
    "surface": "#151517",
    "text": "#F5EDE0",
    "accent": "#FF4D2E",
    "accent2": "#FFB627"
  },
  "fonts": {
    "display": "Unbounded",
    "text": "Manrope",
    "mono": "JetBrains Mono"
  },
  "avatar": "",
  "logo": "",
  "outro": true,
  "codeword": "none",
  "word": "",
  "offer": "",
  "subs": {
    "style": "karaoke",
    "caps": false
  },
  "sfx": true,
  "music": "none",
  "speed": 1.2
};
