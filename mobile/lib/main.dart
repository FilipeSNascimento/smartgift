import 'package:flutter/material.dart';
import 'screens/mobile_shell_screen.dart';
import 'theme/smartgift_theme.dart';

void main() {
  runApp(const SmartGiftMobileApp());
}

class SmartGiftMobileApp extends StatefulWidget {
  const SmartGiftMobileApp({super.key});

  @override
  State<SmartGiftMobileApp> createState() => _SmartGiftMobileAppState();
}

class _SmartGiftMobileAppState extends State<SmartGiftMobileApp> {
  SmartGiftThemeId _personalTheme = SmartGiftThemeId.violet;
  SmartGiftThemeId? _clanOverrideTheme;
  bool _isDarkMode = true; // Visual Clash Royale / Instagram brilha no modo escuro

  SmartGiftPalette get _activePalette {
    final effective = _clanOverrideTheme ?? _personalTheme;
    return SmartGiftPalette.palettes[effective]!;
  }

  @override
  Widget build(BuildContext context) {
    final palette = _activePalette;
    return MaterialApp(
      title: 'SmartGift Mobile',
      debugShowCheckedModeBanner: false,
      theme: palette.toMaterialTheme(isDark: _isDarkMode),
      home: MobileShellScreen(
        palette: palette,
        personalTheme: _personalTheme,
        isDarkMode: _isDarkMode,
        onThemeChanged: (theme) => setState(() => _personalTheme = theme),
        onClanThemeOverride: (clanTheme) => setState(() => _clanOverrideTheme = clanTheme),
        onToggleDarkMode: () => setState(() => _isDarkMode = !_isDarkMode),
      ),
    );
  }
}
