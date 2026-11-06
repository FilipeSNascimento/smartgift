import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SmartGiftService } from './services/smartgift.service';
import { PersonalThemeId, ThemeService } from './services/theme.service';
import { LiveSearchResult, WishItem } from './models/smartgift.model';

export type ProductTab = 'feed' | 'deck' | 'clans' | 'arena' | 'settings';

export interface StoryItem {
  id: string;
  userName: string;
  avatar: string;
  badge: string;
  title: string;
  subtitle: string;
  targetTab: ProductTab;
  memberFilter?: string;
}

export interface FigmaScreenProto {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  fileName: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly giftService = inject(SmartGiftService);
  readonly themeService = inject(ThemeService);

  readonly activeTab = signal<ProductTab>('feed');
  readonly activeStory = signal<StoryItem | null>(null);
  readonly toastMessage = signal<string | null>(null);

  // Modal de Login / Troca de Conta / Cadastro
  readonly showAuthModal = signal<boolean>(false);
  readonly authModalMode = signal<'switch' | 'register' | 'edit'>('switch');
  regName = '';
  regEmail = '';
  regAvatar = '🎁';
  regBirthday = '';

  // Forjador de Carta (Extrator de Link + Busca Real Mercado Livre)
  forgeInput = '';
  forgeCustomTitle = '';
  forgeNotes = '';
  forgePriority: 'alta' | 'media' | 'sonho' = 'alta';
  readonly isSearchingForge = signal<boolean>(false);
  readonly forgeLiveResults = signal<LiveSearchResult[]>([]);

  // Modal de Edição de Carta do Deck
  readonly editingItem = signal<WishItem | null>(null);
  editTitle = '';
  editNotes = '';
  editPriority: 'alta' | 'media' | 'sonho' = 'alta';

  // Arena Caça-Preços em Tempo Real
  arenaQuery = 'PlayStation 5 Slim';
  readonly isSearchingArena = signal<boolean>(false);
  readonly arenaResults = signal<LiveSearchResult[]>([]);

  // Controles de Cards (Comparativo expandido, doação customizada, comentários)
  readonly expandedOffersMap = signal<Record<string, boolean>>({});
  readonly refreshingItemId = signal<string | null>(null);
  customContributionAmount: Record<string, number> = {};
  newCommentText: Record<string, string> = {};

  // Clãs: Entrar por Código, Criar Clã, Novo Evento, Baú Secreto
  inviteCodeInput = '';
  readonly showCreateClanModal = signal<boolean>(false);
  newClanName = '';
  newClanIcon = '🛡️';
  newClanMotto = '';
  newClanTheme: PersonalThemeId = 'violet';
  newClanBudget = 180;

  readonly showNewEventModal = signal<boolean>(false);
  newEventTitle = '';
  newEventDateLabel = '';
  newEventDays = 15;

  readonly revealMySecretFriend = signal<boolean>(false);
  readonly applyClanThemeAutomatically = signal<boolean>(true);

  // Configurações de Afiliado
  affAmazon = '';
  affMercadoLivre = '';
  affShopee = '';
  affMagalu = '';
  affKabum = '';

  readonly figmaFileUrl = 'https://www.figma.com/design/NMXEihmjSrwSjZKxoPCzyR';

  readonly figmaPrototypes: FigmaScreenProto[] = [
    {
      id: 'fp-1',
      number: '01',
      title: 'Login, Código de Clã & Multicontas',
      subtitle: 'Entrada rápida, convite #FAMILIA-NASC e troca de perfil',
      fileName: '01-login-onboarding.svg'
    },
    {
      id: 'fp-2',
      number: '02',
      title: 'Feed Social & Stories (Instagram)',
      subtitle: 'Top HUD Clash Royale + Stories de aniversários + Feed c/ Vaquinha',
      fileName: '02-feed-instagram-stories.svg'
    },
    {
      id: 'fp-3',
      number: '03',
      title: 'Meu Deck 2x2 & Forjar Carta (Clash)',
      subtitle: 'Cartas Lendária/Épica/Rara + Extrator e Busca Real',
      fileName: '03-meu-deck-forjar-carta.svg'
    },
    {
      id: 'fp-4',
      number: '04',
      title: 'Clã, Mural de Doação & Baú Secreto',
      subtitle: 'Pedidos de vaquinha estilo doação de cartas + Baú Lendário',
      fileName: '04-cla-vaquinha-bau-secreto.svg'
    },
    {
      id: 'fp-5',
      number: '05',
      title: 'Arena Caça-Preços & Monetização',
      subtitle: 'Comparativo ao vivo Mercado Livre/Amazon/KaBuM + Tags Afiliado',
      fileName: '05-arena-precos-afiliados.svg'
    }
  ];

