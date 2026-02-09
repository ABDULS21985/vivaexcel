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
 * Wraps HTML content in a CDATA section for Atom content.
 */
function wrapCDATA(html: string): string {
  const safeHtml = html.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safeHtml}]]>`;
}

export async function GET() {
  const posts = getAllPublishedPosts().slice(0, 50);

  const latestUpdate =
    posts.length > 0
      ? new Date(posts[0].updatedAt || posts[0].publishedAt).toISOString()
      : new Date().toISOString();

  const entries = posts
    .map((post) => {
      const postUrl = `${SITE_URL}/blogs/${post.slug}`;
      const authorUrl = `${SITE_URL}/author/${post.author.slug}`;

      // Category + tags as Atom categories
      const categories = [
        `    <category term="${escapeXml(post.category.slug)}" label="${escapeXml(post.category.name)}" scheme="${SITE_URL}/blogs/category/${post.category.slug}" />`,
        ...post.tags.map(
          (tag) =>
            `    <category term="${escapeXml(tag.slug)}" label="${escapeXml(tag.name)}" scheme="${SITE_URL}/blogs/tag/${tag.slug}" />`
        ),
      ].join("\n");

      // Full content in content element (type="html")
      const fullContent = post.content
        ? `    <content type="html">${wrapCDATA(post.content)}</content>`
        : "";

      // Media thumbnail for cover image
      const mediaThumbnail = post.featuredImage
        ? `    <link rel="enclosure" type="image/jpeg" href="${escapeXml(post.featuredImage)}" />`
        : "";

      return `  <entry>
    <title type="html">${escapeXml(post.title)}</title>
    <link href="${postUrl}" rel="alternate" type="text/html" />
    <id>${postUrl}</id>
    <published>${new Date(post.publishedAt).toISOString()}</published>
    <updated>${new Date(post.updatedAt || post.publishedAt).toISOString()}</updated>
    <summary type="html">${escapeXml(post.excerpt)}</summary>
${fullContent}
    <author>
      <name>${escapeXml(post.author.name)}</name>
      <uri>${authorUrl}</uri>
    </author>
${categories}
${mediaThumbnail}
  </entry>`;
    })
    .join("\n");

  const atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title type="text">${escapeXml(SITE_TITLE)}</title>
  <subtitle type="text">${escapeXml(SITE_DESCRIPTION)}</subtitle>
  <link href="${SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <link href="${SITE_URL}" rel="alternate" type="text/html" />
  <id>${SITE_URL}/</id>
  <updated>${latestUpdate}</updated>
  <rights>Copyright ${new Date().getFullYear()} ${escapeXml(SITE_TITLE)}. All rights reserved.</rights>
  <author>
    <name>${escapeXml(SITE_TITLE)}</name>
    <uri>${SITE_URL}</uri>
  </author>
  <generator uri="https://nextjs.org" version="16">Next.js</generator>
  <icon>${SITE_URL}/favicon.ico</icon>
  <logo>${SITE_URL}/logo/ktblog.png</logo>
${entries}
</feed>`;

  return new Response(atom, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=600",
    },
  });
}
