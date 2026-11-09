# La traversée 2026 → 2027

Décompte festif qui illustre le passage d'une rive **2026** vers une rive **2027** :
ciel étoilé, eau, pont de lumière doré et une barque qui avance avec le temps réel.
À minuit, bascule sur un écran de célébration avec confettis.

Aux couleurs du logo Perez Chapel Dakar (bleu marine + or).

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000

## Build de production

```bash
npm run build
npm start
```

## Personnalisation

Tout se règle dans **`lib/config.ts`** :

- `targetDate` — date/heure d'arrivée (par défaut 1er janvier 2027, 00:00, heure de Dakar / UTC+0).
- `journeyStart` — point de départ de la barque (par défaut 1er décembre 2026). La barque
  se positionne proportionnellement au temps écoulé entre ce départ et `targetDate`.
- Textes : `eyebrow`, `tagline`, `place`, `verseBefore`, `arrivedTitle`, `arrivedSubtitle`.

Le logo est dans `public/logo.png` — remplace-le par le tien si besoin.

## Stack

Next.js 15 (App Router) · React 18 · TypeScript · Canvas 2D, zéro dépendance externe.
# Traversee