  readonly availableAvatars = ['🧑‍💻', '👩‍🦱', '👩‍💻', '🧔', '👰', '🕶️', '🎨', '🦸‍♂️', '👑', '🎮'];
  readonly availableCrests = ['🦁', '🚀', '🛡️', '👑', '🐉', '🥂', '🎮', '🌟'];

  readonly quickSearchChips = [
    'AirFryer Mondial 4L',
    'Fone Bluetooth JBL',
    'Kindle 16GB',
    'Controle DualSense PS5',
    'Cafeteira Nespresso',
    'Tênis Nike Corrida'
  ];

  readonly stories: StoryItem[] = [
    {
      id: 'st-1',
      userName: 'Letícia (6d)',
      avatar: '👩‍💻',
      badge: '🎂 12 Nov',
      title: 'Aniversário da Letícia em 6 dias!',
      subtitle: 'O Kindle Paperwhite da lista dela está com 19% OFF na Amazon e a vaquinha do Clã já começou!',
      targetTab: 'clans'
    },
    {
      id: 'st-2',
      userName: 'Helena (Mãe)',
      avatar: '👩‍🦱',
      badge: '🪙 64%',
      title: 'Vaquinha Secreta: Cafeteira Nespresso',
      subtitle: 'Já arrecadamos R$ 250 de R$ 389 no Clã Família Nascimento sem ela desconfiar de nada!',
      targetTab: 'feed',
      memberFilter: 'u-mae'
    },
    {
      id: 'st-3',
      userName: 'Lucas',
      avatar: '🧔',
      badge: '🔥 Épica',
      title: 'Lucas forjou uma Carta Épica!',
      subtitle: 'Controle DualSense PS5 Midnight Black com 26% de desconto na KaBuM!',
      targetTab: 'feed',
      memberFilter: 'u-lucas'
    },
    {
      id: 'st-4',
      userName: 'Baú Secreto',
      avatar: '🧰',
      badge: '🎲 Abrir',
      title: 'Baú Lendário de Amigo Secreto!',
      subtitle: 'Toque para abrir o seu Baú de Amigo Secreto no Clã sem ninguém ver.',
      targetTab: 'clans'
    },
    {
      id: 'st-5',
      userName: 'Caça-Preços',
      avatar: '🔍',
      badge: '⚡ Ao Vivo',
      title: 'Busca Real de Preços Ativa!',
      subtitle: 'Pesquise qualquer produto no Mercado Livre e compare com links de afiliado.',
      targetTab: 'arena'
    }
  ];

  ngOnInit(): void {
    const aff = this.giftService.affiliateConfig();
    this.affAmazon = aff.amazonTag;
    this.affMercadoLivre = aff.mercadoLivreMattTool;
    this.affShopee = aff.shopeeAffiliateId;
    this.affMagalu = aff.magaluPartnerId;
    this.affKabum = aff.kabumAffiliateTag;
    void this.runArenaSearch();
  }

  setTab(tab: ProductTab): void {
    this.activeTab.set(tab);
    if (tab === 'clans' && this.applyClanThemeAutomatically()) {
      this.themeService.setClanThemeOverride(this.giftService.activeClan().themeId);
    } else {
      this.themeService.setClanThemeOverride(null);
    }
  }

  openStory(story: StoryItem): void {
    this.activeStory.set(story);
  }

  triggerStoryAction(story: StoryItem): void {
    this.activeStory.set(null);
    if (story.memberFilter) {
      this.giftService.selectedMemberFilter.set(story.memberFilter);
    }
    this.setTab(story.targetTab);
  }

  getRarityLabel(priority: 'alta' | 'media' | 'sonho'): string {
    if (priority === 'sonho') return '🌟 LENDÁRIA';
    if (priority === 'alta') return '🔥 ÉPICA';
    return '💎 RARA';
  }

  // ===========================================================================
  // AUTENTICAÇÃO & TROCA RÁPIDA DE CONTA
  // ===========================================================================
  openAccountModal(mode: 'switch' | 'register' | 'edit' = 'switch'): void {
    this.authModalMode.set(mode);
    if (mode === 'edit') {
      const me = this.giftService.currentUser();
      this.regName = me.name;
      this.regEmail = me.email;
      this.regAvatar = me.avatar;
      this.regBirthday = me.birthday;
    } else {
      this.regName = '';
      this.regEmail = '';
      this.regAvatar = '🎁';
      this.regBirthday = '';
    }
    this.showAuthModal.set(true);
  }

