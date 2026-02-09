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

/**
 * Wraps HTML content in a CDATA section for RSS content:encoded.
 * Strips the CDATA close sequence if it appears in content.
 */
function wrapCDATA(html: string): string {
  const safeHtml = html.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safeHtml}]]>`;
}

export async function GET() {
  const posts = getAllPublishedPosts().slice(0, 50);

  const items = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blogs/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();

      // Category + tags
      const categories = [
        `    <category>${escapeXml(post.category.name)}</category>`,
        ...post.tags.map(
          (tag) => `    <category>${escapeXml(tag.name)}</category>`
        ),
      ].join("\n");

      // Media enclosure for cover image
      const enclosure = post.featuredImage
        ? `    <enclosure url="${escapeXml(post.featuredImage)}" type="image/jpeg" length="0" />`
        : "";

      // Full content in content:encoded (CDATA-wrapped HTML)
      const fullContent = post.content
        ? `    <content:encoded>${wrapCDATA(post.content)}</content:encoded>`
        : "";

      return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${postUrl}</link>
    <description>${escapeXml(post.excerpt)}</description>
${fullContent}
    <pubDate>${pubDate}</pubDate>
    <dc:creator>${escapeXml(post.author.name)}</dc:creator>
    <author>hello@drkatangablog.com (${escapeXml(post.author.name)})</author>
${categories}
    <guid isPermaLink="true">${postUrl}</guid>
${enclosure}
  </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:media="http://search.yahoo.com/mrss/"
>
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <managingEditor>hello@drkatangablog.com (${escapeXml(SITE_TITLE)})</managingEditor>
    <webMaster>hello@drkatangablog.com (${escapeXml(SITE_TITLE)})</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} ${escapeXml(SITE_TITLE)}. All rights reserved.</copyright>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <ttl>60</ttl>
    <image>
      <url>${SITE_URL}/logo/ktblog.png</url>
      <title>${escapeXml(SITE_TITLE)}</title>
      <link>${SITE_URL}</link>
      <width>144</width>
      <height>144</height>
    </image>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
