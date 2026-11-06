import { Injectable, signal, computed } from '@angular/core';
import {
  Clan,
  StoreOffer,
  WishItem
} from '../models/smartgift.model';
import { PersonalThemeId } from './theme.service';

export type ViewPerspective = 'owner' | 'clan_friend';

@Injectable({
  providedIn: 'root'
})
export class SmartGiftService {
  readonly currentUser = signal({
    id: 'u-filipe',
    name: 'Filipe Nascimento',
    avatar: '🧑‍💻',
    birthday: '14 de Agosto'
  });

  /**
   * Simulador didático:
   * - 'owner': Visão do Dono da Lista (100% Sem Spoiler nos próprios presentes)
   * - 'clan_friend': Visão dos Amigos do Clã (Mostra reservas secretas, vaquinha e chat secreto)
   */
  readonly perspective = signal<ViewPerspective>('owner');

  readonly selectedClanId = signal<string>('clan-familia');
  readonly selectedMemberFilter = signal<string>('all');

  readonly clans = signal<Clan[]>([
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
        { id: 'u-filipe', name: 'Filipe Nascimento (Você)', role: 'Líder / Fundador', avatar: '🧑‍💻', birthday: '14 Ago', wishlistCount: 3, relation: 'Você' },
        { id: 'u-mae', name: 'Helena (Mãe)', role: 'Guardião', avatar: '👩‍🦱', birthday: '22 Nov', wishlistCount: 2, relation: 'Mãe' },
        { id: 'u-lucas', name: 'Lucas (Irmão)', role: 'Membro', avatar: '🧔', birthday: '05 Dez', wishlistCount: 2, relation: 'Irmão' },
        { id: 'u-bia', name: 'Beatriz (Prima)', role: 'Membro', avatar: '👩', birthday: '19 Jan', wishlistCount: 1, relation: 'Prima' }
      ],
      events: [
        { id: 'ev-1', title: 'Aniversário da Mãe (Helena)', dateLabel: '22 de Novembro', daysRemaining: 16, type: 'aniversario', honoreeMemberId: 'u-mae', honoreeName: 'Helena (Mãe)' },
        { id: 'ev-2', title: 'Aniversário do Lucas', dateLabel: '05 de Dezembro', daysRemaining: 29, type: 'aniversario', honoreeMemberId: 'u-lucas', honoreeName: 'Lucas (Irmão)' },
        { id: 'ev-3', title: 'Amigo Secreto de Natal da Família', dateLabel: '24 de Dezembro', daysRemaining: 48, type: 'natal' }
      ],
      secretSantaPairs: [
        { giverId: 'u-filipe', giverName: 'Filipe Nascimento', receiverId: 'u-mae', receiverName: 'Helena (Mãe)', receiverAvatar: '👩‍🦱' },
        { giverId: 'u-mae', giverName: 'Helena (Mãe)', receiverId: 'u-lucas', receiverName: 'Lucas (Irmão)', receiverAvatar: '🧔' },
        { giverId: 'u-lucas', giverName: 'Lucas (Irmão)', receiverId: 'u-bia', receiverName: 'Beatriz (Prima)', receiverAvatar: '👩' },
        { giverId: 'u-bia', giverName: 'Beatriz (Prima)', receiverId: 'u-filipe', receiverName: 'Filipe Nascimento', receiverAvatar: '🧑‍💻' }
      ]
    },
    {
      id: 'clan-facul',
      name: 'Clã Squad Engenharia & TCC',
      inviteCode: '#SQUAD-TCC26',
      crestIcon: '🚀',
      motto: 'Café, código limpo e presentes gamers no menor preço.',
      level: 5,
      xpProgress: 65,
      themeId: 'ocean',
      secretSantaBudget: 120,
      secretSantaDrawn: false,
      members: [
        { id: 'u-filipe', name: 'Filipe Nascimento (Você)', role: 'Líder / Fundador', avatar: '🧑‍💻', birthday: '14 Ago', wishlistCount: 3, relation: 'Você' },
        { id: 'u-leticia', name: 'Letícia Rocha', role: 'Guardião', avatar: '👩‍💻', birthday: '12 Nov', wishlistCount: 2, relation: 'Grupo TCC' },
        { id: 'u-marcius', name: 'Marcius Vinícius', role: 'Membro', avatar: '🕶️', birthday: '03 Fev', wishlistCount: 1, relation: 'Grupo TCC' },
        { id: 'u-sabrina', name: 'Sabrina Aparecida', role: 'Membro', avatar: '🎨', birthday: '28 Mar', wishlistCount: 1, relation: 'Grupo TCC' }
      ],
      events: [
        { id: 'ev-4', title: 'Aniversário da Letícia', dateLabel: '12 de Novembro', daysRemaining: 6, type: 'aniversario', honoreeMemberId: 'u-leticia', honoreeName: 'Letícia Rocha' },
        { id: 'ev-5', title: 'Confraternização Pós-Banca', dateLabel: '10 de Dezembro', daysRemaining: 34, type: 'confraternizacao' }
      ],
      secretSantaPairs: []
    },
    {
      id: 'clan-casamento',
      name: 'Clã Chá de Casa Nova — Bia & Rafa',
      inviteCode: '#CASANOVA-BR',
      crestIcon: '🥂',
      motto: 'Ajudando a montar o apê novo sem ninguém dar liquidificador repetido!',
      level: 4,
      xpProgress: 50,
      themeId: 'coral',
      secretSantaBudget: 250,
      secretSantaDrawn: false,
      members: [
        { id: 'u-bia', name: 'Beatriz (Noiva)', role: 'Líder / Fundador', avatar: '👰', birthday: '19 Jan', wishlistCount: 2, relation: 'Prima' },
        { id: 'u-filipe', name: 'Filipe Nascimento (Você)', role: 'Guardião', avatar: '🧑‍💻', birthday: '14 Ago', wishlistCount: 3, relation: 'Convidado' },
        { id: 'u-mae', name: 'Helena (Tia)', role: 'Membro', avatar: '👩‍🦱', birthday: '22 Nov', wishlistCount: 2, relation: 'Tia' }
      ],
      events: [
        { id: 'ev-6', title: 'Chá de Panela & Casa Nova', dateLabel: '30 de Novembro', daysRemaining: 24, type: 'casamento', honoreeMemberId: 'u-bia', honoreeName: 'Beatriz' }
      ],
      secretSantaPairs: []
    }
  ]);

  readonly wishItems = signal<WishItem[]>([
    {
      id: 'w-1',
      ownerId: 'u-filipe',
      ownerName: 'Filipe Nascimento',
      title: 'Fone Bluetooth Sony WH-1000XM5 Cancelamento de Ruído',
      category: 'Áudio & Tech',
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80',
      originalUrl: 'https://www.amazon.com.br/dp/B09XS7JWHH',
      priority: 'sonho',
      notesFromOwner: 'Cor preta de preferência! Ótimo para programar focado.',
      lowestPrice: 1899.90,
      highestPrice: 2399.00,
      savingsAmount: 499.10,
      savingsPercent: 21,
      priceHistoryLabel: '🔥 Menor preço dos últimos 45 dias!',
      offers: [
        { store: 'Mercado Livre', storeLogo: '🤝', price: 1899.90, originalPrice: 2299.00, installments: '10x de R$ 189,99 s/ juros', freeShipping: true, url: 'https://www.mercadolivre.com.br', isCheapest: true, lastChecked: 'Há 5 min' },
        { store: 'Amazon', storeLogo: '📦', price: 1989.00, originalPrice: 2399.00, installments: '10x de R$ 198,90 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br', lastChecked: 'Há 5 min' },
        { store: 'KaBuM!', storeLogo: '💥', price: 2049.90, installments: '10x de R$ 227,76', freeShipping: false, url: 'https://www.kabum.com.br', lastChecked: 'Há 8 min' },
        { store: 'Magalu', storeLogo: '🛍️', price: 2199.00, installments: '10x de R$ 219,90', freeShipping: true, url: 'https://www.magazineluiza.com.br', lastChecked: 'Há 12 min' }
      ],
      secretStatus: 'vaquinha_ativa',
      secretPool: {
        targetAmount: 1899.90,
        collectedAmount: 1350.00,
        contributions: [
          { userId: 'u-mae', userName: 'Helena (Mãe)', userAvatar: '👩‍🦱', amount: 650.00, createdAt: 'Ontem' },
          { userId: 'u-lucas', userName: 'Lucas (Irmão)', userAvatar: '🧔', amount: 400.00, createdAt: 'Ontem' },
          { userId: 'u-bia', userName: 'Beatriz (Prima)', userAvatar: '👩', amount: 300.00, createdAt: 'Hoje' }
        ]
      },
      secretComments: [
        { id: 'c-1', authorId: 'u-mae', authorName: 'Helena (Mãe)', authorAvatar: '👩‍🦱', text: 'Gente, abri a vaquinha! Pelo Mercado Livre está R$ 500 mais barato que na loja física.', createdAt: 'Ontem às 19:40' },
        { id: 'c-2', authorId: 'u-lucas', authorName: 'Lucas (Irmão)', authorAvatar: '🧔', text: 'Boa! Já coloquei R$ 400. Falta pouco pra gente fechar antes da Black Friday!', createdAt: 'Hoje às 10:15' }
      ]
    },
    {
      id: 'w-2',
      ownerId: 'u-filipe',
      ownerName: 'Filipe Nascimento',
      title: 'Teclado Mecânico Sem Fio Logitech MX Mechanical Mini',
      category: 'Periféricos',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
      originalUrl: 'https://www.kabum.com.br/produto/logitech-mx-mechanical',
      priority: 'alta',
      notesFromOwner: 'Switch Tactile Quiet (silencioso).',
      lowestPrice: 679.90,
      highestPrice: 899.90,
      savingsAmount: 220.00,
      savingsPercent: 24,
      priceHistoryLabel: '📉 Caiu R$ 80 esta semana na KaBuM!',
      offers: [
        { store: 'KaBuM!', storeLogo: '💥', price: 679.90, originalPrice: 899.90, installments: '6x de R$ 113,31 s/ juros', freeShipping: true, url: 'https://www.kabum.com.br', isCheapest: true, lastChecked: 'Agora' },
        { store: 'Amazon', storeLogo: '📦', price: 729.00, installments: '10x de R$ 72,90 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br', lastChecked: 'Há 3 min' },
        { store: 'Shopee', storeLogo: '🧡', price: 749.90, installments: '6x de R$ 124,98', freeShipping: true, url: 'https://shopee.com.br', lastChecked: 'Há 10 min' }
      ],
      secretStatus: 'reservado',
      reservedByUserId: 'u-leticia',
      reservedByName: 'Letícia Rocha',
      secretComments: [
        { id: 'c-3', authorId: 'u-leticia', authorName: 'Letícia Rocha', authorAvatar: '👩‍💻', text: 'Reservei aqui pessoal! Vou pegar na KaBuM que está com 24% de desconto.', createdAt: 'Hoje às 14:20' }
      ]
    },
    {
      id: 'w-3',
      ownerId: 'u-filipe',
      ownerName: 'Filipe Nascimento',
      title: 'Livro Arquitetura Limpa — Robert C. Martin (Uncle Bob)',
      category: 'Livros',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      originalUrl: 'https://www.amazon.com.br/dp/8550804606',
      priority: 'media',
      notesFromOwner: 'Versão física capa comum em português.',
      lowestPrice: 64.90,
      highestPrice: 98.00,
      savingsAmount: 33.10,
      savingsPercent: 34,
      priceHistoryLabel: '✅ Melhor preço na Amazon c/ Prime',
      offers: [
        { store: 'Amazon', storeLogo: '📦', price: 64.90, originalPrice: 98.00, installments: '2x de R$ 32,45 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br', isCheapest: true, lastChecked: 'Agora' },
        { store: 'Mercado Livre', storeLogo: '🤝', price: 78.50, installments: '2x de R$ 39,25', freeShipping: false, url: 'https://www.mercadolivre.com.br', lastChecked: 'Há 6 min' },
        { store: 'Magalu', storeLogo: '🛍️', price: 89.90, installments: '2x de R$ 44,95', freeShipping: false, url: 'https://www.magazineluiza.com.br', lastChecked: 'Há 15 min' }
      ],
      secretStatus: 'disponivel',
      secretComments: []
    },
    {
      id: 'w-4',
      ownerId: 'u-mae',
      ownerName: 'Helena (Mãe)',
      title: 'Cafeteira Espresso Nespresso Essenza Mini Inox 110v',
      category: 'Casa & Cozinha',
      imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
      originalUrl: 'https://www.magazineluiza.com.br/cafeteira-nespresso',
      priority: 'alta',
      notesFromOwner: 'Voltagem 110v! Cor vermelha ou preta.',
      lowestPrice: 389.00,
      highestPrice: 549.00,
      savingsAmount: 160.00,
      savingsPercent: 29,
      priceHistoryLabel: '🔥 Oferta Relâmpago c/ 29% OFF',
      offers: [
        { store: 'Magalu', storeLogo: '🛍️', price: 389.00, originalPrice: 549.00, installments: '8x de R$ 48,62 s/ juros', freeShipping: true, url: 'https://www.magazineluiza.com.br', isCheapest: true, lastChecked: 'Agora' },
        { store: 'Amazon', storeLogo: '📦', price: 419.90, installments: '10x de R$ 41,99 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br', lastChecked: 'Há 4 min' },
        { store: 'Mercado Livre', storeLogo: '🤝', price: 439.00, installments: '10x de R$ 43,90', freeShipping: true, url: 'https://www.mercadolivre.com.br', lastChecked: 'Há 9 min' }
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
      id: 'w-5',
      ownerId: 'u-mae',
      ownerName: 'Helena (Mãe)',
      title: 'Perfume Lancôme La Vie Est Belle Eau de Parfum 50ml',
      category: 'Beleza & Perfumaria',
      imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
      originalUrl: 'https://www.amazon.com.br/lancome-la-vie-est-belle',
      priority: 'sonho',
      notesFromOwner: 'Meu perfume favorito para festas de fim de ano.',
      lowestPrice: 369.90,
      highestPrice: 499.00,
      savingsAmount: 129.10,
      savingsPercent: 26,
      priceHistoryLabel: '✨ Menor preço na Shopee Oficial',
      offers: [
        { store: 'Shopee', storeLogo: '🧡', price: 369.90, originalPrice: 499.00, installments: '6x de R$ 61,65 s/ juros', freeShipping: true, url: 'https://shopee.com.br', isCheapest: true, lastChecked: 'Agora' },
        { store: 'Amazon', storeLogo: '📦', price: 399.00, installments: '10x de R$ 39,90 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br', lastChecked: 'Há 7 min' },
        { store: 'Magalu', storeLogo: '🛍️', price: 449.90, installments: '10x de R$ 44,99', freeShipping: true, url: 'https://www.magazineluiza.com.br', lastChecked: 'Há 11 min' }
      ],
      secretStatus: 'disponivel',
      secretComments: []
    },
    {
      id: 'w-6',
      ownerId: 'u-leticia',
      ownerName: 'Letícia Rocha',
      title: 'Kindle Paperwhite 16GB Tela de 6,8" À Prova D\'Água',
      category: 'Leitura & Tech',
      imageUrl: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?auto=format&fit=crop&w=600&q=80',
      originalUrl: 'https://www.amazon.com.br/kindle-paperwhite-16gb',
      priority: 'alta',
      notesFromOwner: 'Versão preta ou verde sálvia!',
      lowestPrice: 649.00,
      highestPrice: 799.00,
      savingsAmount: 150.00,
      savingsPercent: 19,
      priceHistoryLabel: '🔥 Preço oficial com desconto à vista',
      offers: [
        { store: 'Amazon', storeLogo: '📦', price: 649.00, originalPrice: 799.00, installments: '12x de R$ 54,08 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br', isCheapest: true, lastChecked: 'Agora' },
        { store: 'Mercado Livre', storeLogo: '🤝', price: 689.90, installments: '10x de R$ 68,99 s/ juros', freeShipping: true, url: 'https://www.mercadolivre.com.br', lastChecked: 'Há 5 min' },
        { store: 'Magalu', storeLogo: '🛍️', price: 739.00, installments: '10x de R$ 73,90', freeShipping: false, url: 'https://www.magazineluiza.com.br', lastChecked: 'Há 14 min' }
      ],
      secretStatus: 'disponivel',
      secretComments: [
        { id: 'c-5', authorId: 'u-marcius', authorName: 'Marcius Vinícius', authorAvatar: '🕶️', text: 'Pessoal do TCC, o aniversário da Letícia é dia 12! Bora abrir uma vaquinha de R$ 162 pra cada?', createdAt: 'Hoje às 09:30' }
      ]
    },
    {
      id: 'w-7',
      ownerId: 'u-lucas',
      ownerName: 'Lucas (Irmão)',
      title: 'Controle Sem Fio DualSense PlayStation 5 — Midnight Black',
      category: 'Games',
      imageUrl: 'https://images.unsplash.com/photo-1606318801954-d46d46d3360a?auto=format&fit=crop&w=600&q=80',
      originalUrl: 'https://www.kabum.com.br/produto/controle-dualsense-ps5',
      priority: 'alta',
      notesFromOwner: 'Para jogar coop no PC e no PS5.',
      lowestPrice: 349.90,
      highestPrice: 469.90,
      savingsAmount: 120.00,
      savingsPercent: 26,
      priceHistoryLabel: '🎮 Menor preço gamer na KaBuM!',
      offers: [
        { store: 'KaBuM!', storeLogo: '💥', price: 349.90, originalPrice: 469.90, installments: '10x de R$ 38,87', freeShipping: true, url: 'https://www.kabum.com.br', isCheapest: true, lastChecked: 'Agora' },
        { store: 'Amazon', storeLogo: '📦', price: 369.00, installments: '7x de R$ 52,71 s/ juros', freeShipping: true, url: 'https://www.amazon.com.br', lastChecked: 'Há 3 min' },
        { store: 'Mercado Livre', storeLogo: '🤝', price: 379.00, installments: '10x de R$ 37,90 s/ juros', freeShipping: true, url: 'https://www.mercadolivre.com.br', lastChecked: 'Há 8 min' }
      ],
      secretStatus: 'reservado',
      reservedByUserId: 'u-filipe',
      reservedByName: 'Filipe Nascimento',
      secretComments: []
    }
  ]);

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

  /**
   * Regra de Ouro "Sem Spoiler":
   * Se o item pertence ao usuário logado E a perspectiva está em 'owner' (Visão do Dono),
   * os dados secretos (quem reservou, vaquinha e comentários secretos) ficam 100% invisíveis!
   */
  canSeeSecrets(item: WishItem): boolean {
    if (item.ownerId !== this.currentUser().id) {
      return true;
    }
    return this.perspective() === 'clan_friend';
  }

  togglePerspective(mode: ViewPerspective): void {
    this.perspective.set(mode);
  }

  /**
   * Simula a extração híbrida (OpenGraph + Busca Comparativa em Lojas) a partir de um link colado
   */
  extractAndCompareFromUrl(
    rawUrl: string,
    customTitle?: string,
    customNotes?: string,
    priority: 'alta' | 'media' | 'sonho' = 'alta'
  ): WishItem {
    const lower = (rawUrl + ' ' + (customTitle ?? '')).toLowerCase();

    let detectedTitle = customTitle?.trim() || 'Smartwatch Galaxy Watch 7 Bluetooth 44mm';
    let category = 'Eletrônicos & Smart';
    let imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
    let basePrice = 1149.00;

    if (!customTitle?.trim()) {
      if (lower.includes('airfryer') || lower.includes('fritadeira')) {
        detectedTitle = 'Fritadeira Sem Óleo AirFryer Mondial Family Inox 4L';
        category = 'Casa & Cozinha';
        imageUrl = 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=600&q=80';
        basePrice = 319.90;
      } else if (lower.includes('tenis') || lower.includes('nike') || lower.includes('corrida')) {
        detectedTitle = 'Tênis Nike Air Zoom Pegasus 40 Masculino/Feminino';
        category = 'Moda & Esporte';
        imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
        basePrice = 549.90;
      } else if (lower.includes('echo') || lower.includes('alexa')) {
        detectedTitle = 'Echo Dot 5ª Geração com Alexa e Som Vibrante — Azul';
        category = 'Casa Inteligente';
        imageUrl = 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80';
        basePrice = 299.00;
      } else if (lower.includes('cadeira') || lower.includes('ergonomica') || lower.includes('gamer')) {
        detectedTitle = 'Cadeira Ergonômica Mesh Elements Vertta Pro Ajuste Lombar';
        category = 'Setup & Escritório';
        imageUrl = 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=600&q=80';
        basePrice = 1290.00;
      }
    }

    const p1 = Number(basePrice.toFixed(2));
    const p2 = Number((basePrice * 1.08).toFixed(2));
    const p3 = Number((basePrice * 1.16).toFixed(2));
    const p4 = Number((basePrice * 1.24).toFixed(2));

    const offers: StoreOffer[] = [
      {
        store: 'Mercado Livre',
        storeLogo: '🤝',
        price: p1,
        originalPrice: p4,
        installments: `10x de R$ ${(p1 / 10).toFixed(2).replace('.', ',')} s/ juros`,
        freeShipping: true,
        url: rawUrl || 'https://www.mercadolivre.com.br',
        isCheapest: true,
        lastChecked: 'Extraído agora'
      },
      {
        store: 'Amazon',
        storeLogo: '📦',
        price: p2,
        originalPrice: p4,
        installments: `10x de R$ ${(p2 / 10).toFixed(2).replace('.', ',')} s/ juros`,
        freeShipping: true,
        url: 'https://www.amazon.com.br',
        lastChecked: 'Extraído agora'
      },
      {
        store: 'Magalu',
        storeLogo: '🛍️',
        price: p3,
        installments: `8x de R$ ${(p3 / 8).toFixed(2).replace('.', ',')}`,
        freeShipping: true,
        url: 'https://www.magazineluiza.com.br',
        lastChecked: 'Extraído agora'
      },
      {
        store: 'Shopee',
        storeLogo: '🧡',
        price: p4,
        installments: `6x de R$ ${(p4 / 6).toFixed(2).replace('.', ',')}`,
        freeShipping: false,
        url: 'https://shopee.com.br',
        lastChecked: 'Extraído agora'
      }
    ];

    const savingsAmount = Number((p4 - p1).toFixed(2));
    const savingsPercent = Math.round((savingsAmount / p4) * 100);

    const newItem: WishItem = {
      id: 'w-' + Date.now(),
      ownerId: this.currentUser().id,
      ownerName: this.currentUser().name,
      priority,
      title: detectedTitle,
      category,
      imageUrl,
      originalUrl: rawUrl,
      notesFromOwner: customNotes?.trim() || 'Adicionado via Link Inteligente com comparador automático.',
      lowestPrice: p1,
      highestPrice: p4,
      savingsAmount,
      savingsPercent,
      priceHistoryLabel: `🔥 Economia de R$ ${savingsAmount.toFixed(2).replace('.', ',')} (${savingsPercent}% OFF)`,
      offers,
      secretStatus: 'disponivel',
      secretComments: []
    };

    this.wishItems.update(list => [newItem, ...list]);
    return newItem;
  }

  toggleSecretReservation(itemId: string): void {
    const user = this.currentUser();
    this.wishItems.update(items =>
      items.map(item => {
        if (item.id !== itemId) return item;
        if (item.secretStatus === 'reservado' && item.reservedByUserId === user.id) {
          return {
            ...item,
            secretStatus: 'disponivel',
            reservedByUserId: undefined,
            reservedByName: undefined
          };
        }
        return {
          ...item,
          secretStatus: 'reservado',
          reservedByUserId: user.id,
          reservedByName: user.name
        };
      })
    );
  }

  contributeToSecretPool(itemId: string, amount: number): void {
    if (amount <= 0) return;
    const user = this.currentUser();
    this.wishItems.update(items =>
      items.map(item => {
        if (item.id !== itemId) return item;
        const existingPool = item.secretPool ?? {
          targetAmount: item.lowestPrice,
          collectedAmount: 0,
          contributions: []
        };
        const newCollected = Number(
          Math.min(existingPool.targetAmount, existingPool.collectedAmount + amount).toFixed(2)
        );
        const isCompleted = newCollected >= existingPool.targetAmount;
        return {
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
      })
    );
  }

  addSecretComment(itemId: string, text: string): void {
    const clean = text.trim();
    if (!clean) return;
    const user = this.currentUser();
    this.wishItems.update(items =>
      items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          secretComments: [
            ...item.secretComments,
            {
              id: 'c-' + Date.now(),
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
        if (clan.id !== clanId) return clan;
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

  createNewClan(name: string, crestIcon: string, motto: string, themeId: PersonalThemeId): Clan {
    const code = '#' + name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) + '-' + Math.floor(10 + Math.random() * 89);
    const user = this.currentUser();
    const newClan: Clan = {
      id: 'clan-' + Date.now(),
      name,
      inviteCode: code,
      crestIcon: crestIcon || '🛡️',
      motto: motto || 'Unidos para acertar em todos os presentes!',
      level: 1,
      xpProgress: 20,
      themeId,
      secretSantaBudget: 150,
      secretSantaDrawn: false,
      members: [
        {
          id: user.id,
          name: user.name + ' (Você)',
          role: 'Líder / Fundador',
          avatar: user.avatar,
          birthday: '14 Ago',
          wishlistCount: this.myWishlist().length,
          relation: 'Fundador'
        }
      ],
      events: [],
      secretSantaPairs: []
    };

    this.clans.update(list => [newClan, ...list]);
    this.selectedClanId.set(newClan.id);
    return newClan;
  }
}