  switchAccount(accountId: string): void {
    this.giftService.loginAsAccount(accountId);
    this.revealMySecretFriend.set(false);
    this.showAuthModal.set(false);
    this.showToast(`🔄 Conta ativa: ${this.giftService.currentUser().name} (Modo Sem Spoiler ajustado para este perfil!)`);
  }

  handleRegisterOrEditAccount(): void {
    if (!this.regName.trim()) return;
    if (this.authModalMode() === 'edit') {
      this.giftService.updateMyProfile(this.regName, this.regEmail, this.regAvatar, this.regBirthday);
      this.showToast('✅ Perfil atualizado com sucesso!');
    } else {
      const created = this.giftService.registerNewAccount(
        this.regName,
        this.regEmail || `${this.regName.toLowerCase().replace(/\s+/g, '.')}@smartgift.app`,
        this.regAvatar,
        this.regBirthday || '15 Mai'
      );
      this.showToast(`🎉 Conta criada! Bem-vindo(a), ${created.name}!`);
    }
    this.showAuthModal.set(false);
  }

  // ===========================================================================
  // FORJAR CARTA & BUSCA REAL DE PREÇOS (MERCADO LIVRE API)
  // ===========================================================================
  async searchForgeCandidates(chipQuery?: string): Promise<void> {
    if (chipQuery) {
      this.forgeInput = chipQuery;
    }
    if (!this.forgeInput.trim()) return;

    this.isSearchingForge.set(true);
    try {
      const results = await this.giftService.searchLiveProducts(this.forgeInput, this.forgeCustomTitle);
      this.forgeLiveResults.set(results);
    } finally {
      this.isSearchingForge.set(false);
    }
  }

  async forgeDirectlyFromInput(): Promise<void> {
    if (!this.forgeInput.trim()) return;
    this.isSearchingForge.set(true);
    try {
      const created = await this.giftService.createWishFromUrlOrSearch(
        this.forgeInput,
        this.forgeCustomTitle,
        this.forgeNotes,
        this.forgePriority
      );
      this.expandedOffersMap.update(m => ({ ...m, [created.id]: true }));
      this.forgeInput = '';
      this.forgeCustomTitle = '';
      this.forgeNotes = '';
      this.forgeLiveResults.set([]);
      this.showToast(`🃏 Carta "${created.title}" forjada no seu Deck por R$ ${this.formatCurrency(created.lowestPrice)}!`);
    } finally {
      this.isSearchingForge.set(false);
    }
  }

  pickCandidateToDeck(candidate: LiveSearchResult): void {
    const created = this.giftService.addLiveResultToMyDeck(
      candidate,
      this.forgeNotes,
      this.forgePriority,
      this.forgeCustomTitle
    );
    this.expandedOffersMap.update(m => ({ ...m, [created.id]: true }));
    this.forgeInput = '';
    this.forgeCustomTitle = '';
    this.forgeNotes = '';
    this.forgeLiveResults.set([]);
    this.showToast(`🃏 Carta "${created.title}" adicionada ao seu Deck!`);
  }

  openEditWishModal(item: WishItem): void {
    this.editingItem.set(item);
    this.editTitle = item.title;
    this.editNotes = item.notesFromOwner;
    this.editPriority = item.priority;
  }

  saveWishEdits(): void {
    const item = this.editingItem();
    if (!item) return;
    this.giftService.updateWishItem(item.id, this.editTitle, this.editNotes, this.editPriority);
    this.editingItem.set(null);
    this.showToast('✅ Carta atualizada!');
  }

  removeWish(itemId: string): void {
    this.giftService.deleteWishItem(itemId);
    this.showToast('🗑️ Carta removida do seu Deck.');
  }

  async refreshSingleItemPrices(itemId: string): Promise<void> {
    this.refreshingItemId.set(itemId);
    try {
      await this.giftService.refreshWishPrices(itemId);
      this.showToast('✅ Preços atualizados em tempo real!');
    } finally {
      this.refreshingItemId.set(null);
    }
  }

  // ===========================================================================
  // ARENA CAÇA-PREÇOS AO VIVO
  // ===========================================================================
  async runArenaSearch(chip?: string): Promise<void> {
    if (chip) {
      this.arenaQuery = chip;
    }
    if (!this.arenaQuery.trim()) return;
    this.isSearchingArena.set(true);
    try {
      const list = await this.giftService.searchLiveProducts(this.arenaQuery);
      this.arenaResults.set(list);
    } finally {
      this.isSearchingArena.set(false);
    }
  }

  addArenaResultToDeck(res: LiveSearchResult): void {
    const created = this.giftService.addLiveResultToMyDeck(res, 'Encontrado na Arena Caça-Preços', 'alta');
    this.showToast(`🃏 "${created.title}" adicionado ao seu Deck!`);
    this.setTab('deck');
  }

