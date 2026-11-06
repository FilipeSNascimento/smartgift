import 'package:flutter/material.dart';
import '../models/smartgift_models.dart';
import '../services/smartgift_api_service.dart';
import '../theme/smartgift_theme.dart';

class MobileShellScreen extends StatefulWidget {
  final SmartGiftPalette palette;
  final SmartGiftThemeId personalTheme;
  final bool isDarkMode;
  final ValueChanged<SmartGiftThemeId> onThemeChanged;
  final ValueChanged<SmartGiftThemeId?> onClanThemeOverride;
  final VoidCallback onToggleDarkMode;

  const MobileShellScreen({
    super.key,
    required this.palette,
    required this.personalTheme,
    required this.isDarkMode,
    required this.onThemeChanged,
    required this.onClanThemeOverride,
    required this.onToggleDarkMode,
  });

  @override
  State<MobileShellScreen> createState() => _MobileShellScreenState();
}

class _MobileShellScreenState extends State<MobileShellScreen> {
  final SmartGiftRepositoryService _repo = SmartGiftRepositoryService();
  late final PageController _pageController;

  int _currentTab = 0; // 0: Feed Insta, 1: Deck Clash, 2: Clã & Vaquinhas, 3: Radar Preços, 4: Temas
  bool _spoilerFreeOwnerMode = true;
  int _selectedClanIndex = 0;
  bool _secretChestOpened = false;
  final TextEditingController _linkController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: 0);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _linkController.dispose();
    super.dispose();
  }

  ClanModel get _activeClan => _repo.clans[_selectedClanIndex];

  bool _canSeeSecrets(WishCardModel item) {
    if (item.ownerId != SmartGiftRepositoryService.currentUserId) return true;
    return !_spoilerFreeOwnerMode;
  }

  void _selectTab(int index) {
    setState(() => _currentTab = index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 280),
      curve: Curves.easeOutCubic,
    );
    if (index == 2) {
      widget.onClanThemeOverride(_activeClan.themeId);
    } else {
      widget.onClanThemeOverride(null);
    }
  }

  void _donateToPool(WishCardModel item, double amount) {
    setState(() {
      item.poolTarget = item.poolTarget > 0 ? item.poolTarget : item.lowestPrice;
      item.poolCollected = (item.poolCollected + amount).clamp(0, item.poolTarget);
      item.secretStatus = item.poolCollected >= item.poolTarget ? 'comprado' : 'vaquinha_ativa';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('🪙 +R\$ ${amount.toStringAsFixed(0)} doados em segredo para "${item.title}"!'),
        backgroundColor: widget.palette.emerald,
      ),
    );
  }

  void _toggleReserve(WishCardModel item) {
    setState(() {
      if (item.secretStatus == 'reservado') {
        item.secretStatus = 'disponivel';
        item.reservedByName = null;
      } else {
        item.secretStatus = 'reservado';
        item.reservedByName = 'Você (Em Segredo)';
      }
    });
  }

  void _forgeNewCardFromLink() {
    final url = _linkController.text.trim();
    if (url.isEmpty) return;
    setState(() {
      _repo.items.insert(
        0,
        WishCardModel(
          id: 'w-${DateTime.now().millisecondsSinceEpoch}',
          ownerId: SmartGiftRepositoryService.currentUserId,
          ownerName: SmartGiftRepositoryService.currentUserName,
          ownerAvatar: '🧑‍💻',
          clanBadge: '${_activeClan.crestIcon} ${_activeClan.name}',
          title: 'Smartwatch Galaxy Watch 7 (Extraído por Link)',
          category: 'Wearables & Tech',
          imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
          priority: 'sonho',
          notesFromOwner: 'Extraído do link: $url',
          lowestPrice: 1099.90,
          highestPrice: 1499.00,
          savingsPercent: 27,
          poolTarget: 1099.90,
          offers: const [
            StoreOfferModel(store: 'Mercado Livre', logo: '🤝', price: 1099.90, installments: '10x R\$ 109,99', freeShipping: true, isCheapest: true),
            StoreOfferModel(store: 'Amazon', logo: '📦', price: 1189.00, installments: '10x R\$ 118,90', freeShipping: true),
          ],
        ),
      );
      _linkController.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            _buildClashRoyaleTopHud(),
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (idx) => setState(() => _currentTab = idx),
                children: [
                  _buildInstagramFeedTab(),
                  _buildClashRoyaleDeckTab(),
                  _buildClashRoyaleClanTab(),
                  _buildPriceArenaTab(),
                  _buildProfileThemesTab(),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildClashRoyaleBottomDock(),
    );
  }

  Widget _buildClashRoyaleTopHud() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            widget.palette.primary.withOpacity(0.95),
            const Color(0xFF1E1B4B),
          ],
        ),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 8, offset: Offset(0, 3)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: const Color(0xFF2563EB),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.amberAccent, width: 1.5),
            ),
            child: const Row(
              children: [
                Text('👑 Nv.12', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.black38,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: Colors.white24),
            ),
            child: const Row(
              children: [
                Text('🪙 R\$ 1.191 poupados', style: TextStyle(color: Color(0xFFFDE047), fontWeight: FontWeight.bold, fontSize: 12)),
              ],
            ),
          ),
          const Spacer(),
          GestureDetector(
            onTap: () => setState(() => _spoilerFreeOwnerMode = !_spoilerFreeOwnerMode),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _spoilerFreeOwnerMode ? const Color(0xFF10B981) : const Color(0xFFEC4899),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                _spoilerFreeOwnerMode ? '🛡️ Sem Spoiler' : '🕵️ Modo Espião',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInstagramFeedTab() {
    final friendItems = _repo.items.where((i) => i.ownerId != SmartGiftRepositoryService.currentUserId).toList();
    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        SizedBox(
          height: 112,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            scrollDirection: Axis.horizontal,
            itemCount: _repo.stories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final st = _repo.stories[index];
              return GestureDetector(
                onTap: () => _showStoryDialog(st),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(colors: widget.palette.storyRingGradient),
                      ),
                      child: CircleAvatar(
                        radius: 28,
                        backgroundColor: Theme.of(context).colorScheme.surface,
                        child: Text(st.avatar, style: const TextStyle(fontSize: 26)),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(st.userName, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ),
              );
            },
          ),
        ),
        const Divider(height: 1),
        ...friendItems.map((item) => _buildInstagramPostCard(item)),
      ],
    );
  }

  Widget _buildInstagramPostCard(WishCardModel item) {
    final rarityColor = SmartGiftPalette.rarityBorderColor(item.priority);
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: rarityColor.withOpacity(0.55), width: 1.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ListTile(
            leading: CircleAvatar(child: Text(item.ownerAvatar, style: const TextStyle(fontSize: 22))),
            title: Text(item.ownerName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
            subtitle: Text(item.clanBadge, style: const TextStyle(fontSize: 12)),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: rarityColor.withOpacity(0.18),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: rarityColor),
              ),
              child: Text(
                SmartGiftPalette.rarityLabel(item.priority),
                style: TextStyle(color: rarityColor, fontWeight: FontWeight.w900, fontSize: 10),
              ),
            ),
          ),
          Stack(
            children: [
              AspectRatio(
                aspectRatio: 16 / 10,
                child: Image.network(item.imageUrl, fit: BoxFit.cover),
              ),
              Positioned(
                bottom: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF10B981),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    '🏆 R\$ ${item.lowestPrice.toStringAsFixed(2)} em ${item.offers.first.store} (-${item.savingsPercent}%)',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 4),
                Text('📌 Dica: ${item.notesFromOwner}', style: const TextStyle(fontSize: 12.5)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: widget.palette.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '🪙 Vaquinha Secreta: R\$ ${item.poolCollected.toStringAsFixed(0)} / R\$ ${item.lowestPrice.toStringAsFixed(0)}',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                          Text('${(item.poolProgress * 100).round()}%', style: const TextStyle(fontWeight: FontWeight.w900)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(999),
                        child: LinearProgressIndicator(
                          value: item.poolProgress,
                          minHeight: 10,
                          color: const Color(0xFF10B981),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => _toggleReserve(item),
                              icon: const Icon(Icons.lock_outline, size: 16),
                              label: Text(
                                item.secretStatus == 'reservado' ? 'Reservado (${item.reservedByName})' : 'Reservar Sozinho',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              foregroundColor: Colors.white,
                            ),
                            onPressed: () => _donateToPool(item, 50),
                            child: const Text('🪙 Doar R\$ 50', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildClashRoyaleDeckTab() {
    final myCards = _repo.items.where((i) => i.ownerId == SmartGiftRepositoryService.currentUserId).toList();
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.surface,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: widget.palette.primary, width: 1.5),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🃏 Forjar Nova Carta de Desejo por Link', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
              const SizedBox(height: 6),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _linkController,
                      decoration: const InputDecoration(
                        hintText: 'Cole o link da Amazon, ML, Shopee...',
                        isDense: true,
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: widget.palette.primary,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: _forgeNewCardFromLink,
                    child: const Text('Forjar ⚡'),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: myCards.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 0.68,
          ),
          itemBuilder: (context, index) {
            final card = myCards[index];
            final borderCol = SmartGiftPalette.rarityBorderColor(card.priority);
            return Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: borderCol, width: 3),
                boxShadow: [
                  BoxShadow(color: borderCol.withOpacity(0.28), blurRadius: 12),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    color: borderCol,
                    child: Text(
                      SmartGiftPalette.rarityLabel(card.priority),
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 10),
                    ),
                  ),
                  Expanded(
                    child: Image.network(card.imageUrl, fit: BoxFit.cover),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(card.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        const SizedBox(height: 4),
                        Text(
                          'R\$ ${card.lowestPrice.toStringAsFixed(2)} (-${card.savingsPercent}%)',
                          style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w900, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _canSeeSecrets(card)
                              ? '🕵️ Status: ${card.secretStatus}'
                              : '🛡️ Sem Spoiler Ativo',
                          style: const TextStyle(fontSize: 10.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildClashRoyaleClanTab() {
    final clan = _activeClan;
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        SizedBox(
          height: 44,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _repo.clans.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, idx) {
              final c = _repo.clans[idx];
              final selected = idx == _selectedClanIndex;
              return ChoiceChip(
                selected: selected,
                label: Text('${c.crestIcon} ${c.name}'),
                onSelected: (_) {
                  setState(() {
                    _selectedClanIndex = idx;
                    _secretChestOpened = false;
                  });
                  widget.onClanThemeOverride(c.themeId);
                },
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(colors: widget.palette.storyRingGradient),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Text(clan.crestIcon, style: const TextStyle(fontSize: 44)),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${clan.inviteCode} • 🏆 ${clan.trophies} Troféus', style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.w900, fontSize: 12)),
                    Text(clan.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
                    Text(clan.motto, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        GestureDetector(
          onTap: () => setState(() => _secretChestOpened = !_secretChestOpened),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1B4B),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.amber, width: 2),
            ),
            child: Row(
              children: [
                Text(_secretChestOpened ? clan.secretSantaTargetAvatar : '🧰', style: const TextStyle(fontSize: 40)),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('BAÚ LENDÁRIO DE AMIGO SECRETO', style: TextStyle(color: Colors.amber, fontWeight: FontWeight.w900, fontSize: 11)),
                      Text(
                        _secretChestOpened
                            ? 'Você tirou: ${clan.secretSantaTargetName}!'
                            : 'Toque no Baú para revelar quem você tirou!',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text('⚔️ Mural de Pedidos de Vaquinha no Clã (Estilo Doação de Cartas)', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
        const SizedBox(height: 8),
        ..._repo.items
            .where((i) => i.ownerId != SmartGiftRepositoryService.currentUserId)
            .map((item) => Card(
                  margin: const EdgeInsets.only(bottom: 10),
                  child: ListTile(
                    leading: CircleAvatar(child: Text(item.ownerAvatar)),
                    title: Text('Presente para ${item.ownerName}: ${item.title}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 4),
                        LinearProgressIndicator(value: item.poolProgress, minHeight: 8, color: const Color(0xFF10B981)),
                        const SizedBox(height: 4),
                        Text('R\$ ${item.poolCollected.toStringAsFixed(0)} / R\$ ${item.lowestPrice.toStringAsFixed(0)} arrecadados'),
                      ],
                    ),
                    trailing: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
                      onPressed: () => _donateToPool(item, 50),
                      child: const Text('DOAR', style: TextStyle(fontWeight: FontWeight.w900)),
                    ),
                  ),
                )),
      ],
    );
  }

  Widget _buildPriceArenaTab() {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const Text('🔍 Arena Caça-Preços (Comparativo em Tempo Real)', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
        const SizedBox(height: 10),
        ..._repo.items.map((item) => Card(
              margin: const EdgeInsets.only(bottom: 12),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ...item.offers.map((offer) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('${offer.logo} ${offer.store} ${offer.isCheapest ? "🏆 MAIS BARATO" : ""}'),
                              Text(
                                'R\$ ${offer.price.toStringAsFixed(2)}',
                                style: TextStyle(
                                  fontWeight: FontWeight.w900,
                                  color: offer.isCheapest ? const Color(0xFF10B981) : null,
                                ),
                              ),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
            )),
      ],
    );
  }

  Widget _buildProfileThemesTab() {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        SwitchListTile(
          title: const Text('🌙 Modo Escuro Gamer / Social', style: TextStyle(fontWeight: FontWeight.bold)),
          value: widget.isDarkMode,
          onChanged: (_) => widget.onToggleDarkMode(),
        ),
        const SizedBox(height: 10),
        const Text('🎨 Escolha seu Tema Pessoal:', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
        const SizedBox(height: 8),
        ...SmartGiftPalette.palettes.values.map((p) => Card(
              child: ListTile(
                leading: CircleAvatar(backgroundColor: p.primary),
                title: Text('${p.name} (${p.badge})', style: const TextStyle(fontWeight: FontWeight.bold)),
                trailing: widget.personalTheme == p.id ? const Icon(Icons.check_circle, color: Colors.green) : null,
                onTap: () => widget.onThemeChanged(p.id),
              ),
            )),
      ],
    );
  }

  Widget _buildClashRoyaleBottomDock() {
    return NavigationBar(
      selectedIndex: _currentTab,
      onDestinationSelected: _selectTab,
      destinations: const [
        NavigationDestination(icon: Icon(Icons.auto_awesome_mosaic), label: 'Feed Insta'),
        NavigationDestination(icon: Icon(Icons.style), label: 'Meu Deck'),
        NavigationDestination(icon: Icon(Icons.shield), label: 'Clãs & Baú'),
        NavigationDestination(icon: Icon(Icons.local_offer), label: 'Caça-Preços'),
        NavigationDestination(icon: Icon(Icons.palette), label: 'Temas'),
      ],
    );
  }

  void _showStoryDialog(StoryHighlight st) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('${st.avatar} ${st.storyTitle}'),
        content: Text(st.storySubtitle),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Fechar')),
        ],
      ),
    );
  }
}
