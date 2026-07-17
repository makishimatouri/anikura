import type { MetadataRoute } from "next";

const BASE_URL = "https://www.anikura.cn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/auth", "/checkin", "/notifications", "/points"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
