import '../theme/smartgift_theme.dart';

class StoryHighlight {
  final String id;
  final String userName;
  final String avatar;
  final String tagLabel;
  final String storyTitle;
  final String storySubtitle;
  final bool isUrgent;

  const StoryHighlight({
    required this.id,
    required this.userName,
    required this.avatar,
    required this.tagLabel,
    required this.storyTitle,
    required this.storySubtitle,
    this.isUrgent = false,
  });
}

class StoreOfferModel {
  final String store;
  final String logo;
  final double price;
  final String installments;
  final bool freeShipping;
  final bool isCheapest;

  const StoreOfferModel({
    required this.store,
    required this.logo,
    required this.price,
    required this.installments,
    required this.freeShipping,
    this.isCheapest = false,
  });
}

class SecretCommentModel {
  final String authorName;
  final String authorAvatar;
  final String text;
  final String timeAgo;

  const SecretCommentModel({
    required this.authorName,
    required this.authorAvatar,
    required this.text,
    required this.timeAgo,
  });
}

class WishCardModel {
  final String id;
  final String ownerId;
  final String ownerName;
  final String ownerAvatar;
  final String clanBadge;
  final String title;
  final String category;
  final String imageUrl;
  final String priority; // 'sonho' (Lendária), 'alta' (Épica), 'media' (Rara)
  final String notesFromOwner;
  final double lowestPrice;
  final double highestPrice;
  final int savingsPercent;
  final List<StoreOfferModel> offers;
  // Campos Secretos ("Sem Spoiler")
  String secretStatus; // 'disponivel', 'reservado', 'vaquinha_ativa', 'comprado'
  String? reservedByName;
  double poolTarget;
  double poolCollected;
  List<SecretCommentModel> secretComments;

  WishCardModel({
    required this.id,
    required this.ownerId,
    required this.ownerName,
    required this.ownerAvatar,
    required this.clanBadge,
    required this.title,
    required this.category,
    required this.imageUrl,
    required this.priority,
    required this.notesFromOwner,
    required this.lowestPrice,
    required this.highestPrice,
    required this.savingsPercent,
    required this.offers,
    this.secretStatus = 'disponivel',
    this.reservedByName,
    this.poolTarget = 0,
    this.poolCollected = 0,
    List<SecretCommentModel>? secretComments,
  }) : secretComments = secretComments ?? [];

  double get poolProgress =>
      poolTarget <= 0 ? 0 : (poolCollected / poolTarget).clamp(0.0, 1.0);
}

class ClanModel {
  final String id;
  final String name;
  final String inviteCode;
  final String crestIcon;
  final String motto;
  final int level;
  final int trophies;
  final SmartGiftThemeId themeId;
  final String secretSantaTargetName;
  final String secretSantaTargetAvatar;

  const ClanModel({
    required this.id,
    required this.name,
    required this.inviteCode,
    required this.crestIcon,
    required this.motto,
    required this.level,
    required this.trophies,
    required this.themeId,
    required this.secretSantaTargetName,
    required this.secretSantaTargetAvatar,
  });
}
