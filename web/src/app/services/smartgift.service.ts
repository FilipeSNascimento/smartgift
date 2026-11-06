import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  AffiliateConfig,
  Clan,
  LiveSearchResult,
  UserProfile,
  WishItem
} from '../models/smartgift.model';
import { PersonalThemeId } from './theme.service';
import { PriceSearchService } from './price-search.service';
import { SupabaseDbService } from './supabase-db.service';

const STORAGE_KEY = 'smartgift_prod_state_v2';

interface PersistedState {
  currentUserId: string;
  accounts: UserProfile[];
  clans: Clan[];
  wishItems: WishItem[];
  affiliateConfig: AffiliateConfig;
}

@Injectable({
  providedIn: 'root'
})
export class SmartGiftService {
  private readonly priceSearch = inject(PriceSearchService);
  readonly supabaseDb = inject(SupabaseDbService);

  readonly accounts = signal<UserProfile[]>([
    {
      id: 'u-filipe',
      name: 'Filipe Nascimento',
      email: 'filipe@smartgift.app',
      avatar: '🧑‍💻',
      birthday: '14 Ago',
      level: 12,
      xp: 840,
      xpNextLevel: 1000
    },
    {
      id: 'u-mae',
      name: 'Helena (Mãe)',
      email: 'helena@familia.com',
      avatar: '👩‍🦱',
      birthday: '22 Nov',
      level: 9,
      xp: 620,
      xpNextLevel: 1000
    },
    {
      id: 'u-leticia',
      name: 'Letícia Rocha',
      email: 'leticia@engenharia.edu',
      avatar: '👩‍💻',
      birthday: '12 Nov',
      level: 10,
      xp: 750,
      xpNextLevel: 1000
    },
    {
      id: 'u-lucas',
      name: 'Lucas (Irmão)',
      email: 'lucas@gamer.com',
      avatar: '🧔',
      birthday: '05 Dez',
      level: 8,
      xp: 490,
      xpNextLevel: 1000
    }
  ]);

  readonly currentUserId = signal<string>('u-filipe');

  readonly currentUser = computed<UserProfile>(() => {
    const id = this.currentUserId();
    return this.accounts().find(a => a.id === id) ?? this.accounts()[0];
  });

  readonly affiliateConfig = signal<AffiliateConfig>({
    amazonTag: 'smartgift-20',
    mercadoLivreMattTool: 'smartgift_br',
    shopeeAffiliateId: 'br_smartgift',
    magaluPartnerId: 'parceirosmartgift',
    kabumAffiliateTag: 'smartgift_kabum'
  });

  readonly selectedClanId = signal<string>('clan-familia');
  readonly selectedMemberFilter = signal<string>('all');

  readonly clans = signal<Clan[]>(this.getDefaultClans());
  readonly wishItems = signal<WishItem[]>(this.getDefaultWishes());

  readonly activeClan = computed(() => {
    const id = this.selectedClanId();
    return this.clans().find(c => c.id === id) ?? this.clans()[0];
  });

  readonly myWishlist = computed(() =>
    this.wishItems().filter(item => item.ownerId === this.currentUser().id)
  );

  readonly friendsWishlist = computed(() => {
    const filter = this.selectedMemberFilter();
    const others = this.wishItems().filter(item => item.ownerId !== this.currentUser().id);
    if (filter === 'all') {
      return others;
    }
    return others.filter(item => item.ownerId === filter);
  });

  readonly totalSavingsFound = computed(() =>
    this.wishItems().reduce((acc, item) => acc + item.savingsAmount, 0)
  );

  constructor() {
    this.loadFromStorage();
    void this.supabaseDb.verifyConnectionAndStats();

    effect(() => {
      const state: PersistedState = {
        currentUserId: this.currentUserId(),
        accounts: this.accounts(),
        clans: this.clans(),
        wishItems: this.wishItems(),
        affiliateConfig: this.affiliateConfig()
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignora erro caso quota de storage esteja indisponível
      }
    });
  }

