import { Injectable, computed, signal } from '@angular/core';
import {
  AffiliateConfig,
  Clan,
  StoreOffer,
  UserProfile,
  WishItem
} from '../models/smartgift.model';

export interface SupabaseTableStat {
  tableName: string;
  category: 'Público / Core' | 'Clãs & Eventos' | 'Blindagem Sem Spoiler';
  pkFkSummary: string;
  description: string;
  rlsRule: string;
  rowCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseDbService {
  readonly projectRef = 'wycooetrpwcgfdnhifcb';
  readonly projectRegion = 'sa-east-1 (São Paulo, Brasil)';
  readonly region = this.projectRegion;
  readonly supabaseUrl = 'https://wycooetrpwcgfdnhifcb.supabase.co';
  readonly supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5Y29vZXRycHdjZ2ZkbmhpZmNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5ODY3NDIsImV4cCI6MjEwOTU2Mjc0Mn0.llwONT0r4IaSA_bgHt9hMGmIJW37664t-dRiHYKU99o';

  readonly connectionStatus = signal<'connecting' | 'connected' | 'offline'>('connecting');
  readonly isSyncing = signal<boolean>(false);
  readonly lastSyncLabel = signal<string>('Sincronizado agora');
  readonly lastSyncAt = this.lastSyncLabel;
  readonly isConnected = computed(() => this.connectionStatus() === 'connected');

  readonly tableStats = signal<SupabaseTableStat[]>([
    {
      tableName: 'profiles',
      category: 'Público / Core',
      pkFkSummary: 'PK: id (TEXT) • UNIQUE(email)',
      description: 'Contas de usuários, nível, XP e aniversário',
      rlsRule: 'Leitura pública para membros; escrita pelo próprio dono',
      rowCount: 4
    },
    {
      tableName: 'affiliate_configs',
      category: 'Público / Core',
      pkFkSummary: 'PK: id (UUID) • FK: owner_id → profiles(id)',
      description: 'IDs de comissão Amazon, ML, Shopee, Magalu e KaBuM!',
      rlsRule: '1:1 por usuário para injeção automática de tags nas lojas',
      rowCount: 1
    },
    {
      tableName: 'wish_items',
      category: 'Público / Core',
      pkFkSummary: 'PK: id (TEXT) • FK: owner_id → profiles(id)',
      description: 'Cartas do Deck de desejos e menor preço consolidado',
      rlsRule: 'Visível no Feed/Deck sem expor reservas ou vaquinhas',
      rowCount: 5
    },
    {
      tableName: 'store_offers',
      category: 'Público / Core',
      pkFkSummary: 'PK: id (UUID) • FK: wish_item_id → wish_items(id)',
      description: 'Ofertas normalizadas (1:N) por loja para cada presente',
      rlsRule: 'Ordenado por menor preço real com flag is_cheapest',
      rowCount: 12
    },
    {
      tableName: 'clans',
      category: 'Clãs & Eventos',
      pkFkSummary: 'PK: id (TEXT) • UNIQUE(invite_code) • FK: owner_id',
      description: 'Clãs de família e amigos com código #CONVITE',
      rlsRule: 'Acesso por código de convite e membros do clã',
      rowCount: 2
    },
    {
      tableName: 'clan_members',
      category: 'Clãs & Eventos',
      pkFkSummary: 'PK: (clan_id, user_id) • FK → clans, profiles',
      description: 'Tabela associativa N:N entre usuários e clãs',
      rlsRule: 'Controla papéis (Líder, Ancião, Membro) no clã',
      rowCount: 7
    },
    {
      tableName: 'clan_events',
      category: 'Clãs & Eventos',
      pkFkSummary: 'PK: id (TEXT) • FK: clan_id → clans(id)',
      description: 'Calendário de aniversários, natal e datas do clã',
      rlsRule: 'Visível para todos os integrantes do respectivo clã',
      rowCount: 4
    },
    {
      tableName: 'secret_santa_pairs',
      category: 'Clãs & Eventos',
      pkFkSummary: 'PK: id (UUID) • FK: giver_id, receiver_id • CHECK(giver <> receiver)',
      description: 'Pares sorteados no Baú Lendário de Amigo Secreto',
      rlsRule: 'Apenas o próprio giver_id pode revelar quem tirou',
      rowCount: 4
    },
    {
      tableName: 'secret_reservations',
      category: 'Blindagem Sem Spoiler',
      pkFkSummary: 'PK: id (UUID) • FK: wish_item_id, wish_owner_id, reserved_by_user_id',
      description: 'Reserva individual oculta para o dono do presente',
      rlsRule: 'BLOQUEADO se current_user = wish_owner_id (Zero Spoiler)',
      rowCount: 5
    },
    {
      tableName: 'secret_pools',
      category: 'Blindagem Sem Spoiler',
      pkFkSummary: 'PK: id (UUID) • FK: wish_item_id, wish_owner_id',
      description: 'Vaquinhas em grupo ocultas para o dono do presente',
      rlsRule: 'BLOQUEADO se current_user = wish_owner_id (Zero Spoiler)',
      rowCount: 3
    },
    {
      tableName: 'pool_contributions',
      category: 'Blindagem Sem Spoiler',
      pkFkSummary: 'PK: id (UUID) • FK: pool_id → secret_pools(id), contributor_user_id',
      description: 'Doações individuais (1:N) nas vaquinhas secretas',
      rlsRule: 'BLOQUEADO se current_user = wish_owner_id (Zero Spoiler)',
      rowCount: 6
    },
    {
      tableName: 'secret_comments',
      category: 'Blindagem Sem Spoiler',
      pkFkSummary: 'PK: id (TEXT) • FK: wish_item_id, author_user_id',
      description: 'Chat secreto entre amigos dentro de cada carta',
      rlsRule: 'BLOQUEADO se current_user = wish_owner_id (Zero Spoiler)',
      rowCount: 3
    }
  ]);

  readonly totalRowsCount = computed(() =>
    this.tableStats().reduce((acc, item) => acc + item.rowCount, 0)
  );

  private get headers(): Record<string, string> {
    return {
      apikey: this.supabaseKey,
      Authorization: `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation,resolution=merge-duplicates'
    };
  }

  async verifyConnectionAndStats(): Promise<boolean> {
    this.connectionStatus.set('connecting');
    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/profiles?select=id`, {
        headers: this.headers
      });
      if (!res.ok) {
        this.connectionStatus.set('offline');
        return false;
      }

      this.connectionStatus.set('connected');
      this.markSynced();
      void this.refreshTableCounts();
      return true;
    } catch {
      this.connectionStatus.set('offline');
      return false;
    }
  }

