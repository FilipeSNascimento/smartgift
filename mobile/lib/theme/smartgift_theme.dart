import 'package:flutter/material.dart';

enum SmartGiftThemeId { violet, coral, emerald, ocean }

class SmartGiftPalette {
  final SmartGiftThemeId id;
  final String name;
  final String badge;
  final Color primary;
  final Color secondary;
  final Color gold;
  final Color emerald;
  final List<Color> storyRingGradient;

  const SmartGiftPalette({
    required this.id,
    required this.name,
    required this.badge,
    required this.primary,
    required this.secondary,
    required this.gold,
    required this.emerald,
    required this.storyRingGradient,
  });

  static const Map<SmartGiftThemeId, SmartGiftPalette> palettes = {
    SmartGiftThemeId.violet: SmartGiftPalette(
      id: SmartGiftThemeId.violet,
      name: 'Violeta Real',
      badge: '👑 Padrão',
      primary: Color(0xFF7C3AED),
      secondary: Color(0xFFFF6B6B),
      gold: Color(0xFFF59E0B),
      emerald: Color(0xFF10B981),
      storyRingGradient: [Color(0xFF7C3AED), Color(0xFFEC4899), Color(0xFFF59E0B)],
    ),
    SmartGiftThemeId.coral: SmartGiftPalette(
      id: SmartGiftThemeId.coral,
      name: 'Coral Festivo',
      badge: '🎉 Celebração',
      primary: Color(0xFFE11D48),
      secondary: Color(0xFFF59E0B),
      gold: Color(0xFFF59E0B),
      emerald: Color(0xFF10B981),
      storyRingGradient: [Color(0xFFE11D48), Color(0xFFFF6B6B), Color(0xFFF59E0B)],
    ),
    SmartGiftThemeId.emerald: SmartGiftPalette(
      id: SmartGiftThemeId.emerald,
      name: 'Esmeralda Smart',
      badge: '💸 Economia',
      primary: Color(0xFF059669),
      secondary: Color(0xFF3B82F6),
      gold: Color(0xFFF59E0B),
      emerald: Color(0xFF10B981),
      storyRingGradient: [Color(0xFF059669), Color(0xFF10B981), Color(0xFF3B82F6)],
    ),
    SmartGiftThemeId.ocean: SmartGiftPalette(
      id: SmartGiftThemeId.ocean,
      name: 'Oceano Cyber',
      badge: '⚡ Tech/Gamer',
      primary: Color(0xFF2563EB),
      secondary: Color(0xFF06B6D4),
      gold: Color(0xFFF59E0B),
      emerald: Color(0xFF10B981),
      storyRingGradient: [Color(0xFF2563EB), Color(0xFF06B6D4), Color(0xFF10B981)],
    ),
  };

  /// Cores de Raridade das Cartas de Desejos (Estilo Clash Royale)
  static Color rarityBorderColor(String priority) {
    switch (priority) {
      case 'sonho':
        return const Color(0xFFF59E0B); // Lendária (Dourado / Arco-Íris)
      case 'alta':
        return const Color(0xFFA855F7); // Épica (Roxo Vibrante)
      default:
        return const Color(0xFF3B82F6); // Rara (Azul)
    }
  }

  static String rarityLabel(String priority) {
    switch (priority) {
      case 'sonho':
        return '🌟 CARTA LENDÁRIA';
      case 'alta':
        return '🔥 CARTA ÉPICA';
      default:
        return '💎 CARTA RARA';
    }
  }

  ThemeData toMaterialTheme({required bool isDark}) {
    final bg = isDark ? const Color(0xFF0B0F19) : const Color(0xFFF8FAFC);
    final surface = isDark ? const Color(0xFF111827) : Colors.white;
    return ThemeData(
      useMaterial3: true,
      brightness: isDark ? Brightness.dark : Brightness.light,
      scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        brightness: isDark ? Brightness.dark : Brightness.light,
        primary: primary,
        secondary: secondary,
        surface: surface,
      ),
    );
  }
}
