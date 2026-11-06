# KaTeX rendering

The CSS imported by `Layout.astro` and the renderer used by `rehype-katex`
need the same KaTeX version. Keep the direct dependency and the override in
`package.json` in sync, then regenerate `bun.lock`. The override is needed
because `rehype-katex@7` otherwise installs KaTeX 0.16 separately.

Astro also caches rendered Markdown. Its cache key includes plugin options,
but not installed dependency versions. `rehypeKatexVersioned` includes the
actual KaTeX version in those options so upgrades invalidate cached formulas.
KaTeX 0.16 emits `sizing`/`base`/`strut`; 0.18 CSS expects
`katex-sizing`/`katex-base`/`katex-strut`. Mixing them loses script scaling.

The stale-cache failure was reproduced by building with 0.16.47, then
installing 0.18.5 and rebuilding without changing the Astro configuration.
The output retained `sizing reset-size6 size3` despite loading 0.18 CSS.
With the versioned plugin, the same existing cache is cleared and the output
uses `katex-sizing`. A clean 0.18.5 install with the override renders both
numeric and alphabetic scripts correctly; the previously reported
numbers-only failure was not independently reproduced.

Run the Markdown pipeline regression tests with:

```nu
nix develop --command bun test tests/katex.test.ts
```

For visual verification, check inline and display versions of
`x_0 + x_a + x_{10} + x_{ab}`, `x^2 + x^a + x_{a_0} + x_{0_a}`, and
`\frac{x_0}{m(x_0)}`. First-level scripts should be 70% of the base size;
second-level scripts should be 50%. Verify both a fresh build and an upgrade
with an existing `.astro` content cache.
