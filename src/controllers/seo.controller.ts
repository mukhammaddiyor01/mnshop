import { Request, Response } from "express";
import SeoService from "../models/Seo.service";
const seo = new SeoService();
export const buyerHtml = (directory: string) => async (req: Request, res: Response) => {
  try {
    const page = await seo.render(req.path, typeof req.query.category === "string" ? req.query.category : "", directory);
    res.set("Cache-Control", "no-store");
    if (page.noindex) res.set("X-Robots-Tag", "noindex, follow");
    return res.status(page.status).type("html").send(page.html);
  } catch {
    res.set("X-Robots-Tag", "noindex");
    res.set("Retry-After", "60");
    return res.status(503).send("MNShop is temporarily unavailable. Please try again shortly.");
  }
};