  canSeeSecrets(item: WishItem): boolean {
    return item.ownerId !== this.currentUser().id;
  }

  loginAsAccount(accountId: string): void {
    if (this.accounts().some(a => a.id === accountId)) {
      this.currentUserId.set(accountId);
      this.selectedMemberFilter.set('all');
    }
  }

  registerNewAccount(name: string, email: string, avatar: string, birthday: string): UserProfile {
    const newUser: UserProfile = {
      id: 'u-' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      avatar: avatar || '🎁',
      birthday: birthday.trim() || '10 Jan',
      level: 1,
      xp: 120,
      xpNextLevel: 500
    };
    this.accounts.update(list => [...list, newUser]);
    this.currentUserId.set(newUser.id);
    void this.supabaseDb.upsertProfile(newUser);

    const activeId = this.selectedClanId();
    this.clans.update(list =>
      list.map(c =>
        c.id !== activeId
          ? c
          : {
              ...c,
              members: [
                ...c.members,
                {
                  id: newUser.id,
                  name: newUser.name,
                  role: 'Membro',
                  avatar: newUser.avatar,
                  birthday: newUser.birthday,
                  wishlistCount: 0,
                  relation: 'Membro'
                }
              ]
            }
      )
    );
    return newUser;
  }

  updateMyProfile(name: string, email: string, avatar: string, birthday: string): void {
    const myId = this.currentUser().id;
    this.accounts.update(list =>
      list.map(acc =>
        acc.id === myId
          ? { ...acc, name: name.trim() || acc.name, email: email.trim() || acc.email, avatar: avatar || acc.avatar, birthday: birthday.trim() || acc.birthday }
          : acc
      )
    );
    this.wishItems.update(items =>
      items.map(w => (w.ownerId === myId ? { ...w, ownerName: name.trim() || w.ownerName, ownerAvatar: avatar } : w))
    );
    void this.supabaseDb.upsertProfile(this.currentUser());
  }

  updateAffiliateConfig(config: AffiliateConfig): void {
    this.affiliateConfig.set({ ...config });
    void this.supabaseDb.upsertAffiliateConfig(this.currentUser().id, config);
  }

  async searchLiveProducts(queryOrUrl: string, customTitle?: string): Promise<LiveSearchResult[]> {
    return this.priceSearch.searchLiveProducts(queryOrUrl, this.affiliateConfig(), customTitle);
  }

  async createWishFromUrlOrSearch(
    rawUrlOrQuery: string,
    customTitle?: string,
    customNotes?: string,
    priority: 'alta' | 'media' | 'sonho' = 'alta'
  ): Promise<WishItem> {
    const results = await this.searchLiveProducts(rawUrlOrQuery, customTitle);
    const chosen = results[0];
    return this.addLiveResultToMyDeck(chosen, customNotes, priority, customTitle);
  }

  addLiveResultToMyDeck(
    result: LiveSearchResult,
    customNotes?: string,
    priority: 'alta' | 'media' | 'sonho' = 'alta',
    customTitle?: string
  ): WishItem {
    const user = this.currentUser();
    const newItem: WishItem = {
      id: 'w-' + Date.now(),
      ownerId: user.id,
      ownerName: user.name,
      ownerAvatar: user.avatar,
      title: customTitle?.trim() || result.title,
      category: result.category,
      imageUrl: result.imageUrl,
      originalUrl: result.permalink,
      priority,
      notesFromOwner: customNotes?.trim() || 'Adicionado com busca de preço em tempo real.',
      lowestPrice: result.lowestPrice,
      highestPrice: result.highestPrice,
      savingsAmount: result.savingsAmount,
      savingsPercent: result.savingsPercent,
      priceHistoryLabel: `🔥 Economia real de R$ ${result.savingsAmount.toFixed(2).replace('.', ',')} (-${result.savingsPercent}%)`,
      offers: result.offers,
      secretStatus: 'disponivel',
      secretComments: []
    };

    this.wishItems.update(list => [newItem, ...list]);
    this.rewardXp(40);
    void this.supabaseDb.insertWishWithOffers(newItem);
    return newItem;
  }

