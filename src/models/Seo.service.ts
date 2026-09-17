import { promises as fs } from "fs";
import path from "path";
import ProductService from "./Product.service";

const origin = "https://mnshop.uz";
const description = "Shop Korean hoodies, T-shirts, caps and cups at MNShop, with delivery to Uzbekistan.";
const categories: Record<string, string> = { hoodies: "Hoodies", tshirts: "T-Shirts", caps: "Caps", cups: "Cups", sale: "Sale Collection" };
const topics: Record<string, string> = { delivery: "Delivery", "size-guide": "Size Guide", returns: "Returns", "secure-payment": "Secure Payment", "order-tracking": "Order Tracking", "product-questions": "Product Questions" };
const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));
const owns = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key);

export default class SeoService {
  private products = new ProductService();
  public async render(requestPath: string, category: string, directory: string) {
    const route = requestPath.replace(/\/+$/, "") || "/";
    let title = "MNShop — Korean products for Uzbekistan";
    let summary = description;
    let canonical = origin + route;
    let status = 200;
    let noindex = false;
    let image = "";
    let schema: object | undefined;
    if (route === "/") schema = { "@context": "https://schema.org", "@type": "WebSite", name: "MNShop", url: origin + "/" };
    else if (route === "/products") {
      const key = owns(categories, category) ? category : "hoodies";
      title = `${categories[key]} | MNShop`;
      summary = `Explore the MNShop ${categories[key]} collection. Browse product details, available sizes and colors, and prices in KRW.`;
      canonical = origin + "/products?category=" + key;
    } else if (/^\/products\/[^/]+$/.test(route)) {
      const id = route.split("/")[2];
      const product = /^[a-f\d]{24}$/i.test(id) ? (await this.products.getPublicProducts()).find(item => String(item._id) === id) : undefined;
      if (!product) { status = 404; noindex = true; title = "Product unavailable | MNShop"; }
      else {
        title = `${product.productName} | MNShop`;
        summary = (product.productDesc || description).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
        if (product.productImages?.[0]) {
          try { const url = new URL(product.productImages[0], origin); if (["http:", "https:"].includes(url.protocol)) image = url.href; } catch { /* Invalid media is omitted from metadata. */ }
        }
        const price = product.productDiscountPrice || product.productPrice;
        schema = { "@context": "https://schema.org", "@type": "Product", name: product.productName, description: summary, sku: id,
          ...(image ? { image } : {}), ...(Number.isFinite(price) && price > 0 ? { offers: { "@type": "Offer", url: canonical, priceCurrency: "KRW", price, availability: "https://schema.org/InStock" } } : {}) };
      }
    } else if (route === "/about") { title = "About MNShop | Korean products for Uzbekistan"; summary = "Discover MNShop and our selection of Korean products for shoppers in Uzbekistan."; }
    else if (route === "/help") { title = "Help & Support | MNShop"; summary = "Find help with MNShop delivery, sizing, returns, payments and order tracking."; }
    else if (/^\/help\/[^/]+$/.test(route) && owns(topics, route.split("/")[2])) { const topic = topics[route.split("/")[2]]; title = `${topic} | MNShop Help`; summary = `Read MNShop guidance on ${topic.toLowerCase()} and find ways to contact support.`; }
    else if (/^\/(login|signup|chat|notifications|likes|orders|checkout|cart|user-page(?:\/(?:addresses|payments))?|payment\/(?:success|fail))$/.test(route)) { title = "MNShop | Account"; noindex = true; }
    else { title = "Page not found | MNShop"; status = 404; noindex = true; }
    let html = await fs.readFile(path.join(directory, "index.html"), "utf8");
    html = html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "").replace(/<meta\b[^>]*(?:name|property)\s*=\s*["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi, "").replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, "");
    const tags = `<title>${escape(title)}</title><meta name="description" content="${escape(summary)}"><meta name="robots" content="${noindex ? "noindex, follow" : "index, follow, max-image-preview:large"}">${noindex ? "" : `<link rel="canonical" href="${escape(canonical)}">`}<meta property="og:site_name" content="MNShop"><meta property="og:type" content="website"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(summary)}"><meta property="og:url" content="${escape(canonical)}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(summary)}">${image ? `<meta property="og:image" content="${escape(image)}"><meta name="twitter:image" content="${escape(image)}">` : ""}${schema ? `<script id="mnshop-seo-jsonld" type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>` : ""}`;
    html = html.replace(/<\/head>/i, `${tags}</head>`);
    if (status === 404) html = html.replace('<div id="root"></div>', '<div id="root"><h1>Page not found</h1><a href="/">Back to MNShop</a></div>');
    return { html, status, noindex };
  }
}
