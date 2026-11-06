# 🎁 SmartGift

Plataforma social multiplataforma de listas de presentes com **comparação inteligente de preços por link**, organização em **Clãs (Família & Amigos)** e coordenação de reservas, vaquinhas e amigo secreto **100% Sem Spoiler**.

---

## 🚀 Arquitetura do Projeto

| Camada | Tecnologia | Diretório | Descrição |
| :--- | :--- | :--- | :--- |
| **Web App** | **Angular 19** (Standalone + Signals + CSS Variables) | `web/` | SPA responsiva com Design System, temas adaptáveis (Pessoal e por Clã) e Simulador Sem Spoiler |
| **Backend API** | **Java 21 + Spring Boot 3** | `backend/` | API REST centralizada, extrator OpenGraph, comparador híbrido e filtro `SpoilerFreeGuard` |
| **Banco de Dados** | **PostgreSQL (5432) + H2** | `backend/` | Persistência relacional com fallback H2 em memória para testes rápidos |
| **Mobile App** | **Flutter** (Android & iOS) | `mobile/` | Aplicativo nativo gamificado sincronizado com a API Spring Boot |

---

## ✨ Funcionalidades Principais

1. **🔗 Adição por Link & Comparador Híbrido de Preços:** Basta colar o link de um produto desejado; o sistema extrai título, imagem e preço (OpenGraph) e compara ofertas entre Amazon, Mercado Livre, Magalu, Shopee e KaBuM!, destacando o **Menor Preço Garantido**.
2. **🤫 Reserva Secreta ("Sem Spoiler"):** Amigos do Clã veem quem já reservou ou comprou o presente para evitar itens repetidos, enquanto o dono da lista vê seus desejos normalmente sem qualquer spoiler.
3. **🪙 Vaquinha Secreta no Clã:** Membros do grupo podem dividir o valor de presentes mais caros com barra de progresso compartilhada e invisível para o dono da lista.
4. **💬 Chat Secreto por Presente:** Comentários ocultos do dono dentro de cada item da lista para os amigos combinarem cor, tamanho, voltagem e entrega.
5. **🏰 Clãs & Mural de Datas:** Grupos estilo clãs com brasão próprio, estandarte de cor, nível de engajamento e contagem regressiva para aniversários, Natal e casamentos.
6. **🎲 Amigo Secreto Integrado:** Sorteio automático dentro do Clã já conectado à lista de desejos e aos menores preços da pessoa sorteada.

---

## 🎨 Identidade Visual e Temas Adaptáveis

O **SmartGift** suporta **Modo Claro e Escuro** e permite trocar tanto o **Tema Pessoal** quanto o **Tema de cada Clã**:
- **👑 Violeta Real (Padrão):** `#7C3AED` (Violeta) • `#FF6B6B` (Coral) • `#F59E0B` (Dourado)
- **🎉 Coral Festivo:** `#E11D48` (Coral Quente) • `#F59E0B` (Âmbar) • `#10B981` (Esmeralda)
- **💸 Esmeralda Smart:** `#059669` (Esmeralda) • `#3B82F6` (Azul Royal) • `#F59E0B` (Dourado)
- **⚡ Oceano Cyber:** `#2563EB` (Índigo) • `#06B6D4` (Ciano) • `#10B981` (Esmeralda)

---

## 🛠️ Como Executar (Web — Angular)

```bash
cd web
npm install
npm start
```
Acesse em `http://localhost:4200`.