  updateWishItem(
    itemId: string,
    title: string,
    notesFromOwner: string,
    priority: 'alta' | 'media' | 'sonho'
  ): void {
    this.wishItems.update(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              title: title.trim() || item.title,
              notesFromOwner: notesFromOwner.trim(),
              priority
            }
          : item
      )
    );
    const updated = this.wishItems().find(i => i.id === itemId);
    if (updated) {
      void this.supabaseDb.insertWishWithOffers(updated);
    }
  }

  deleteWishItem(itemId: string): void {
    this.wishItems.update(items => items.filter(item => item.id !== itemId));
    void this.supabaseDb.deleteWish(itemId);
  }

  async refreshWishPrices(itemId: string): Promise<void> {
    const target = this.wishItems().find(i => i.id === itemId);
    if (!target) return;

    const results = await this.searchLiveProducts(target.title);
    if (results.length === 0) return;

    const best = results[0];
    this.wishItems.update(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              lowestPrice: best.lowestPrice,
              highestPrice: best.highestPrice,
              savingsAmount: best.savingsAmount,
              savingsPercent: best.savingsPercent,
              offers: best.offers,
              imageUrl: best.imageUrl || item.imageUrl,
              priceHistoryLabel: `✅ Atualizado agora: Menor preço R$ ${best.lowestPrice.toFixed(2).replace('.', ',')}`
            }
          : item
      )
    );
  }

  toggleSecretReservation(itemId: string): void {
    const user = this.currentUser();
    this.wishItems.update(items =>
      items.map(item => {
        if (item.id !== itemId || item.ownerId === user.id) return item;
        if (item.secretStatus === 'reservado' && item.reservedByUserId === user.id) {
          const liberated: WishItem = {
            ...item,
            secretStatus: 'disponivel',
            reservedByUserId: undefined,
            reservedByName: undefined
          };
          void this.supabaseDb.syncSecretReservation(liberated);
          return liberated;
        }
        this.rewardXp(25);
        const reserved: WishItem = {
          ...item,
          secretStatus: 'reservado',
          reservedByUserId: user.id,
          reservedByName: user.name
        };
        void this.supabaseDb.syncSecretReservation(reserved);
        return reserved;
      })
    );
  }

  contributeToSecretPool(itemId: string, amount: number): void {
    if (amount <= 0) return;
    const user = this.currentUser();
    this.wishItems.update(items =>
      items.map(item => {
        if (item.id !== itemId || item.ownerId === user.id) return item;
        const existingPool = item.secretPool ?? {
          targetAmount: item.lowestPrice,
          collectedAmount: 0,
          contributions: []
        };
        const newCollected = Number(
          Math.min(existingPool.targetAmount, existingPool.collectedAmount + amount).toFixed(2)
        );
        const isCompleted = newCollected >= existingPool.targetAmount;
        this.rewardXp(35);
        const updatedItem: WishItem = {
          ...item,
          secretStatus: isCompleted ? 'comprado' : 'vaquinha_ativa',
          secretPool: {
            ...existingPool,
            collectedAmount: newCollected,
            contributions: [
              ...existingPool.contributions,
              {
                userId: user.id,
                userName: user.name,
                userAvatar: user.avatar,
                amount,
                createdAt: 'Agora mesmo'
              }
            ]
          }
        };
        void this.supabaseDb.syncPoolContribution(updatedItem, user.id, user.name, user.avatar, amount);
        return updatedItem;
      })
    );
  }

  addSecretComment(itemId: string, text: string): void {
    const clean = text.trim();
    if (!clean) return;
    const user = this.currentUser();
    const commentId = 'c-' + Date.now();
    this.wishItems.update(items =>
      items.map(item => {
        if (item.id !== itemId || item.ownerId === user.id) return item;
        void this.supabaseDb.insertSecretComment(commentId, item, user.id, user.name, user.avatar, clean);
        return {
          ...item,
          secretComments: [
            ...item.secretComments,
            {
              id: commentId,
              authorId: user.id,
              authorName: user.name,
              authorAvatar: user.avatar,
              text: clean,
              createdAt: 'Agora mesmo'
            }
          ]
        };
      })
    );
  }

  drawSecretSanta(clanId: string): void {
    this.clans.update(clans =>
      clans.map(clan => {
        if (clan.id !== clanId || clan.members.length < 2) return clan;
        const shuffled = [...clan.members].sort(() => Math.random() - 0.5);
        const pairs = shuffled.map((giver, idx) => {
          const receiver = shuffled[(idx + 1) % shuffled.length];
          return {
            giverId: giver.id,
            giverName: giver.name,
            receiverId: receiver.id,
            receiverName: receiver.name,
            receiverAvatar: receiver.avatar
          };
        });
        return {
          ...clan,
          secretSantaDrawn: true,
          secretSantaPairs: pairs
        };
      })
    );
  }

  createNewClan(name: string, crestIcon: string, motto: string, themeId: PersonalThemeId, budget = 150): Clan {
    const code = '#' + name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) + '-' + Math.floor(10 + Math.random() * 89);
    const user = this.currentUser();
    const newClan: Clan = {
      id: 'clan-' + Date.now(),
      name,
      inviteCode: code,
      crestIcon: crestIcon || '🛡️',
      motto: motto || 'Unidos para acertar em todos os presentes!',
      level: 1,
      xpProgress: 25,
      themeId,
      secretSantaBudget: budget > 0 ? budget : 150,
      secretSantaDrawn: false,
      members: [
        {
          id: user.id,
          name: user.name,
          role: 'Líder / Fundador',
          avatar: user.avatar,
          birthday: user.birthday,
          wishlistCount: this.myWishlist().length,
          relation: 'Fundador'
        }
      ],
      events: [],
      secretSantaPairs: []
    };

    this.clans.update(list => [newClan, ...list]);
    this.selectedClanId.set(newClan.id);
    this.rewardXp(50);
    void this.supabaseDb.insertClan(newClan, user.id);
    return newClan;
  }

  joinClanByInviteCode(rawCode: string): { ok: boolean; message: string; clan?: Clan } {
    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      return { ok: false, message: 'Digite um código de convite válido (ex: #FAMILIA-NASC).' };
    }

    const withHash = normalized.startsWith('#') ? normalized : `#${normalized}`;
    const found = this.clans().find(c => c.inviteCode.toUpperCase() === withHash);

    if (!found) {
      return { ok: false, message: `Nenhum Clã encontrado com o código ${withHash}.` };
    }

    const user = this.currentUser();
    const alreadyMember = found.members.some(m => m.id === user.id);

    if (!alreadyMember) {
      this.clans.update(list =>
        list.map(c =>
          c.id !== found.id
            ? c
            : {
                ...c,
                members: [
                  ...c.members,
                  {
                    id: user.id,
                    name: user.name,
                    role: 'Membro',
                    avatar: user.avatar,
                    birthday: user.birthday,
                    wishlistCount: this.myWishlist().length,
                    relation: 'Convidado'
                  }
                ]
              }
        )
      );
    }

    this.selectedClanId.set(found.id);
    return {
      ok: true,
      message: alreadyMember
        ? `Você abriu o ${found.name}!`
        : `🎉 Você entrou no ${found.name} com sucesso!`,
      clan: found
    };
  }

  addClanEvent(clanId: string, title: string, dateLabel: string, daysRemaining: number): void {
    if (!title.trim()) return;
    this.clans.update(list =>
      list.map(c =>
        c.id !== clanId
          ? c
          : {
              ...c,
              events: [
                ...c.events,
                {
                  id: 'ev-' + Date.now(),
                  title: title.trim(),
                  dateLabel: dateLabel.trim() || 'Em breve',
                  daysRemaining: Math.max(1, Number(daysRemaining) || 10),
                  type: 'aniversario'
                }
              ]
            }
      )
    );
  }

  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.clans.set(this.getDefaultClans());
    this.wishItems.set(this.getDefaultWishes());
    this.currentUserId.set('u-filipe');
  }

  private rewardXp(points: number): void {
    const myId = this.currentUser().id;
    this.accounts.update(list =>
      list.map(a => {
        if (a.id !== myId) return a;
        let nextXp = a.xp + points;
        let nextLevel = a.level;
        if (nextXp >= a.xpNextLevel) {
          nextLevel += 1;
          nextXp = nextXp - a.xpNextLevel;
        }
        return { ...a, level: nextLevel, xp: nextXp };
      })
    );
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: PersistedState = JSON.parse(raw);
      if (parsed.accounts?.length) this.accounts.set(parsed.accounts);
      if (parsed.currentUserId) this.currentUserId.set(parsed.currentUserId);
      if (parsed.clans?.length) this.clans.set(parsed.clans);
      if (parsed.wishItems?.length) this.wishItems.set(parsed.wishItems);
      if (parsed.affiliateConfig) this.affiliateConfig.set(parsed.affiliateConfig);
    } catch {
      // Usa estado inicial padrão caso o JSON salvo seja inválido
    }
  }

  private getDefaultClans(): Clan[] {
    return [
      {
        id: 'clan-familia',
        name: 'Clã Família Nascimento',
        inviteCode: '#FAMILIA-NASC',
        crestIcon: '🦁',
        motto: 'Nenhum aniversário passa em branco e zero presentes repetidos!',
        level: 7,
        xpProgress: 82,
        themeId: 'violet',
        secretSantaBudget: 180,
        secretSantaDrawn: true,
        members: [
          { id: 'u-filipe', name: 'Filipe Nascimento', role: 'Líder / Fundador', avatar: '🧑‍💻', birthday: '14 Ago', wishlistCount: 3, relation: 'Fundador' },
          { id: 'u-mae', name: 'Helena (Mãe)', role: 'Guardião', avatar: '👩‍🦱', birthday: '22 Nov', wishlistCount: 2, relation: 'Mãe' },
          { id: 'u-lucas', name: 'Lucas (Irmão)', role: 'Membro', avatar: '🧔', birthday: '05 Dez', wishlistCount: 1, relation: 'Irmão' },
          { id: 'u-leticia', name: 'Letícia Rocha', role: 'Membro', avatar: '👩‍💻', birthday: '12 Nov', wishlistCount: 1, relation: 'Amiga' }
        ],
        events: [
          { id: 'ev-1', title: 'Aniversário da Letícia', dateLabel: '12 de Novembro', daysRemaining: 6, type: 'aniversario', honoreeMemberId: 'u-leticia', honoreeName: 'Letícia Rocha' },
          { id: 'ev-2', title: 'Aniversário da Helena (Mãe)', dateLabel: '22 de Novembro', daysRemaining: 16, type: 'aniversario', honoreeMemberId: 'u-mae', honoreeName: 'Helena (Mãe)' },
          { id: 'ev-3', title: 'Amigo Secreto de Natal', dateLabel: '24 de Dezembro', daysRemaining: 48, type: 'natal' }
        ],
        secretSantaPairs: [
          { giverId: 'u-filipe', giverName: 'Filipe Nascimento', receiverId: 'u-mae', receiverName: 'Helena (Mãe)', receiverAvatar: '👩‍🦱' },
          { giverId: 'u-mae', giverName: 'Helena (Mãe)', receiverId: 'u-lucas', receiverName: 'Lucas (Irmão)', receiverAvatar: '🧔' },
          { giverId: 'u-lucas', giverName: 'Lucas (Irmão)', receiverId: 'u-leticia', receiverName: 'Letícia Rocha', receiverAvatar: '👩‍💻' },
          { giverId: 'u-leticia', giverName: 'Letícia Rocha', receiverId: 'u-filipe', receiverName: 'Filipe Nascimento', receiverAvatar: '🧑‍💻' }
        ]
      },
      {
        id: 'clan-facul',
        name: 'Clã Squad Tech & Amigos',
        inviteCode: '#SQUAD-TECH',
        crestIcon: '🚀',
        motto: 'Presentes gamers e livros com o menor preço da web.',
        level: 5,
        xpProgress: 65,
        themeId: 'ocean',
        secretSantaBudget: 120,
        secretSantaDrawn: false,
        members: [
          { id: 'u-filipe', name: 'Filipe Nascimento', role: 'Líder / Fundador', avatar: '🧑‍💻', birthday: '14 Ago', wishlistCount: 3, relation: 'Líder' },
          { id: 'u-leticia', name: 'Letícia Rocha', role: 'Guardião', avatar: '👩‍💻', birthday: '12 Nov', wishlistCount: 1, relation: 'Squad' },
          { id: 'u-lucas', name: 'Lucas (Irmão)', role: 'Membro', avatar: '🧔', birthday: '05 Dez', wishlistCount: 1, relation: 'Squad' }
        ],
        events: [
          { id: 'ev-4', title: 'Aniversário da Letícia', dateLabel: '12 de Novembro', daysRemaining: 6, type: 'aniversario', honoreeMemberId: 'u-leticia', honoreeName: 'Letícia Rocha' }
        ],
        secretSantaPairs: []
      }
    ];
  }

  private getDefaultWishes(): WishItem[] {
    return [
      {
        id: 'w-1',
        ownerId: 'u-filipe',
        ownerName: 'Filipe Nascimento',
        ownerAvatar: '🧑‍💻',
        title: 'Fone Bluetooth Sony WH-1000XM5 Cancelamento de Ruído',
        category: 'Áudio & Smart',
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80',
        originalUrl: 'https://www.amazon.com.br/s?k=Sony+WH-1000XM5&tag=smartgift-20',
        priority: 'sonho',
        notesFromOwner: 'Cor preta de preferência! Excelente para trabalhar focado.',
        lowestPrice: 1899.90,
        highestPrice: 2399.00,
        savingsAmount: 499.10,
        savingsPercent: 21,
        priceHistoryLabel: '🔥 Menor preço verificado nas lojas (-21%)',
        offers: [
          { store: 'Mercado Livre', storeLogo: '🤝', price: 1899.90, originalPrice: 2399.00, installments: '10x de R$ 189,99 s/ juros', freeShipping: true, url: 'https://lista.mercadolivre.com.br/sony-wh-1000xm5?matt_tool=smartgift_br', isCheapest: true, lastChecked: 'Verificado' },
          { store: 'Amazon', storeLogo: '📦', price: 1989.00, originalPrice: 2399.00, installments: '10x de R$ 198,90 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br/s?k=Sony+WH-1000XM5&tag=smartgift-20', lastChecked: 'Verificado' },
          { store: 'KaBuM!', storeLogo: '💥', price: 2049.90, installments: '10x de R$ 204,99', freeShipping: true, url: 'https://www.kabum.com.br/busca/sony-wh-1000xm5?awc=smartgift_kabum', lastChecked: 'Verificado' }
        ],
        secretStatus: 'vaquinha_ativa',
        secretPool: {
          targetAmount: 1899.90,
          collectedAmount: 1350.00,
          contributions: [
            { userId: 'u-mae', userName: 'Helena (Mãe)', userAvatar: '👩‍🦱', amount: 650.00, createdAt: 'Ontem' },
            { userId: 'u-lucas', userName: 'Lucas (Irmão)', userAvatar: '🧔', amount: 400.00, createdAt: 'Ontem' },
            { userId: 'u-leticia', userName: 'Letícia Rocha', userAvatar: '👩‍💻', amount: 300.00, createdAt: 'Hoje' }
          ]
        },
        secretComments: [
          { id: 'c-1', authorId: 'u-mae', authorName: 'Helena (Mãe)', authorAvatar: '👩‍🦱', text: 'Abri a vaquinha pro aniversário do Filipe! Pelo Mercado Livre está R$ 500 mais barato.', createdAt: 'Ontem' }
        ]
      },
      {
        id: 'w-2',
        ownerId: 'u-filipe',
        ownerName: 'Filipe Nascimento',
        ownerAvatar: '🧑‍💻',
        title: 'Teclado Mecânico Sem Fio Logitech MX Mechanical Mini',
        category: 'Tecnologia & Presentes',
        imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
        originalUrl: 'https://www.kabum.com.br/busca/logitech-mx-mechanical',
        priority: 'alta',
        notesFromOwner: 'Switch Tactile Quiet (silencioso).',
        lowestPrice: 679.90,
        highestPrice: 899.90,
        savingsAmount: 220.00,
        savingsPercent: 24,
        priceHistoryLabel: '📉 Caiu R$ 80 esta semana na KaBuM!',
        offers: [
          { store: 'KaBuM!', storeLogo: '💥', price: 679.90, originalPrice: 899.90, installments: '6x de R$ 113,31 s/ juros', freeShipping: true, url: 'https://www.kabum.com.br/busca/logitech-mx-mechanical?awc=smartgift_kabum', isCheapest: true, lastChecked: 'Verificado' },
          { store: 'Amazon', storeLogo: '📦', price: 729.00, installments: '10x de R$ 72,90 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br/s?k=Logitech+MX+Mechanical+Mini&tag=smartgift-20', lastChecked: 'Verificado' }
        ],
        secretStatus: 'reservado',
        reservedByUserId: 'u-leticia',
        reservedByName: 'Letícia Rocha',
        secretComments: []
      },
      {
        id: 'w-4',
        ownerId: 'u-mae',
        ownerName: 'Helena (Mãe)',
        ownerAvatar: '👩‍🦱',
        title: 'Cafeteira Espresso Nespresso Essenza Mini Inox 110v',
        category: 'Casa & Cozinha',
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
        originalUrl: 'https://www.magazinevoce.com.br/parceirosmartgift/busca/nespresso+essenza/',
        priority: 'alta',
        notesFromOwner: 'Voltagem 110v! Cor vermelha ou preta.',
        lowestPrice: 389.00,
        highestPrice: 549.00,
        savingsAmount: 160.00,
        savingsPercent: 29,
        priceHistoryLabel: '🔥 Oferta com 29% OFF no Magalu',
        offers: [
          { store: 'Magalu', storeLogo: '🛍️', price: 389.00, originalPrice: 549.00, installments: '8x de R$ 48,62 s/ juros', freeShipping: true, url: 'https://www.magazinevoce.com.br/parceirosmartgift/busca/nespresso+essenza/', isCheapest: true, lastChecked: 'Agora' },
          { store: 'Amazon', storeLogo: '📦', price: 419.90, installments: '10x de R$ 41,99 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br/s?k=Cafeteira+Nespresso+Essenza+Mini&tag=smartgift-20', lastChecked: 'Agora' },
          { store: 'Mercado Livre', storeLogo: '🤝', price: 435.00, installments: '10x de R$ 43,50 s/ juros', freeShipping: true, url: 'https://lista.mercadolivre.com.br/nespresso-essenza-mini?matt_tool=smartgift_br', lastChecked: 'Agora' }
        ],
        secretStatus: 'vaquinha_ativa',
        secretPool: {
          targetAmount: 389.00,
          collectedAmount: 250.00,
          contributions: [
            { userId: 'u-filipe', userName: 'Filipe Nascimento', userAvatar: '🧑‍💻', amount: 150.00, createdAt: 'Hoje' },
            { userId: 'u-lucas', userName: 'Lucas (Irmão)', userAvatar: '🧔', amount: 100.00, createdAt: 'Hoje' }
          ]
        },
        secretComments: [
          { id: 'c-4', authorId: 'u-filipe', authorName: 'Filipe Nascimento', authorAvatar: '🧑‍💻', text: 'Lucas, atenção que lá em casa é 110v! Vamos fechar no Magalu que está R$ 389.', createdAt: 'Hoje às 11:00' }
        ]
      },
      {
        id: 'w-6',
        ownerId: 'u-leticia',
        ownerName: 'Letícia Rocha',
        ownerAvatar: '👩‍💻',
        title: 'Kindle Paperwhite 16GB Tela de 6,8" À Prova D\'Água',
        category: 'Leitura & Livros',
        imageUrl: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=600&q=80',
        originalUrl: 'https://www.amazon.com.br/s?k=Kindle+Paperwhite+16GB&tag=smartgift-20',
        priority: 'sonho',
        notesFromOwner: 'Versão preta ou verde sálvia!',
        lowestPrice: 649.00,
        highestPrice: 799.00,
        savingsAmount: 150.00,
        savingsPercent: 19,
        priceHistoryLabel: '🔥 Preço oficial com desconto na Amazon',
        offers: [
          { store: 'Amazon', storeLogo: '📦', price: 649.00, originalPrice: 799.00, installments: '12x de R$ 54,08 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br/s?k=Kindle+Paperwhite+16GB&tag=smartgift-20', isCheapest: true, lastChecked: 'Agora' },
          { store: 'Mercado Livre', storeLogo: '🤝', price: 689.90, installments: '10x de R$ 68,99 s/ juros', freeShipping: true, url: 'https://lista.mercadolivre.com.br/kindle-paperwhite-16gb?matt_tool=smartgift_br', lastChecked: 'Agora' }
        ],
        secretStatus: 'vaquinha_ativa',
        secretPool: {
          targetAmount: 649.00,
          collectedAmount: 200.00,
          contributions: [
            { userId: 'u-filipe', userName: 'Filipe Nascimento', userAvatar: '🧑‍💻', amount: 200.00, createdAt: 'Hoje' }
          ]
        },
        secretComments: [
          { id: 'c-5', authorId: 'u-filipe', authorName: 'Filipe Nascimento', authorAvatar: '🧑‍💻', text: 'O aniversário da Letícia é em 6 dias! Já coloquei R$ 200 na vaquinha.', createdAt: 'Hoje às 09:30' }
        ]
      },
      {
        id: 'w-7',
        ownerId: 'u-lucas',
        ownerName: 'Lucas (Irmão)',
        ownerAvatar: '🧔',
        title: 'Controle Sem Fio DualSense PlayStation 5 — Midnight Black',
        category: 'Games & Consoles',
        imageUrl: 'https://images.unsplash.com/photo-1606318801954-d46d46d3360a?auto=format&fit=crop&w=600&q=80',
        originalUrl: 'https://www.kabum.com.br/busca/dualsense-midnight-black',
        priority: 'alta',
        notesFromOwner: 'Para jogar coop no PC e no PS5.',
        lowestPrice: 349.90,
        highestPrice: 469.90,
        savingsAmount: 120.00,
        savingsPercent: 26,
        priceHistoryLabel: '🎮 Menor preço gamer na KaBuM!',
        offers: [
          { store: 'KaBuM!', storeLogo: '💥', price: 349.90, originalPrice: 469.90, installments: '10x de R$ 34,99', freeShipping: true, url: 'https://www.kabum.com.br/busca/dualsense-midnight-black?awc=smartgift_kabum', isCheapest: true, lastChecked: 'Agora' },
          { store: 'Amazon', storeLogo: '📦', price: 369.00, installments: '7x de R$ 52,71 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br/s?k=DualSense+Midnight+Black&tag=smartgift-20', lastChecked: 'Agora' }
        ],
        secretStatus: 'disponivel',
        secretComments: []
      }
    ];
  }
}
