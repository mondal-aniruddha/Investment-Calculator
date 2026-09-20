# InFinance Calculator Design System

## Visual direction

The interface should feel trustworthy, calm, practical, and data-literate.
Use generous whitespace, clear hierarchy, restrained color, and charts that
make uncertainty visible without implying certainty. The experience must work
well on mobile and remain readable when printed.

## Color tokens

```css
--color-primary: #0f766e;       /* teal actions and focus */
--color-primary-dark: #115e59;
--color-secondary: #2563eb;     /* links and comparison data */
--color-accent: #f59e0b;        /* highlights and warnings */
--color-success: #15803d;
--color-danger: #b91c1c;
--color-text: #172033;
--color-muted: #64748b;
--color-surface: #ffffff;
--color-surface-muted: #f1f5f9;
--color-border: #dbe3ec;
```

Dark mode should preserve contrast rather than simply invert colors:
`--color-surface: #0f172a`, `--color-surface-muted: #1e293b`,
`--color-text: #e2e8f0`, and lighter primary/secondary accents.

## Typography

- Prefer system UI fonts: `Inter`, `Segoe UI`, `Roboto`, sans-serif.
- Body: 16px, line-height 1.5.
- Page title: 2rem, weight 700.
- Section title: 1.25rem, weight 700.
- Card title: 1rem, weight 700.
- Supporting text: 0.875rem with muted color.
- Use tabular numerals for amounts and percentages.
- Display INR with Indian grouping and the `₹` symbol.

## Layout and spacing

Use a centered fluid container with a maximum width around 1200px. Use a
4px-based spacing scale: 4, 8, 12, 16, 24, 32, and 48px. Cards use 16-20px
padding, 12px radius, a subtle border, and no distracting heavy shadows.
Forms should use a responsive one-column layout on small screens and a
two-column grid when fields are independent.

## Components

- **Header:** product name, primary navigation, language control, theme toggle,
  and account actions.
- **Calculator card:** title, short explanation, labeled inputs, inline
  validation, calculate action, and disclaimer.
- **Result card:** prominent key figure, INR formatting, assumptions summary,
  chart, plain-language explanation, and optional save/report/AI actions.
- **Chart:** labeled axes, accessible data summary, consistent scenario colors,
  and no chart-only communication of important values.
- **Education panel:** concise "How it works" explanation, glossary links, and
  assumptions/limitations.
- **Table:** responsive overflow, aligned numeric columns, visible headers, and
  no color-only meaning.
- **Alert:** use success, warning, or error color with an icon and text; never
  rely on color alone.

## Interaction and accessibility

Visible keyboard focus, semantic headings, associated labels, useful error
messages, sufficient color contrast, screen-reader text for charts, and
logical tab order are required. Buttons must describe their action. Avoid
hover-only information and preserve print-friendly output.

## Content style

Use plain English by default, with translations in resource files. Explain
financial terms before using abbreviations. Use direct, non-judgmental copy.
Every result page must show the educational, non-advice disclaimer.
