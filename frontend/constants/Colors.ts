/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    surface: '#f8fafc',
    surfaceVariant: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    border: '#e2e8f0',
    card: '#ffffff',
    spotCard: '#f8fafc',
    spotCardBorder: '#e2e8f0',
    textSecondary: '#64748b',
    textTertiary: '#94a3b8',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    gradientStart: '#6366f1',
    gradientEnd: '#8b5cf6',
    romantic: '#ec4899',
    serene: '#10b981',
    creative: '#f59e0b'
  },
  dark: {
    text: '#fff',
    background: '#0f172a',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    primary: '#818cf8',
    secondary: '#a78bfa',
    accent: '#fbbf24',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    info: '#60a5fa',
    border: '#334155',
    card: '#1e293b',
    spotCard: '#334155',
    spotCardBorder: '#475569',
    textSecondary: '#94a3b8',
    textTertiary: '#64748b',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    gradientStart: '#818cf8',
    gradientEnd: '#a78bfa',
    romantic: '#f472b6',
    serene: '#34d399',
    creative: '#fbbf24'
  },
};