  async refreshTableCounts(): Promise<void> {
    this.isSyncing.set(true);
    const current = this.tableStats();
    const updated: SupabaseTableStat[] = [];

    try {
      for (const stat of current) {
        try {
          const res = await fetch(`${this.supabaseUrl}/rest/v1/${stat.tableName}?select=*`, {
            headers: {
              apikey: this.supabaseKey,
              Authorization: `Bearer ${this.supabaseKey}`,
              Prefer: 'count=exact'
            }
          });
          if (res.ok) {
            const rows = await res.json();
            updated.push({
              ...stat,
              rowCount: Array.isArray(rows) ? rows.length : stat.rowCount
            });
          } else {
            updated.push(stat);
          }
        } catch {
          updated.push(stat);
        }
      }

      this.tableStats.set(updated);
      this.connectionStatus.set('connected');
      this.markSynced();
    } finally {
      this.isSyncing.set(false);
    }
  }

  async upsertProfile(user: UserProfile): Promise<void> {
    await this.safePost('profiles', {
      id: user.id,
      display_name: user.name,
      email: user.email,
      avatar: user.avatar,
      birthday_label: user.birthday,
      level: user.level,
      xp: user.xp,
      xp_next_level: user.xpNextLevel
    });
  }

  async upsertAffiliateConfig(ownerId: string, config: AffiliateConfig): Promise<void> {
    await this.safePost('affiliate_configs?on_conflict=owner_id', {
      owner_id: ownerId,
      amazon_tag: config.amazonTag,
      mercadolivre_matt_tool: config.mercadoLivreMattTool,
      shopee_affiliate_id: config.shopeeAffiliateId,
      magalu_partner_id: config.magaluPartnerId,
      kabum_affiliate_tag: config.kabumAffiliateTag
    });
  }

