// BUNKER Terminal Types

export interface TerminalSession {
  id: string;
  title: string;
  createdAt: Date;
}

export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
  cursorAccent: string;
  selectionBackground: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
}

export interface TerminalConfig {
  fontFamily: string;
  fontSize: number;
  theme: TerminalTheme;
}

// Fallout-themed terminal colors
export const FALLOUT_TERMINAL_THEME: TerminalTheme = {
  background: '#0a0a0f',
  foreground: '#00ff00',
  cursor: '#f4d03f',
  cursorAccent: '#0a0a0f',
  selectionBackground: 'rgba(244, 208, 63, 0.3)',
  black: '#0a0a0f',
  red: '#ff3333',
  green: '#00ff00',
  yellow: '#f4d03f',
  blue: '#0080ff',
  magenta: '#ff00ff',
  cyan: '#00ffff',
  white: '#ffffff',
  brightBlack: '#666666',
  brightRed: '#ff6666',
  brightGreen: '#66ff66',
  brightYellow: '#ffff66',
  brightBlue: '#6699ff',
  brightMagenta: '#ff66ff',
  brightCyan: '#66ffff',
  brightWhite: '#ffffff',
};

export const DEFAULT_TERMINAL_CONFIG: TerminalConfig = {
  fontFamily: '"Share Tech Mono", "Courier New", monospace',
  fontSize: 14,
  theme: FALLOUT_TERMINAL_THEME,
};
