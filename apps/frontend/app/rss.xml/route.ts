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

  const items = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blogs/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author>${escapeXml(post.author.name)}</author>
      <category>${escapeXml(post.category.name)}</category>
      <guid isPermaLink="true">${postUrl}</guid>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>hello@drkatangablog.com (${escapeXml(SITE_TITLE)})</managingEditor>
    <webMaster>hello@drkatangablog.com (${escapeXml(SITE_TITLE)})</webMaster>
    <image>
      <url>${SITE_URL}/logo/ktblog.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
