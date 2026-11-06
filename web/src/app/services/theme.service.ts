import { Injectable, signal, effect } from '@angular/core';

export type PersonalThemeId = 'violet' | 'coral' | 'emerald' | 'ocean';
export type ColorMode = 'light' | 'dark';

export interface ThemeOption {
  id: PersonalThemeId;
  name: string;
  badge: string;
  description: string;
  primaryHex: string;
  secondaryHex: string;
  accentHex: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly themes: ThemeOption[] = [
    {
      id: 'violet',
      name: 'Violeta Real',
      badge: '👑 Padrão',
      description: 'Remete a Clãs, surpresa e magia de presentear',
      primaryHex: '#7C3AED',
      secondaryHex: '#FF6B6B',
      accentHex: '#F59E0B'
    },
    {
      id: 'coral',
      name: 'Coral Festivo',
      badge: '🎉 Celebração',
      description: 'Caloroso para aniversários, Natal e festas em família',
      primaryHex: '#E11D48',
      secondaryHex: '#F59E0B',
      accentHex: '#10B981'
    },
    {
      id: 'emerald',
      name: 'Esmeralda Smart',
      badge: '💸 Economia',
      description: 'Foco em caça-preços e menor preço garantido',
      primaryHex: '#059669',
      secondaryHex: '#3B82F6',
      accentHex: '#F59E0B'
    },
    {
      id: 'ocean',
      name: 'Oceano Cyber',
      badge: '⚡ Tech/Gamer',
      description: 'Visual moderno de alto contraste para clãs de amigos',
      primaryHex: '#2563EB',
      secondaryHex: '#06B6D4',
      accentHex: '#10B981'
    }
  ];

  readonly activeTheme = signal<PersonalThemeId>('violet');
  readonly colorMode = signal<ColorMode>('light');
  readonly clanOverrideTheme = signal<PersonalThemeId | null>(null);

  constructor() {
    const savedTheme = localStorage.getItem('smartgift_theme') as PersonalThemeId | null;
    const savedMode = localStorage.getItem('smartgift_mode') as ColorMode | null;

    if (savedTheme && this.themes.some(t => t.id === savedTheme)) {
      this.activeTheme.set(savedTheme);
    }
    if (savedMode === 'light' || savedMode === 'dark') {
      this.colorMode.set(savedMode);
    }

    effect(() => {
      const effectiveTheme = this.clanOverrideTheme() ?? this.activeTheme();
      const mode = this.colorMode();
      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.documentElement.setAttribute('data-mode', mode);
      localStorage.setItem('smartgift_theme', this.activeTheme());
      localStorage.setItem('smartgift_mode', mode);
    });
  }

  setPersonalTheme(theme: PersonalThemeId): void {
    this.activeTheme.set(theme);
  }

  toggleColorMode(): void {
    this.colorMode.update(m => (m === 'light' ? 'dark' : 'light'));
  }

  setClanThemeOverride(theme: PersonalThemeId | null): void {
    this.clanOverrideTheme.set(theme);
  }
}
