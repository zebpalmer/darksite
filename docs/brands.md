# Brands

A brand is a product's colors and fonts, in every mode. This is the reference for the brand file
that `darksite-theme` reads; the README's "Brands" section is the overview.

```bash
npx darksite-theme brand.json --out src/brand.css     # the whole app (:root)
npx darksite-theme brand.json --scope brand           # scoped to :root[data-brand="<name>"]
npx darksite-theme --preset gruvbox > brand.json       # start from a prebuilt brand
npx darksite-theme --list                              # the prebuilt brands
```

Import the output after `tokens.css`. The brand file is JSON, or an `.mjs` module whose default
export is the brand.

## What a brand can change, and what it cannot

A brand changes how a product looks: its accent, its grays, its page and text colors, its
navigation chrome and its fonts. It does not change what darksite's colors mean or how it is built:

- **Success, warning and danger** may take a product's own green, yellow and red, but they stay
  green, yellow and red. Severity's Info and Critical, and the categorical chart palette, are fixed.
- **Spacing, type sizes, control heights and radii** are fixed. They are what makes every product
  feel like one system to the hand and the eye.
- **Contrast** is not negotiable: every documented pair is checked in every mode.

## The brand file

Every field but `name` is optional. A **color** is `"#rrggbb"`, or an object naming modes:
`{ "dark": "#…", "light": "#…" }`. A plain string is the color in the dark modes, and the light
modes take its hue and chroma at their own lightness, so one color makes a whole brand. A mode the
object leaves out takes its family's color: `night` and `contrast` take `dark`'s, `paper` takes
`light`'s.

| Field | What it drives |
|---|---|
| `name` | The brand's name: the `data-brand` value with `--scope brand`, and the CSS comment. |
| `accent` | Primary buttons, the current item, the focus ring, links, selection, tints. The color lands exactly on the accent fill in the modes it names; the hover, pressed, text and tint roles keep their spacing around it. |
| `accent2` | A second color (`ds-accent-2`, `-text`, `-tint`) for highlights and charts. Never a button, a focus ring or a meaning. |
| `neutral` | The grays' tint: `{ "hue": 40, "chroma": 0.5 }`. `hue` in degrees (OKLCH); `chroma` a multiple of the default tint, 0 for pure gray. Moves every ground, edge and text role. |
| `surfaces` | Exact page and text colors per mode: `{ "dark": { "bg": "#2e3440", "text": "#d8dee9" } }`. `bg` is the page (`ds-bg-1`); the other grounds and the edges keep their steps around it. Paper and night keep their warm grounds unless named here. |
| `chrome` | The navigation's own color: `{ "rail": "#24130d", "bar": "#…" }`. The rail is `NavRail`; the bar is `TopBar` and `TabBar`. Each gets its own grounds, text, edges and accent from the one color, and everything inside it follows. |
| `success`, `warning`, `danger` | A product's own green, yellow and red, with their text, tints and severity stops. |
| `fonts` | `{ "sans": "…", "mono": "…", "reading": "…" }`: CSS font stacks. Load the font files yourself. |
| `roles` | Exact role values per mode, `{ "dark": { "ds-bg-0": "#…" } }`, for what the inputs cannot express. Never adjusted, so they must pass on their own. |

## How the colors are made

Colors are worked in OKLCH, where lightness is perceptual. Each input replaces the hue and chroma of
the roles it drives and remaps their lightness so the input lands exactly where it was given, while
the roles above and below keep their order and spacing — so a light brand color does not wash its
hover and text roles out to white.

Then every documented pair is checked in every mode. A foreground that falls short moves away from
its ground in lightness until it passes; a label that cannot get any darker or lighter moves its
fill instead. Page grounds and the chrome color a brand chose never move. Each move is reported:

```text
adjusted  light: ds-accent-text #2bb3a8 → #007b70 (accent at body size, on ds-bg-1)
```

A brand whose colors cannot pass — a `roles` value that fails, say — exits with the pairs named.

## The modes a brand gets

Every brand works in all five modes. In the reading modes the grounds stay warm and the text stays
soft whatever the brand, and the brand's accent, second color and fonts carry over; name `paper` or
`night` in `surfaces` to change their grounds too. High contrast keeps its own lighter values for a
plain accent color, so it stays at 7:1.
