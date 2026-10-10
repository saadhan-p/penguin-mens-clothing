import prisma from '../config/prisma.js';

const DEFAULT_CONFIG = {
  marqueeText: 'COMPLIMENTARY EXPRESS WORLDWIDE SHIPPING ON ALL ORDERS OVER ₹5,000 — 100% HANDCRAFTED ATELIER TAILORING',
  archiveText: 'Archive Curated // FW25',
  heroHeadline: 'ATELIER PRECISION. TIMELESS SILHOUETTES.',
  heroSubheadline: 'Handcrafted menswear engineered for contemporary elegance and effortless structure.',
  heroImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
  heroDropTag: 'WINTER CAPSULE 2026',
  showWinterDrop: true,
  enableCod: true,
  winterDropTitle: 'WINTER DROP 01',
  winterDropSubtitle: 'Limited capsule — Structured outerwear, heavyweight knitwear & tech bombers. Only 100 units per style.',
  winterDropCta: 'Shop Winter Drop',
  winterDropImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
  heroSlides: [],
  promotionalDrops: [],
};

/**
 * @desc Get Site Configuration (Hero banner, countdown timer, marquee text, COD toggle)
 * @route GET /api/config
 */
export const getSiteConfig = async (req, res) => {
  try {
    let config = await prisma.siteConfig.findFirst();
    if (!config) {
      config = await prisma.siteConfig.create({
        data: DEFAULT_CONFIG,
      });
    }

    return res.status(200).json({
      success: true,
      data: { ...config, _id: config.id, enableCod: config.enableCod !== false },
    });
  } catch (error) {
    console.error('Error fetching site config:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc Update Site Configuration (Admin)
 * @route PUT /api/config
 */
export const updateSiteConfig = async (req, res) => {
  try {
    let config = await prisma.siteConfig.findFirst();

    const updateData = {
      marqueeText: req.body.marqueeText !== undefined ? req.body.marqueeText : undefined,
      archiveText: req.body.archiveText !== undefined ? req.body.archiveText : undefined,
      heroHeadline: req.body.heroHeadline !== undefined ? req.body.heroHeadline : undefined,
      heroSubheadline: req.body.heroSubheadline !== undefined ? req.body.heroSubheadline : undefined,
      heroImage: req.body.heroImage !== undefined ? req.body.heroImage : undefined,
      heroDropTag: req.body.heroDropTag !== undefined ? req.body.heroDropTag : undefined,
      showWinterDrop: req.body.showWinterDrop !== undefined ? Boolean(req.body.showWinterDrop) : undefined,
      enableCod: req.body.enableCod !== undefined ? Boolean(req.body.enableCod) : undefined,
      winterDropTitle: req.body.winterDropTitle !== undefined ? req.body.winterDropTitle : undefined,
      winterDropSubtitle: req.body.winterDropSubtitle !== undefined ? req.body.winterDropSubtitle : undefined,
      winterDropCta: req.body.winterDropCta !== undefined ? req.body.winterDropCta : undefined,
      winterDropImage: req.body.winterDropImage !== undefined ? req.body.winterDropImage : undefined,
      heroSlides: req.body.heroSlides !== undefined ? req.body.heroSlides : undefined,
      promotionalDrops: req.body.promotionalDrops !== undefined ? req.body.promotionalDrops : (req.body.drops !== undefined ? req.body.drops : undefined),
    };

    // Clean undefined keys
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);

    if (!config) {
      config = await prisma.siteConfig.create({
        data: { ...DEFAULT_CONFIG, ...updateData },
      });
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: updateData,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Site configuration updated successfully',
      data: { ...config, _id: config.id, enableCod: config.enableCod !== false },
    });
  } catch (error) {
    console.error('Error updating site config:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};