  // ===========================================================================
  // INTERAÇÕES SOCIAIS (RESERVA SECRETA, VAQUINHA, CHAT SECRETO)
  // ===========================================================================
  toggleOffers(itemId: string): void {
    this.expandedOffersMap.update(m => ({ ...m, [itemId]: !m[itemId] }));
  }

  isOffersExpanded(itemId: string): boolean {
    return !!this.expandedOffersMap()[itemId];
  }

  contributePreset(itemId: string, amount: number): void {
    this.giftService.contributeToSecretPool(itemId, amount);
    this.showToast(`🪙 Você doou +R$ ${amount} na vaquinha secreta!`);
  }

  contributeCustom(itemId: string): void {
    const val = Number(this.customContributionAmount[itemId]);
    if (!val || val <= 0) return;
    this.giftService.contributeToSecretPool(itemId, val);
    this.customContributionAmount[itemId] = 0;
    this.showToast(`🪙 Doação secreta de R$ ${this.formatCurrency(val)} registrada!`);
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

  // ===========================================================================
  // CLÃS, CÓDIGO DE CONVITE E BAÚ DE AMIGO SECRETO
  // ===========================================================================
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

  handleJoinClanByCode(): void {
    const res = this.giftService.joinClanByInviteCode(this.inviteCodeInput);
    this.showToast(res.message);
    if (res.ok) {
      this.inviteCodeInput = '';
    }
  }

  copyClanInviteCode(code: string): void {
    navigator.clipboard?.writeText(code);
    this.showToast(`📋 Código ${code} copiado para enviar no WhatsApp!`);
  }

  handleCreateClan(): void {
    if (!this.newClanName.trim()) return;
    const created = this.giftService.createNewClan(
      this.newClanName.trim(),
      this.newClanIcon,
      this.newClanMotto.trim(),
      this.newClanTheme,
      this.newClanBudget
    );
    this.newClanName = '';
    this.newClanMotto = '';
    this.showCreateClanModal.set(false);
    this.showToast(`🏰 Clã "${created.name}" fundado! Código: ${created.inviteCode}`);
  }

  handleAddClanEvent(): void {
    if (!this.newEventTitle.trim()) return;
    this.giftService.addClanEvent(
      this.giftService.activeClan().id,
      this.newEventTitle,
      this.newEventDateLabel,
      this.newEventDays
    );
    this.newEventTitle = '';
    this.newEventDateLabel = '';
    this.showNewEventModal.set(false);
    this.showToast('📅 Evento adicionado ao mural do Clã!');
  }

  getMySecretSantaTarget() {
    const clan = this.giftService.activeClan();
    const myId = this.giftService.currentUser().id;
    return clan.secretSantaPairs.find(p => p.giverId === myId);
  }

  goToMemberWishlist(memberId: string): void {
    if (memberId === this.giftService.currentUser().id) {
      this.setTab('deck');
    } else {
      this.giftService.selectedMemberFilter.set(memberId);
      this.setTab('feed');
    }
  }

  // ===========================================================================
  // AFILIADOS & EXPORTAÇÃO DE CAMADAS PARA O FIGMA
  // ===========================================================================
  saveAffiliateConfig(): void {
    this.giftService.updateAffiliateConfig({
      amazonTag: this.affAmazon.trim() || 'smartgift-20',
      mercadoLivreMattTool: this.affMercadoLivre.trim() || 'smartgift_br',
      shopeeAffiliateId: this.affShopee.trim() || 'br_smartgift',
      magaluPartnerId: this.affMagalu.trim() || 'parceirosmartgift',
      kabumAffiliateTag: this.affKabum.trim() || 'smartgift_kabum'
    });
    this.showToast('💰 Tags de Afiliado salvas! Todos os botões de loja agora usam seus códigos.');
  }

  async copyFigmaSvgToClipboard(proto: FigmaScreenProto): Promise<void> {
    try {
      const response = await fetch(`/figma-prototypes/${proto.fileName}`);
      if (response.ok) {
        const svgText = await response.text();
        await navigator.clipboard.writeText(svgText);
        this.showToast(`📋 Camadas de "${proto.title}" copiadas! Abra o Figma e aperte Ctrl+V.`);
        return;
      }
    } catch {
      // fallback
    }
    this.showToast(`📐 Arquivo SVG disponível em figma-prototypes/${proto.fileName}`);
  }

  formatCurrency(value: number): string {
    return (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      if (this.toastMessage() === msg) {
        this.toastMessage.set(null);
      }
    }, 5000);
  }
}