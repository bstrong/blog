import { OGImageRoute } from "astro-og-canvas";

const pages: Record<string, { title: string; description: string }> = {};

// Dynamically import all posts via glob
const postFiles = import.meta.glob("/src/content/posts/**/*.{md,mdx}", {
  eager: true,
}) as Record<string, { frontmatter: { title: string; description: string } }>;

for (const [path, mod] of Object.entries(postFiles)) {
  const slug = path
    .split("/")
    .pop()
    ?.replace(/\.(md|mdx)$/, "");
  if (slug && mod.frontmatter) {
    pages[slug] = {
      title: mod.frontmatter.title,
      description: mod.frontmatter.description,
    };
  }
}

pages.index = {
  title: "Ben Strong",
  description:
    "Software developer in Austin, TX. Mobile, WebRTC, live streaming.",
};

pages.about = {
  title: "About — Ben Strong",
  description: "Software developer in Austin, TX.",
};

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "slug",
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [[250, 250, 249]],
    border: {
      color: [26, 26, 26],
      width: 4,
      side: "inline-start",
    },
    font: {
      title: {
        color: [26, 26, 26],
        size: 64,
        families: ["Inter"],
        weight: "Bold",
      },
      description: {
        color: [85, 85, 85],
        size: 32,
        families: ["Inter"],
      },
    },
    fonts: [
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap",
    ],
  }),
});
