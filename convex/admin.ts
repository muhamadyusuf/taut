import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const ADMIN_EMAIL = "muhamadyusuf0012@gmail.com";

function assertAdmin(email: string | undefined) {
  if (email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin only");
  }
}

// -------------------------------------------------------
// 1. OVERVIEW STATS
// -------------------------------------------------------
export const getAdminStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const [links, microsites, shops, orders] = await Promise.all([
      ctx.db.query("links").collect(),
      ctx.db.query("microsites").collect(),
      ctx.db.query("shop_settings").collect(),
      ctx.db.query("orders").collect(),
    ]);

    const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0);

    const userIds = new Set([
      ...links.map((l) => l.userId),
      ...microsites.map((m) => m.userId),
      ...shops.map((s) => s.userId),
    ]);

    return {
      totalLinks: links.length,
      totalClicks,
      totalMicrosites: microsites.length,
      totalShops: shops.length,
      totalOrders: orders.length,
      totalUsers: userIds.size,
    };
  },
});

// -------------------------------------------------------
// 2. LINKS CREATED PER DAY (last 30 days)
// -------------------------------------------------------
export const getLinksCreatedPerDay = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const links = await ctx.db.query("links").collect();
    const recentLinks = links.filter((l) => l.createdAt >= thirtyDaysAgo);

    const grouped: Record<string, number> = {};
    for (const link of recentLinks) {
      const date = new Date(link.createdAt).toISOString().split("T")[0];
      grouped[date] = (grouped[date] || 0) + 1;
    }

    const result = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const label = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        .toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      result.push({ date, label, count: grouped[date] || 0 });
    }

    return result;
  },
});

// -------------------------------------------------------
// 3. TOP LINKS BY CLICKS
// -------------------------------------------------------
export const getTopLinksByClicks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const links = await ctx.db.query("links").collect();
    return links
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, args.limit ?? 10);
  },
});

// -------------------------------------------------------
// 4. ALL LINKS (for recap table)
// -------------------------------------------------------
export const getAllLinksAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    return await ctx.db.query("links").order("desc").collect();
  },
});

// -------------------------------------------------------
// 5. USER STATS (grouped by userId)
// -------------------------------------------------------
export const getUserStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const [links, microsites, shops] = await Promise.all([
      ctx.db.query("links").collect(),
      ctx.db.query("microsites").collect(),
      ctx.db.query("shop_settings").collect(),
    ]);

    const userMap: Record<
      string,
      {
        userId: string;
        linkCount: number;
        micrositeCount: number;
        shopCount: number;
        totalClicks: number;
        lastActive: number;
        micrositeSlugs: string[];
        shopSlugs: string[];
      }
    > = {};

    for (const link of links) {
      if (!userMap[link.userId]) {
        userMap[link.userId] = {
          userId: link.userId,
          linkCount: 0,
          micrositeCount: 0,
          shopCount: 0,
          totalClicks: 0,
          lastActive: 0,
          micrositeSlugs: [],
          shopSlugs: [],
        };
      }
      userMap[link.userId].linkCount++;
      userMap[link.userId].totalClicks += link.clicks;
      userMap[link.userId].lastActive = Math.max(
        userMap[link.userId].lastActive,
        link.createdAt
      );
    }

    for (const ms of microsites) {
      if (!userMap[ms.userId]) {
        userMap[ms.userId] = {
          userId: ms.userId,
          linkCount: 0,
          micrositeCount: 0,
          shopCount: 0,
          totalClicks: 0,
          lastActive: 0,
          micrositeSlugs: [],
          shopSlugs: [],
        };
      }
      userMap[ms.userId].micrositeCount++;
      userMap[ms.userId].micrositeSlugs.push(ms.slug);
    }

    for (const shop of shops) {
      if (!userMap[shop.userId]) {
        userMap[shop.userId] = {
          userId: shop.userId,
          linkCount: 0,
          micrositeCount: 0,
          shopCount: 0,
          totalClicks: 0,
          lastActive: 0,
          micrositeSlugs: [],
          shopSlugs: [],
        };
      }
      userMap[shop.userId].shopCount++;
      if (shop.slug) userMap[shop.userId].shopSlugs.push(shop.slug);
    }

    return Object.values(userMap).sort((a, b) => b.totalClicks - a.totalClicks);
  },
});

// -------------------------------------------------------
// 6. LINKS BY SPECIFIC USER (for user detail)
// -------------------------------------------------------
export const getLinksByUserId = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    return await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// -------------------------------------------------------
// 7. CLICKS DISTRIBUTION BY USER
// -------------------------------------------------------
export const getClicksPerUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const links = await ctx.db.query("links").collect();

    const userClicks: Record<string, number> = {};
    for (const link of links) {
      userClicks[link.userId] = (userClicks[link.userId] || 0) + link.clicks;
    }

    return Object.entries(userClicks)
      .map(([userId, clicks]) => ({ userId, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  },
});

// -------------------------------------------------------
// 8. ADS MANAGEMENT
// -------------------------------------------------------

// Public: ambil iklan aktif (untuk halaman redirect)
export const getActiveAd = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("ads")
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
  },
});

// Admin: ambil semua iklan
export const getAllAds = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);
    return await ctx.db.query("ads").order("desc").collect();
  },
});

// Admin: buat iklan baru
export const createAd = mutation({
  args: {
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    if (args.isActive) {
      const allAds = await ctx.db.query("ads").collect();
      for (const ad of allAds) {
        if (ad.isActive) await ctx.db.patch(ad._id, { isActive: false });
      }
    }

    return await ctx.db.insert("ads", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Admin: edit iklan
export const updateAd = mutation({
  args: {
    id: v.id("ads"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const { id, ...data } = args;

    if (data.isActive) {
      const allAds = await ctx.db.query("ads").collect();
      for (const ad of allAds) {
        if (ad._id !== id && ad.isActive)
          await ctx.db.patch(ad._id, { isActive: false });
      }
    }

    await ctx.db.patch(id, data);
  },
});

// Admin: hapus iklan
export const deleteAd = mutation({
  args: { id: v.id("ads") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);
    await ctx.db.delete(args.id);
  },
});
