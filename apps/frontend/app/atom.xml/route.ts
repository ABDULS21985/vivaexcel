import { getAllPublishedPosts } from "@/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";
const SITE_TITLE = "KTBlog";
const SITE_DESCRIPTION =
  "Expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPublishedPosts().slice(0, 20);

  const latestUpdate =
    posts.length > 0
      ? new Date(posts[0].publishedAt).toISOString()
      : new Date().toISOString();

  const entries = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blogs/${post.slug}`;
      return `  <entry>
    <title>${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html" />
    <id>${postUrl}</id>
    <published>${new Date(post.publishedAt).toISOString()}</published>
    <updated>${new Date(post.updatedAt || post.publishedAt).toISOString()}</updated>
    <summary>${escapeXml(post.excerpt)}</summary>
    <author>
      <name>${escapeXml(post.author.name)}</name>
    </author>
    <category term="${escapeXml(post.category.slug)}" label="${escapeXml(post.category.name)}" />
  </entry>`;
    })
    .join("\n");

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE_TITLE)}</title>
  <subtitle>${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <link href="${SITE_URL}" rel="alternate" type="text/html" />
  <id>${SITE_URL}/</id>
  <updated>${latestUpdate}</updated>
  <author>
    <name>${escapeXml(SITE_TITLE)}</name>
    <uri>${SITE_URL}</uri>
  </author>
  <generator>Next.js</generator>
  <icon>${SITE_URL}/favicon.ico</icon>
  <logo>${SITE_URL}/logo/ktblog.png</logo>
${entries}
</feed>`;

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
