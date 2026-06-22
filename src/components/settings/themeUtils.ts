import { darkThemeVars, lightThemeVars } from './themes';

export function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function watchSystemTheme(callback: (theme: 'dark' | 'light') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const listener = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  mq.addEventListener('change', listener);
  return () => {
    mq.removeEventListener('change', listener);
  };
}

export function applyTheme(theme: string): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove('theme-dark', 'theme-light', 'theme-auto');
  
  // Save selection
  localStorage.setItem('anchor_theme', theme);
  
  let targetTheme: 'dark' | 'light' = 'dark';
  if (theme === 'auto') {
    root.classList.add('theme-auto');
    targetTheme = getSystemTheme();
    root.classList.add(`theme-${targetTheme}`);
  } else {
    root.classList.add(`theme-${theme}`);
    targetTheme = theme as 'dark' | 'light';
  }
  
  const vars = targetTheme === 'light' ? lightThemeVars : darkThemeVars;
  
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function switchThemeWithAnimation(newTheme: string): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  
  root.classList.add('theme-transitioning');
  
  applyTheme(newTheme);
  
  setTimeout(() => {
    root.classList.remove('theme-transitioning');
  }, 350);
}
