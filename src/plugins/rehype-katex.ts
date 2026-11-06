import katex from "katex";
import rehypeKatex from "rehype-katex";

type Options = NonNullable<Parameters<typeof rehypeKatex>[0]>;

// Astro includes plugin options in its content cache key, but does not track
// installed plugin/dependency versions. Re-render math whenever KaTeX changes.
export function rehypeKatexVersioned({
	version,
	...options
}: Options & { version: string }) {
	if (version !== katex.version) {
		throw new Error(`Expected KaTeX ${version}, found ${katex.version}`);
	}
	return rehypeKatex(options);
}
