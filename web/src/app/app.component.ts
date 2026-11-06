import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartGiftService, ViewPerspective } from './services/smartgift.service';
import { PersonalThemeId, ThemeService } from './services/theme.service';
import { WishItem } from './models/smartgift.model';

export type ActiveTab = 'minha-lista' | 'amigos' | 'clas' | 'temas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly giftService = inject(SmartGiftService);
  readonly themeService = inject(ThemeService);

  readonly activeTab = signal<ActiveTab>('minha-lista');
  readonly applyClanThemeAutomatically = signal<boolean>(true);

  // Form: Adicionar Presente por Link
  newLinkUrl = '';
  newLinkCustomTitle = '';
  newLinkNotes = '';
  newLinkPriority: 'alta' | 'media' | 'sonho' = 'alta';
  extractionFeedback = signal<string | null>(null);

  // Controle de abas internas dos cards (Comparador, Vaquinha, Chat Secreto)
  expandedOffersMap = signal<Record<string, boolean>>({ 'w-1': true, 'w-4': true });
  customContributionAmount: Record<string, number> = {};
  newCommentText: Record<string, string> = {};

  // Form: Criar Novo Clã
  showCreateClanModal = signal<boolean>(false);
  newClanName = '';
  newClanIcon = '🛡️';
  newClanMotto = '';
  newClanTheme: PersonalThemeId = 'violet';

  // Amigo Secreto revelação
  revealMySecretFriend = signal<boolean>(false);

  readonly quickSampleLinks = [
    { label: '⚡ AirFryer Inox 4L', url: 'https://www.amazon.com.br/fritadeira-airfryer-mondial-inox', notes: 'Voltagem 110v, cor Inox' },
    { label: '👟 Tênis Nike Pegasus', url: 'https://www.mercadolivre.com.br/tenis-nike-air-zoom-pegasus', notes: 'Tamanho 41' },
    { label: '🔊 Echo Dot 5ª Geração Alexa', url: 'https://www.amazon.com.br/echo-dot-5-geracao-alexa', notes: 'Cor Azul ou Preta' },
    { label: '🪑 Cadeira Ergonômica Mesh', url: 'https://www.kabum.com.br/cadeira-ergonomica-mesh-pro', notes: 'Para o home office' }
  ];

  readonly availableCrests = ['🦁', '🚀', '🛡️', '👑', '🐉', '🥂', '🎮', '🌟'];

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    if (tab === 'clas' && this.applyClanThemeAutomatically()) {
      this.themeService.setClanThemeOverride(this.giftService.activeClan().themeId);
    } else if (tab !== 'clas') {
      this.themeService.setClanThemeOverride(null);
    }
  }

  selectClan(clanId: string): void {
    this.giftService.selectedClanId.set(clanId);
    this.revealMySecretFriend.set(false);
    if (this.applyClanThemeAutomatically()) {
      const clan = this.giftService.clans().find(c => c.id === clanId);
      if (clan) {
        this.themeService.setClanThemeOverride(clan.themeId);
      }
    }
  }

  toggleClanThemeSync(): void {
    const next = !this.applyClanThemeAutomatically();
    this.applyClanThemeAutomatically.set(next);
    if (next && this.activeTab() === 'clas') {
      this.themeService.setClanThemeOverride(this.giftService.activeClan().themeId);
    } else {
      this.themeService.setClanThemeOverride(null);
    }
  }

  setPerspective(mode: ViewPerspective): void {
    this.giftService.togglePerspective(mode);
  }

  fillSampleLink(sample: { label: string; url: string; notes: string }): void {
    this.newLinkUrl = sample.url;
    this.newLinkNotes = sample.notes;
    this.newLinkCustomTitle = '';
  }

  handleExtractAndAdd(): void {
    if (!this.newLinkUrl.trim()) return;
    const created = this.giftService.extractAndCompareFromUrl(
      this.newLinkUrl,
      this.newLinkCustomTitle,
      this.newLinkNotes,
      this.newLinkPriority
    );
    this.expandedOffersMap.update(m => ({ ...m, [created.id]: true }));
    this.extractionFeedback.set(
      `✨ Presente "${created.title}" extraído! Menor preço encontrado: R$ ${this.formatCurrency(created.lowestPrice)} (Economia de R$ ${this.formatCurrency(created.savingsAmount)})`
    );
    this.newLinkUrl = '';
    this.newLinkCustomTitle = '';
    this.newLinkNotes = '';
    setTimeout(() => this.extractionFeedback.set(null), 6500);
  }

  toggleOffers(itemId: string): void {
    this.expandedOffersMap.update(m => ({ ...m, [itemId]: !m[itemId] }));
  }

  isOffersExpanded(itemId: string): boolean {
    return !!this.expandedOffersMap()[itemId];
  }

  contributePreset(itemId: string, amount: number): void {
    this.giftService.contributeToSecretPool(itemId, amount);
  }

  contributeCustom(itemId: string): void {
    const val = Number(this.customContributionAmount[itemId]);
    if (!val || val <= 0) return;
    this.giftService.contributeToSecretPool(itemId, val);
    this.customContributionAmount[itemId] = 0;
  }

  sendSecretComment(itemId: string): void {
    const text = this.newCommentText[itemId];
    if (!text || !text.trim()) return;
    this.giftService.addSecretComment(itemId, text);
    this.newCommentText[itemId] = '';
  }

  getPoolPercentage(item: WishItem): number {
    if (!item.secretPool || item.secretPool.targetAmount <= 0) return 0;
    return Math.min(100, Math.round((item.secretPool.collectedAmount / item.secretPool.targetAmount) * 100));
  }

  getMySecretSantaTarget() {
    const clan = this.giftService.activeClan();
    const myId = this.giftService.currentUser().id;
    return clan.secretSantaPairs.find(p => p.giverId === myId);
  }

  goToMemberWishlist(memberId: string): void {
    if (memberId === this.giftService.currentUser().id) {
      this.setTab('minha-lista');
    } else {
      this.giftService.selectedMemberFilter.set(memberId);
      this.setTab('amigos');
    }
  }

  handleCreateClan(): void {
    if (!this.newClanName.trim()) return;
    const created = this.giftService.createNewClan(
      this.newClanName.trim(),
      this.newClanIcon,
      this.newClanMotto.trim(),
      this.newClanTheme
    );
    if (this.applyClanThemeAutomatically()) {
      this.themeService.setClanThemeOverride(created.themeId);
    }
    this.newClanName = '';
    this.newClanMotto = '';
    this.showCreateClanModal.set(false);
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
