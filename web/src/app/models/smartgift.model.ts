import { PersonalThemeId } from '../services/theme.service';

export type StoreName = 'Amazon' | 'Mercado Livre' | 'Magalu' | 'Shopee' | 'KaBuM!';

export interface StoreOffer {
  store: StoreName;
  storeLogo: string;
  price: number;
  originalPrice?: number;
  installments: string;
  freeShipping: boolean;
  url: string;
  isCheapest?: boolean;
  lastChecked: string;
}

export interface SecretContribution {
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  createdAt: string;
}

export interface SecretPool {
  targetAmount: number;
  collectedAmount: number;
  contributions: SecretContribution[];
}

export interface SecretComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface WishItem {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  category: string;
  imageUrl: string;
  originalUrl: string;
  priority: 'alta' | 'media' | 'sonho';
  notesFromOwner: string;
  lowestPrice: number;
  highestPrice: number;
  savingsAmount: number;
  savingsPercent: number;
  priceHistoryLabel: string;
  offers: StoreOffer[];
  // Dados secretos (nunca visíveis para o dono da lista!)
  secretStatus: 'disponivel' | 'reservado' | 'vaquinha_ativa' | 'comprado';
  reservedByUserId?: string;
  reservedByName?: string;
  secretPool?: SecretPool;
  secretComments: SecretComment[];
}

export interface ClanMember {
  id: string;
  name: string;
  role: 'Líder / Fundador' | 'Guardião' | 'Membro';
  avatar: string;
  birthday: string;
  wishlistCount: number;
  relation: string;
}

export interface ClanEvent {
  id: string;
  title: string;
  dateLabel: string;
  daysRemaining: number;
  type: 'aniversario' | 'natal' | 'casamento' | 'confraternizacao';
  honoreeMemberId?: string;
  honoreeName?: string;
}

export interface SecretSantaPair {
  giverId: string;
  giverName: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
}

export interface Clan {
  id: string;
  name: string;
  inviteCode: string;
  crestIcon: string;
  motto: string;
  level: number;
  xpProgress: number;
  themeId: PersonalThemeId;
  members: ClanMember[];
  events: ClanEvent[];
  secretSantaBudget: number;
  secretSantaDrawn: boolean;
  secretSantaPairs: SecretSantaPair[];
}
