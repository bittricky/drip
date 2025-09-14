# Drip

> *"You are not a drop in the ocean; you are the entire ocean in a drop."*
> 
> **— Rumi**, *13th Century Persian Poet*

An exercise in recreating this [Drip Drop Animation](https://codepen.io/abehjat/pen/oXMENv).

## Technical Overview

Here's how some of the CSS animation techniques used to recreate the original function:

### Keyframes (`@keyframes`)

[Keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes) define the stages of an animation sequence. Think of them as snapshots of what your element should look like at different points in time.

```css
@keyframes drip {
  to {
    top: 190px;
  }
}
```

**How it works:**
- `@keyframes drip` creates an animation named "drip"
- `to` (or `100%`) defines the end state
- The browser automatically interpolates between the starting position and `top: 190px`
- Apply it with `animation-name: drip`

**Key Takeways:**
- Use `from` and `to` for simple animations
- Use percentages (`0%`, `50%`, `100%`) for complex multi-stage animations
- The browser calculates all the in-between frames automatically

### Radial Gradient (`radial-gradient()`)

[Radial gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/radial-gradient) creates circular or elliptical color transitions, perfect for realistic lighting effects on 3D-looking objects.

```css
background: radial-gradient(
  circle at 30% 30%,
  #ffffff 20%,
  #87cefa 70%,
  #4fc3f7 100%
);
```

**Breaking it down:**
- `circle at 30% 30%` - Creates a circular gradient with its center at 30% from left, 30% from top
- `#ffffff 20%` - White color starts at the center and goes to 20% of the radius
- `#87cefa 70%` - Light blue from 20% to 70% of the radius
- `#4fc3f7 100%` - Darker blue from 70% to the edge (100%)

**Visual Effect:**
This creates a highlight effect that makes flat elements appear three-dimensional, like light hitting a water droplet.

### Cubic Bezier (`cubic-bezier()`)

[Cubic Bezier](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/cubic-bezier) has a lot of math behind the scenes, but the basic idea is that it controls the acceleration and deceleration of animations, making them feel more natural and physics-based.

```css
animation-timing-function: cubic-bezier(1, 0, 0.91, 0.19);
```

**Understand the parameters:**
- Four numbers represent two control points: `(x1, y1, x2, y2)`
- `(1, 0)` - First control point: starts fast
- `(0.91, 0.19)` - Second control point: slows down gradually
- This creates a "gravity-like" effect where the drop accelerates as it falls

**Common patterns to follow:**
- `ease-in`: slow start, fast end
- `ease-out`: fast start, slow end  
- `ease-in-out`: slow start and end, fast middle
- Custom curves let you simulate real physics

### Clip Path Polygon (`clip-path: polygon()`)

Cuts shapes out of elements by defining a [polygon](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/polygon) with coordinate points.

```css
clip-path: polygon(50% 0%, 0% 90%, 100% 80%);
```

**How coordinates work:**
- `50% 0%` - Point at horizontal center, top edge (tip of teardrop)
- `0% 90%` - Point at left edge, 90% down from top
- `100% 80%` - Point at right edge, 80% down from top
- Browser connects these points to create the shape

**Coordinate system:**
- `0% 0%` = top-left corner
- `100% 0%` = top-right corner  
- `0% 100%` = bottom-left corner
- `100% 100%` = bottom-right corner

**Pro tip:** Use online polygon generators to visualize your shapes before coding!

## Editing It All Together

The water droplet effect combines all these techniques:

- **Keyframes** animate the falling motion
- **Radial gradients** create realistic 3D lighting
- **Cubic bezier** makes the fall feel natural with gravity
- **Clip path** shapes the teardrop tail

Each technique serves a specific purpose in creating the illusion and creating the ripple effect of water.

## Shopify Liquid Integration

This demo has been updated to support Shopify Liquid so that colors and animation duration can be customized via theme settings.

### What changed

- `index.html` now includes Liquid:
  - Dynamic page title: `{{ page_title | default: shop.name | escape }}`
  - Stylesheet loaded via assets: `{{ 'style.css' | asset_url | stylesheet_tag }}`
  - Theme head content: `{{ content_for_header }}`
  - CSS variables sourced from theme settings in a `<style>` `:root` block
  - Conditional rendering of elements via `settings.show_droplet` and `settings.show_ripple`
- `style.css` now uses CSS variables so it works both on the web and in Shopify when variables are provided by Liquid.
- `config/settings_schema.json` defines theme settings for colors and animation duration.

### Available settings (configurable in Theme Editor)

- `bg_color` — Background color
- `droplet_light` — Droplet highlight (light)
- `droplet_mid` — Droplet mid tone
- `droplet_dark` — Droplet shadow (dark)
- `ocean_color` — Ripple (ocean) color
- `anim_duration` — Animation duration in seconds
- `show_droplet` — Toggle droplet visibility
- `show_ripple` — Toggle ripple visibility

### Using inside a Shopify theme

1. Create folders in your theme if they don't exist and copy files:
   - Copy `index.html` into `templates/` or `sections/` and rename to match Shopify conventions, for example:
     - As a template: `templates/page.drip.json` (JSON) paired with a section, or `templates/page.drip.liquid`
     - As a section: `sections/drip.liquid`
   - Copy `style.css` into `assets/style.css`
   - Copy `config/settings_schema.json` into your theme's `config/` directory (merge with existing if needed).

2. If you use a section (`sections/drip.liquid`), wrap the markup from `index.html` in that section file. Ensure the stylesheet line remains `{{ 'style.css' | asset_url | stylesheet_tag }}`.

3. Open the Theme Editor and adjust the colors and animation duration in the "Drip Animation Settings" group.

### Notes

- When viewing this locally as a plain HTML file, the Liquid won’t render, but default CSS variable values are provided via Liquid fallbacks in `index.html`.
- In a Shopify theme, Liquid will populate the CSS variables in the `:root` block, and `style.css` will pick them up.

## Local Usage (no Shopify)

Build and serve the Liquid templates locally using the provided Node pipeline:

1. Install dependencies:
   - `npm install`
2. Build once:
   - `npm run build` (outputs `dist/index.html`)
3. Dev server (auto rebuild + serve):
   - `npm run dev` and open http://localhost:3000

### Customize appearance

Edit the local section settings file at `scripts/data/sections/drip.json`:

```json
{
  "bg_color": "#ffffff",
  "droplet_light": "#ffffff",
  "droplet_mid": "#6b6b6b",
  "droplet_dark": "#2c2c2c",
  "ocean_color": "#2c2c2c",
  "anim_duration": 2,
  "show_droplet": true,
  "show_ripple": true
}
```

These map to CSS variables in the rendered HTML and are consumed by `style.css`.

Note: A previous standalone `index.html` file is no longer necessary with this build setup and may be removed during cleanup.

### Optional Shopify Files

This repo also includes optional Shopify files for convenience if you decide to integrate later:

- `sections/drip.liquid` — a section version of the animation with configurable settings
- `templates/page.drip.liquid` — a page template that renders the section
- `config/settings_schema.json` — global theme settings (not needed for local use)

You can ignore these files when running locally.