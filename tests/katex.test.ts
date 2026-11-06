import { expect, test } from "bun:test";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import katex from "katex";
import remarkMath from "remark-math";
import { rehypeKatexVersioned } from "../src/plugins/rehype-katex";

const renderer = await createMarkdownProcessor({
	remarkPlugins: [remarkMath],
	rehypePlugins: [[rehypeKatexVersioned, { version: katex.version }]],
});

for (const formula of [
	"x_0 + x_a + x_{10} + x_{ab}",
	"x^2 + x^a + x_{a_0} + x_{0_a}",
	String.raw`\frac{x_0}{m(x_0)} + \sum_{i=0}^{10} x_i`,
]) {
	for (const displayMode of [false, true]) {
		test(`${displayMode ? "display" : "inline"} math: ${formula}`, async () => {
			const markdown = displayMode ? `$$\n${formula}\n$$` : `$${formula}$`;
			const { code } = await renderer.render(markdown);
			// Compare the actual Markdown pipeline with the renderer supplying CSS.
			// A nested 0.16 dependency produces incompatible sizing/base classes.
			expect(code.replaceAll("&#x200B;", "\u200b")).toContain(
				katex.renderToString(formula, { displayMode }),
			);
			expect(code).toContain("katex-sizing reset-size6 size3");
			expect(code).not.toMatch(/class="sizing /);
		});
	}
}
