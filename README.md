# Harem Szaleńca — Złota Klatka

**Strona autorska tetralogii historycznej Tomasza Kotlińskiego**  
o Sułtanie İbrahimie I i upadku Imperium Osmańskiego (1640—1648).

---

## Przegląd projektu

- **Nazwa**: Harem Szaleńca — Złota Klatka
- **Autor**: Tomasz Kotliński (kotlinski.tomek@gmail.com)
- **Cel**: Landing page tetralogii historycznej prezentujący autora, 4 tomy, 10 postaci, 4 lokacje i atlas Topkapı
- **Estetyka**: Turecki cinematic — obsydian + złoto + burgund + kaligrafia arabska + ornamentyka Iznik

---

## Zrealizowane funkcjonalności

### Sekcje strony (8+):
1. **Hero** — Trzy Twarze Klatki: tytuł H1 Cormorant 168px, portret trójki bohaterów, tuğra SVG watermark
2. **Manifest** — cinematic cytat z drop-cap numeral 720px, word-reveal animacja
3. **Autor** — Tomasz Kotliński: timeline 4 punkty, 4 metryki (IV tomy / 7 lat / 2036 str / 1640–1648)
4. **Tetralogia** — 4 tomy szczegółowo z okładkami PNG i CTA "Kup Teraz" → Ridero
5. **Cienie Pałacu** — 10 postaci Dramatis Personae (horizontal scroll-snap + scroll-lock)
6. **Świat Powieści** — 4 lokacje (Kafes, Sala Tronowa, Harem, Bosfor)
7. **Atlas** — aerial mapa Topkapı z 7 hotspotami
8. **Footer** — newsletter + linki + wax seal SVG

### 12 efektów Web Awards level:
- Scroll-driven cinematic zoom (Manifest)
- Word-reveal (blur + skewY + translateY + stagger)
- Hero Ken-Burns (rAF sin/cos oscillation)
- Magnetic buttons (mouseoffset × 0.18)
- Liquid-glass nav (backdrop-filter blur/saturate)
- Scroll progress bar (złoty gradient)
- Hero spotlight (kursor jako pochodnia 720px radial)
- Section fade-in (IntersectionObserver)
- Golden SVG underline (stroke-dashoffset animation)
- Kinowa noise texture (SVG turbulence)
- Hamburger mobile menu (X transform + stagger)
- Preloader rytualny (star path animation 500ms)

---

## 🌐 URL Produkcyjny

**https://75721b6d-c795-4a3c-b412-b347c2a7a54c.vip.gensparksite.com**

---

## Ścieżki URL

| Ścieżka | Opis |
|---------|------|
| `/` | Główna strona |
| `/#hero` | Sekcja hero |
| `/#manifest` | Manifest |
| `/#autor` | Autor |
| `/#tomy` | Tetralogia |
| `/#cienie` | Cienie Pałacu (Dramatis Personae) |
| `/#atlas` | Atlas Topkapı |
| `/tom-1` do `/tom-4` | Alias do tomów |
| `/kafes`, `/tron`, `/otchlan`, `/upadek` | Alias do tomów |

---

## Architektura danych

- **Typ**: Statyczna strona HTML/CSS/JS (vanilla, zero dependencies)
- **Storage**: Brak (statyczne pliki)
- **Assety**: 27 plików obrazów (~25 MB) + 2 CSS + 2 JS

### Struktura assetów:
```
assets/
├── css/
│   ├── imperium.css    # Design system (obsydian/złoto/burgund)
│   └── cinematics.css  # 12 efektów animacyjnych
├── js/
│   ├── runtime.js      # Particle system + preloader + cursor
│   └── cinematics.js   # Scroll effects + hamburger + word-reveal
└── img/
    ├── hero_trio_v2.jpg         # Portret trójki bohaterów
    ├── manifest_wide.jpg        # Stambuł nocą (manifest tło)
    ├── topkapi_aerial.jpg       # Aerial Topkapı (atlas)
    ├── author_new.jpg           # Portret autora
    ├── covers/                  # 4 okładki PNG (transparent)
    ├── characters/              # 10 portretów AI hyperrealistic
    └── locations/               # 4 lokacje AI cinematic
```

---

## Linki zewnętrzne

**Ridero (zakup):**
- Tom I Kafes: https://ridero.eu/pl/books/kafes/
- Tom II Tron: https://ridero.eu/pl/books/tron_1/
- Tom III Otchłań: https://ridero.eu/pl/books/otchlan_2/
- Tom IV Upadek: https://ridero.eu/pl/books/upadek/

**Kontakt:** kotlinski.tomek@gmail.com

---

## Design System

### Kolory (design tokens)
```css
--c-void: #050508          /* Bazowa czerń */
--c-obsidian: #0A0A14      /* Karty */
--c-gold: #C9A84C          /* Główny złoty */
--c-gold-bright: #D4AF37   /* Highlight */
--c-burgundy: #6B1D2F      /* Akcent burgund */
--c-warm-white: #F5F0EB    /* Tekst */
```

### Typografia
- **Display**: Cormorant Garamond (200–500 wght, italic)
- **Sans**: Inter (300–500 wght)
- **Mono**: JetBrains Mono (400, uppercase, letter-spacing)
- **Arabic**: Amiri (arabski dla podpisów)

### Responsywność
- Desktop: > 900px (full layout, grid)
- Tablet: ≤ 900px (hamburger, single column)
- Mobile: ≤ 560px (compact, clamp scale)

---

## Przewodnik użytkownika

1. **Odwiedź stronę** — zobaczysz preloader (gwiazda osmańska, 500ms)
2. **Hero** — czytaj manifest, kliknij "Poznaj sagę" lub "Manifest"
3. **Scroll** — każda sekcja ma cinematic reveal
4. **Cienie Pałacu** — scroll w dół aby przesunąć karty postaci (1 wheel = 1 karta)
5. **Tetralogia** — kliknij "Kup Teraz · [Tytuł] · Ridero" aby przejść do zakupu
6. **Atlas** — najedź na hotspoty aby zobaczyć opisy lokacji Topkapı

---

## Wdrożenie

- **Platforma**: Cloudflare Pages
- **Typ**: Statyczna strona HTML (bez build step)
- **Status**: ✅ Aktywny
- **Stos**: Vanilla HTML5 + CSS3 + ES6+ JS
- **Cache**: Cloudflare CDN (headers skonfigurowane w `_headers`)
- **Ostatnia aktualizacja**: 2026-07-09

---

© 2026 Tomasz Kotliński. Wszystkie prawa zastrzeżone.
