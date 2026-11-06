package com.smartgift.config;

import com.smartgift.model.*;
import com.smartgift.repository.ClanRepository;
import com.smartgift.repository.WishItemRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedDatabase(WishItemRepository wishRepo, ClanRepository clanRepo) {
        return args -> {
            if (clanRepo.count() == 0) {
                clanRepo.saveAll(List.of(
                        new ClanEntity("clan-familia", "Clã Família Nascimento", "#FAMILIA-NASC", "🦁",
                                "Nenhum aniversário passa em branco e zero presentes repetidos!", 7, 82, "violet", 180.0, true),
                        new ClanEntity("clan-facul", "Clã Squad Engenharia & TCC", "#SQUAD-TCC26", "🚀",
                                "Café, código limpo e presentes gamers no menor preço.", 5, 65, "ocean", 120.0, false),
                        new ClanEntity("clan-casamento", "Clã Chá de Casa Nova — Bia & Rafa", "#CASANOVA-BR", "🥂",
                                "Ajudando a montar o apê novo sem ninguém dar liquidificador repetido!", 4, 50, "coral", 250.0, false)
                ));
            }

            if (wishRepo.count() == 0) {
                WishItemEntity sony = new WishItemEntity();
                sony.setId("w-1");
                sony.setOwnerId("u-filipe");
                sony.setOwnerName("Filipe Nascimento");
                sony.setTitle("Fone Bluetooth Sony WH-1000XM5 Cancelamento de Ruído");
                sony.setCategory("Áudio & Tech");
                sony.setImageUrl("https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80");
                sony.setOriginalUrl("https://www.amazon.com.br/dp/B09XS7JWHH");
                sony.setPriority("sonho");
                sony.setNotesFromOwner("Cor preta de preferência! Ótimo para programar focado.");
                sony.setLowestPrice(1899.90);
                sony.setHighestPrice(2399.00);
                sony.setSavingsAmount(499.10);
                sony.setSavingsPercent(21);
                sony.setPriceHistoryLabel("🔥 Menor preço dos últimos 45 dias!");
                sony.setSecretStatus("vaquinha_ativa");
                sony.setPoolTargetAmount(1899.90);
                sony.setPoolCollectedAmount(1350.00);
                sony.setOffers(List.of(
                        new StoreOfferEmbeddable("Mercado Livre", "🤝", 1899.90, 2299.00, "10x de R$ 189,99 s/ juros", true, "https://www.mercadolivre.com.br", true, "Há 5 min"),
                        new StoreOfferEmbeddable("Amazon", "📦", 1989.00, 2399.00, "10x de R$ 198,90 s/ juros", true, "https://www.amazon.com.br", false, "Há 5 min")
                ));
                sony.setContributions(List.of(
                        new SecretContributionEmbeddable("u-mae", "Helena (Mãe)", "👩‍🦱", 650.00, "Ontem"),
                        new SecretContributionEmbeddable("u-lucas", "Lucas (Irmão)", "🧔", 400.00, "Ontem"),
                        new SecretContributionEmbeddable("u-bia", "Beatriz (Prima)", "👩", 300.00, "Hoje")
                ));
                sony.setSecretComments(List.of(
                        new SecretCommentEmbeddable("c-1", "u-mae", "Helena (Mãe)", "👩‍🦱", "Abri a vaquinha! Pelo Mercado Livre está R$ 500 mais barato.", "Ontem às 19:40")
                ));

                wishRepo.save(sony);
            }
        };
    }
}