  async insertWishWithOffers(item: WishItem): Promise<void> {
    await this.safePost('wish_items', {
      id: item.id,
      owner_id: item.ownerId,
      title: item.title,
      category: item.category,
      image_url: item.imageUrl,
      original_url: item.originalUrl,
      priority: item.priority,
      notes_from_owner: item.notesFromOwner,
      lowest_price: item.lowestPrice,
      highest_price: item.highestPrice,
      savings_amount: item.savingsAmount,
      savings_percent: item.savingsPercent,
      price_history_label: item.priceHistoryLabel
    });

    await this.safePost('secret_reservations?on_conflict=wish_item_id', {
      wish_item_id: item.id,
      wish_owner_id: item.ownerId,
      status: item.secretStatus
    });

    if (item.offers?.length) {
      const offerRows = item.offers.map((of: StoreOffer) => ({
        wish_item_id: item.id,
        store_name: of.store,
        store_logo: of.storeLogo,
        price: of.price,
        original_price: of.originalPrice ?? of.price,
        installments: of.installments,
        free_shipping: of.freeShipping,
        offer_url: of.url,
        is_cheapest: !!of.isCheapest,
        last_checked: of.lastChecked,
        seller_name: of.sellerName ?? null
      }));
      await this.safePost('store_offers', offerRows);
    }

    void this.refreshTableCounts();
  }

  async deleteWish(itemId: string): Promise<void> {
    try {
      await fetch(`${this.supabaseUrl}/rest/v1/wish_items?id=eq.${encodeURIComponent(itemId)}`, {
        method: 'DELETE',
        headers: this.headers
      });
      this.markSynced();
      void this.refreshTableCounts();
    } catch {
      // fallback local
    }
  }

  async syncSecretReservation(item: WishItem): Promise<void> {
    await this.safePost('secret_reservations?on_conflict=wish_item_id', {
      wish_item_id: item.id,
      wish_owner_id: item.ownerId,
      reserved_by_user_id: item.reservedByUserId ?? null,
      reserved_by_name: item.reservedByName ?? null,
      status: item.secretStatus
    });
  }

  async syncPoolContribution(
    item: WishItem,
    contributorId: string,
    contributorName: string,
    contributorAvatar: string,
    amount: number
  ): Promise<void> {
    if (!item.secretPool) return;
    try {
      const poolRes = await fetch(`${this.supabaseUrl}/rest/v1/secret_pools?on_conflict=wish_item_id`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          wish_item_id: item.id,
          wish_owner_id: item.ownerId,
          target_amount: item.secretPool.targetAmount,
          collected_amount: item.secretPool.collectedAmount
        })
      });

      if (poolRes.ok) {
        const pools = await poolRes.json();
        const poolId = pools?.[0]?.id;
        if (poolId) {
          await this.safePost('pool_contributions', {
            pool_id: poolId,
            wish_item_id: item.id,
            wish_owner_id: item.ownerId,
            contributor_user_id: contributorId,
            contributor_name: contributorName,
            contributor_avatar: contributorAvatar,
            amount,
            created_label: 'Agora mesmo'
          });
        }
      }
      void this.refreshTableCounts();
    } catch {
      // fallback local
    }
  }

  async insertSecretComment(
    commentId: string,
    item: WishItem,
    authorId: string,
    authorName: string,
    authorAvatar: string,
    message: string
  ): Promise<void> {
    await this.safePost('secret_comments', {
      id: commentId,
      wish_item_id: item.id,
      wish_owner_id: item.ownerId,
      author_user_id: authorId,
      author_name: authorName,
      author_avatar: authorAvatar,
      message,
      created_label: 'Agora mesmo'
    });
    void this.refreshTableCounts();
  }

  async insertClan(clan: Clan, ownerId: string): Promise<void> {
    await this.safePost('clans', {
      id: clan.id,
      name: clan.name,
      invite_code: clan.inviteCode,
      crest_icon: clan.crestIcon,
      motto: clan.motto,
      level: clan.level,
      xp_progress: clan.xpProgress,
      theme_id: clan.themeId,
      secret_santa_budget: clan.secretSantaBudget,
      secret_santa_drawn: clan.secretSantaDrawn,
      owner_id: ownerId
    });

    await this.safePost('clan_members?on_conflict=clan_id,user_id', {
      clan_id: clan.id,
      user_id: ownerId,
      role: 'Líder / Fundador',
      relation_label: 'Fundador'
    });
    void this.refreshTableCounts();
  }

  private async safePost(endpoint: string, payload: unknown): Promise<void> {
    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/${endpoint}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.connectionStatus.set('connected');
        this.markSynced();
      }
    } catch {
      // preserva funcionamento local se sem internet
    }
  }

  private markSynced(): void {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    this.lastSyncLabel.set(`Sincronizado às ${hh}:${mm}:${ss}`);
  }
}
