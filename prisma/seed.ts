import { PrismaClient, Rarity, UserRank } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hash } from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const img = (seed: string) =>
  `https://placehold.co/400x400/1a1a2e/e0e0e0?text=${encodeURIComponent(seed)}`;

interface PrizeData {
  name: string;
  image: string;
  rarity: Rarity;
  marketPrice: number;
  coinValue: number;
  weight: number;
}

const sneakerPrizes: PrizeData[] = [
  { name: "Air Jordan 1 Retro High OG", image: img("AJ1"), rarity: "UR", marketPrice: 85000, coinValue: 70000, weight: 1 },
  { name: "Nike Dunk Low Panda", image: img("Dunk"), rarity: "SSR", marketPrice: 25000, coinValue: 18000, weight: 3 },
  { name: "New Balance 990v6", image: img("NB990"), rarity: "SR", marketPrice: 18000, coinValue: 12000, weight: 8 },
  { name: "adidas Samba OG", image: img("Samba"), rarity: "R", marketPrice: 12000, coinValue: 8000, weight: 20 },
  { name: "Converse Chuck 70", image: img("Chuck"), rarity: "R", marketPrice: 9000, coinValue: 5000, weight: 25 },
  { name: "Vans Old Skool", image: img("Vans"), rarity: "N", marketPrice: 7000, coinValue: 3000, weight: 30 },
  { name: "ASICS Gel-Kayano 14", image: img("ASICS"), rarity: "N", marketPrice: 5000, coinValue: 2000, weight: 35 },
];

const cardPrizes: PrizeData[] = [
  { name: "リザードンex SAR", image: img("リザードン"), rarity: "UR", marketPrice: 120000, coinValue: 95000, weight: 1 },
  { name: "ピカチュウex SR", image: img("ピカチュウ"), rarity: "SSR", marketPrice: 35000, coinValue: 25000, weight: 2 },
  { name: "ミュウツーex RR", image: img("ミュウツー"), rarity: "SR", marketPrice: 8000, coinValue: 5000, weight: 10 },
  { name: "ルカリオ AR", image: img("ルカリオ"), rarity: "R", marketPrice: 3000, coinValue: 1500, weight: 25 },
  { name: "エースバーン R", image: img("エースバーン"), rarity: "R", marketPrice: 1500, coinValue: 800, weight: 30 },
  { name: "ポッポ C", image: img("ポッポ"), rarity: "N", marketPrice: 100, coinValue: 50, weight: 40 },
];

const figurePrizes: PrizeData[] = [
  { name: "ワンピース フィギュアーツ ルフィ ギア5", image: img("ルフィG5"), rarity: "UR", marketPrice: 45000, coinValue: 35000, weight: 1 },
  { name: "鬼滅の刃 煉獄杏寿郎 1/7", image: img("煉獄"), rarity: "SSR", marketPrice: 22000, coinValue: 16000, weight: 3 },
  { name: "呪術廻戦 五条悟 DXF", image: img("五条"), rarity: "SR", marketPrice: 8000, coinValue: 5000, weight: 10 },
  { name: "SPY×FAMILY アーニャ ちびぐるみ", image: img("アーニャ"), rarity: "R", marketPrice: 3500, coinValue: 2000, weight: 25 },
  { name: "ドラゴンボール 悟空 BWFC", image: img("悟空"), rarity: "R", marketPrice: 2000, coinValue: 1200, weight: 28 },
  { name: "ワンピース ワールドコレクタブル チョッパー", image: img("チョッパー"), rarity: "N", marketPrice: 500, coinValue: 200, weight: 40 },
];

const gamePrizes: PrizeData[] = [
  { name: "PlayStation 5 Pro", image: img("PS5Pro"), rarity: "UR", marketPrice: 120000, coinValue: 95000, weight: 1 },
  { name: "Nintendo Switch 2", image: img("Switch2"), rarity: "SSR", marketPrice: 50000, coinValue: 38000, weight: 2 },
  { name: "Steam Deck OLED", image: img("SteamDeck"), rarity: "SR", marketPrice: 65000, coinValue: 48000, weight: 5 },
  { name: "ゲーミングヘッドセット", image: img("Headset"), rarity: "R", marketPrice: 12000, coinValue: 7000, weight: 20 },
  { name: "ゲーミングマウス", image: img("Mouse"), rarity: "R", marketPrice: 8000, coinValue: 4000, weight: 30 },
  { name: "キーキャップセット", image: img("Keycap"), rarity: "N", marketPrice: 3000, coinValue: 1000, weight: 40 },
];

interface PackData {
  title: string;
  description: string;
  image: string;
  category: string;
  pricePerDraw: number;
  totalStock: number;
  remainingStock: number;
  featured: boolean;
  limitPerUser?: number;
  endsAt?: Date;
  prizes: PrizeData[];
  lastOnePrizeIndex?: number;
}

const packs: PackData[] = [
  {
    title: "超高額スニーカーくじ",
    description: "Air Jordan 1やDunk Lowが当たる！プレミアムスニーカー限定オリパ",
    image: img("スニーカーくじ"),
    category: "sneaker",
    pricePerDraw: 3000,
    totalStock: 100,
    remainingStock: 67,
    featured: true,
    prizes: sneakerPrizes,
    lastOnePrizeIndex: 0,
  },
  {
    title: "ポケカ 高レアリティくじ",
    description: "リザードンex SARが目玉！ポケモンカード最強オリパ",
    image: img("ポケカくじ"),
    category: "card",
    pricePerDraw: 5000,
    totalStock: 200,
    remainingStock: 142,
    featured: true,
    endsAt: new Date("2026-02-28T23:59:59Z"),
    prizes: cardPrizes,
    lastOnePrizeIndex: 0,
  },
  {
    title: "アニメフィギュア祭",
    description: "人気アニメのプレミアムフィギュアが当たるチャンス！",
    image: img("フィギュアくじ"),
    category: "figure",
    pricePerDraw: 2000,
    totalStock: 150,
    remainingStock: 98,
    featured: false,
    prizes: figurePrizes,
  },
  {
    title: "ゲーマーズドリーム",
    description: "PS5 ProやSwitch 2が当たる！最新ゲーム機オリパ",
    image: img("ゲームくじ"),
    category: "game",
    pricePerDraw: 4000,
    totalStock: 80,
    remainingStock: 23,
    featured: true,
    prizes: gamePrizes,
    lastOnePrizeIndex: 0,
  },
  {
    title: "ワンコインスニーカーくじ",
    description: "500コインで引ける！お手軽スニーカーオリパ",
    image: img("ワンコイン"),
    category: "sneaker",
    pricePerDraw: 500,
    totalStock: 500,
    remainingStock: 312,
    featured: false,
    prizes: sneakerPrizes.slice(3),
  },
  {
    title: "ポケカ ビギナーパック",
    description: "初心者向け！低価格で始められるポケカオリパ",
    image: img("ビギナー"),
    category: "card",
    pricePerDraw: 1000,
    totalStock: 300,
    remainingStock: 256,
    featured: false,
    prizes: cardPrizes.slice(2),
  },
  {
    title: "超プレミアムフィギュアくじ",
    description: "ギア5ルフィが目玉！限定100口の激レアオリパ",
    image: img("限定くじ"),
    category: "figure",
    pricePerDraw: 5000,
    totalStock: 100,
    remainingStock: 8,
    featured: true,
    limitPerUser: 5,
    prizes: figurePrizes,
    lastOnePrizeIndex: 0,
  },
  {
    title: "ゲーム周辺機器オリパ",
    description: "ゲーミングデバイスが当たるお得なオリパ",
    image: img("周辺機器"),
    category: "game",
    pricePerDraw: 1500,
    totalStock: 200,
    remainingStock: 177,
    featured: false,
    prizes: gamePrizes.slice(2),
  },
];

const chargePlans = [
  { coins: 1100, price: 1000, bonus: 100, firstTimeOnly: true, sortOrder: 0 },
  { coins: 1000, price: 1000, bonus: 0, sortOrder: 1 },
  { coins: 3200, price: 3000, bonus: 200, sortOrder: 2 },
  { coins: 5500, price: 5000, bonus: 500, isPopular: true, sortOrder: 3 },
  { coins: 11500, price: 10000, bonus: 1500, sortOrder: 4 },
  { coins: 24000, price: 20000, bonus: 4000, sortOrder: 5 },
  { coins: 55000, price: 50000, bonus: 5000, sortOrder: 6 },
];

const defaultCategories = [
  "sneaker",
  "card",
  "figure",
  "game",
  "other",
];

const defaultRankSettings: Array<{
  rank: UserRank;
  threshold: number;
  coinRate: number;
  mileRate: number;
  bonus: number;
  sortOrder: number;
}> = [
  { rank: "BEGINNER", threshold: 0, coinRate: 0, mileRate: 0.004, bonus: 0, sortOrder: 0 },
  { rank: "BRONZE", threshold: 100000, coinRate: 0.01, mileRate: 0.004, bonus: 1000, sortOrder: 1 },
  { rank: "SILVER", threshold: 300000, coinRate: 0.02, mileRate: 0.004, bonus: 5000, sortOrder: 2 },
  { rank: "GOLD", threshold: 800000, coinRate: 0.03, mileRate: 0.006, bonus: 15000, sortOrder: 3 },
  { rank: "PLATINUM", threshold: 2000000, coinRate: 0.04, mileRate: 0.007, bonus: 25000, sortOrder: 4 },
  { rank: "DIAMOND", threshold: 4500000, coinRate: 0.05, mileRate: 0.01, bonus: 50000, sortOrder: 5 },
  { rank: "VIP", threshold: 8000000, coinRate: 0.06, mileRate: 0.015, bonus: 100000, sortOrder: 6 },
];

function generateReferralCode(name: string, suffix: string) {
  const base = name.replace(/\s+/g, "").slice(0, 4).toUpperCase() || "ORPA";
  return `${base}${suffix}`.slice(0, 10);
}

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.tenantConfigVersion.deleteMany();
  await prisma.tenantContentOverride.deleteMany();
  await prisma.tenantFeatureFlag.deleteMany();
  await prisma.homeEventPack.deleteMany();
  await prisma.homeEvent.deleteMany();
  await prisma.homeBanner.deleteMany();
  await prisma.rankSetting.deleteMany();
  await prisma.mileExchangeOrder.deleteMany();
  await prisma.mileRewardItem.deleteMany();
  await prisma.phoneOtpChallenge.deleteMany();
  await prisma.userRankBonusGrant.deleteMany();
  await prisma.inviteLink.deleteMany();
  await prisma.mileageTransaction.deleteMany();
  await prisma.coinTransaction.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.ownedItem.deleteMany();
  await prisma.draw.deleteMany();
  await prisma.chargeOrder.deleteMany();
  await prisma.chargePlan.deleteMany();
  await prisma.packPrize.deleteMany();
  await prisma.oripaPack.deleteMany();
  await prisma.packCategory.deleteMany();
  await prisma.prize.deleteMany();
  await prisma.adminAuditLog.deleteMany();
  await prisma.tenant.deleteMany();

  await prisma.tenant.create({
    data: {
      id: "default",
      code: "default",
      name: "Default Tenant",
      isActive: true,
    },
  });

  for (const row of defaultRankSettings) {
    await prisma.rankSetting.create({
      data: {
        rank: row.rank,
        chargeThreshold: row.threshold,
        coinReturnRate: row.coinRate,
        mileReturnRate: row.mileRate,
        rankUpBonus: row.bonus,
        sortOrder: row.sortOrder,
        isActive: true,
        isPublished: true,
      },
    });
  }

  // Create charge plans
  for (const plan of chargePlans) {
    await prisma.chargePlan.create({ data: plan });
  }
  console.log(`Created ${chargePlans.length} charge plans`);

  for (const [index, name] of defaultCategories.entries()) {
    await prisma.packCategory.create({
      data: {
        name,
        sortOrder: index,
      },
    });
  }
  console.log(`Created ${defaultCategories.length} pack categories`);

  // Create prizes and packs
  for (const packData of packs) {
    // Create prizes first
    const createdPrizes = [];
    for (const prizeData of packData.prizes) {
      const prize = await prisma.prize.create({
        data: {
          name: prizeData.name,
          image: prizeData.image,
          genre: packData.category,
          rarity: prizeData.rarity,
          marketPrice: prizeData.marketPrice,
          costPrice: Math.floor(prizeData.marketPrice * 0.6),
          coinValue: prizeData.coinValue,
        },
      });
      createdPrizes.push({ ...prize, weight: prizeData.weight });
    }

    // Determine last-one prize
    const lastOnePrizeId =
      packData.lastOnePrizeIndex !== undefined
        ? createdPrizes[packData.lastOnePrizeIndex].id
        : null;

    // Create pack
    const pack = await prisma.oripaPack.create({
      data: {
        title: packData.title,
        description: packData.description,
        image: packData.image,
        category: packData.category,
        pricePerDraw: packData.pricePerDraw,
        totalStock: packData.totalStock,
        remainingStock: packData.remainingStock,
        status: "ACTIVE",
        featured: packData.featured,
        limitPerUser: packData.limitPerUser,
        endsAt: packData.endsAt,
        lastOnePrizeId,
      },
    });

    // Create pack prizes (join table with weights)
    for (const prize of createdPrizes) {
      const quantity = Math.ceil(packData.totalStock / packData.prizes.length);
      await prisma.packPrize.create({
        data: {
          packId: pack.id,
          prizeId: prize.id,
          weight: prize.weight,
          totalQuantity: quantity,
          remainingQuantity: Math.ceil(
            quantity * (packData.remainingStock / packData.totalStock),
          ),
        },
      });
    }

    console.log(`Created pack: ${packData.title} with ${createdPrizes.length} prizes`);
  }

  await prisma.homeBanner.createMany({
    data: [
      {
        title: "新規登録キャンペーン",
        imageUrl: img("初回限定バナー"),
        linkUrl: "/mypage",
        sortOrder: 0,
        isPublished: true,
      },
      {
        title: "週末イベント開催中",
        imageUrl: img("週末イベント"),
        linkUrl: "/",
        sortOrder: 1,
        isPublished: true,
      },
    ],
  });

  await prisma.mileRewardItem.createMany({
    data: [
      {
        name: "オリパ無料チケット",
        description: "1回無料でガチャを引けるチケット",
        imageUrl: img("無料チケット"),
        requiredMiles: 300,
        stock: 300,
        isPublished: true,
        sortOrder: 0,
      },
      {
        name: "限定サプライセット",
        description: "限定スリーブとローダーのセット",
        imageUrl: img("サプライ"),
        requiredMiles: 1200,
        stock: 80,
        isPublished: true,
        sortOrder: 1,
      },
    ],
  });

  // ─── Test Users ───────────────────────────────────────
  // Clear users (cascade deletes accounts/sessions)
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const password = await hash("test1234", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@oripa.test",
      name: "管理者テスト",
      hashedPassword: password,
      role: "ADMIN",
      rank: "DIAMOND",
      coins: 999999,
      miles: 12000,
      totalSpent: 0,
      totalCharged: 4600000,
      referralCode: generateReferralCode("admin", "A1"),
      emailVerified: new Date(),
    },
  });
  console.log("Created admin user: admin@oripa.test / test1234");

  const user1 = await prisma.user.create({
    data: {
      email: "user@oripa.test",
      name: "テストユーザー",
      hashedPassword: password,
      role: "USER",
      rank: "GOLD",
      coins: 15000,
      miles: 2500,
      totalSpent: 85000,
      totalCharged: 920000,
      referralCode: generateReferralCode("user", "B1"),
      emailVerified: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "tanaka@oripa.test",
      name: "田中太郎",
      hashedPassword: password,
      role: "USER",
      rank: "SILVER",
      coins: 3200,
      miles: 980,
      totalSpent: 24000,
      totalCharged: 350000,
      referralCode: generateReferralCode("tanaka", "C1"),
      emailVerified: new Date(),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "suzuki@oripa.test",
      name: "鈴木花子",
      hashedPassword: password,
      role: "USER",
      rank: "BEGINNER",
      coins: 500,
      miles: 110,
      totalSpent: 5000,
      totalCharged: 50000,
      referralCode: generateReferralCode("suzuki", "D1"),
      emailVerified: new Date(),
    },
  });
  console.log("Created 3 test users (all password: test1234)");

  // ─── Shipping Addresses ─────────────────────────────────
  const addr1 = await prisma.shippingAddress.create({
    data: {
      userId: user1.id,
      label: "自宅",
      postalCode: "150-0001",
      prefecture: "東京都",
      city: "渋谷区",
      address1: "神宮前1-2-3",
      address2: "オリパマンション 101",
      phone: "090-1234-5678",
      isDefault: true,
    },
  });

  await prisma.shippingAddress.create({
    data: {
      userId: user2.id,
      label: "自宅",
      postalCode: "530-0001",
      prefecture: "大阪府",
      city: "大阪市北区",
      address1: "梅田1-1-1",
      phone: "080-9876-5432",
      isDefault: true,
    },
  });

  // ─── Draw history & Owned Items ──────────────────────────
  // Get all packs with their packPrizes
  const allPacks = await prisma.oripaPack.findMany({
    include: { packPrizes: { include: { prize: true } } },
  });

  if (allPacks.length >= 2) {
    const homeEvent = await prisma.homeEvent.create({
      data: {
        title: "登録直後限定 超お得オリパ",
        subtitle: "初回ガチャまで",
        description: "新規ユーザー向けの期間限定イベント",
        imageUrl: img("新規限定イベント"),
        linkUrl: "/",
        newUserOnly: true,
        sortOrder: 0,
        isPublished: true,
      },
    });

    await prisma.homeEventPack.createMany({
      data: [
        { homeEventId: homeEvent.id, packId: allPacks[0].id, sortOrder: 0 },
        { homeEventId: homeEvent.id, packId: allPacks[1].id, sortOrder: 1 },
      ],
    });
  }

  const drawsToCreate: Array<{
    userId: string;
    packId: string;
    packPrizeId: string;
    prizeId: string;
    coinsCost: number;
    createdAt: Date;
  }> = [];

  // user1: 15 draws across multiple packs
  for (let i = 0; i < 15; i++) {
    const pack = allPacks[i % allPacks.length];
    const pp = pack.packPrizes[Math.floor(Math.random() * pack.packPrizes.length)];
    drawsToCreate.push({
      userId: user1.id,
      packId: pack.id,
      packPrizeId: pp.id,
      prizeId: pp.prizeId,
      coinsCost: pack.pricePerDraw,
      createdAt: new Date(Date.now() - (15 - i) * 86400000),
    });
  }

  // user2: 8 draws
  for (let i = 0; i < 8; i++) {
    const pack = allPacks[i % 4];
    const pp = pack.packPrizes[Math.floor(Math.random() * pack.packPrizes.length)];
    drawsToCreate.push({
      userId: user2.id,
      packId: pack.id,
      packPrizeId: pp.id,
      prizeId: pp.prizeId,
      coinsCost: pack.pricePerDraw,
      createdAt: new Date(Date.now() - (8 - i) * 86400000 * 2),
    });
  }

  // user3: 2 draws
  for (let i = 0; i < 2; i++) {
    const pack = allPacks[5]; // beginner pack
    const pp = pack.packPrizes[Math.floor(Math.random() * pack.packPrizes.length)];
    drawsToCreate.push({
      userId: user3.id,
      packId: pack.id,
      packPrizeId: pp.id,
      prizeId: pp.prizeId,
      coinsCost: pack.pricePerDraw,
      createdAt: new Date(Date.now() - 3 * 86400000),
    });
  }

  for (const drawData of drawsToCreate) {
    const draw = await prisma.draw.create({ data: drawData });
    // Create owned item for each draw
    await prisma.ownedItem.create({
      data: {
        userId: drawData.userId,
        prizeId: drawData.prizeId,
        drawId: draw.id,
        status: Math.random() > 0.7 ? "EXCHANGE_REQUESTED" : "OWNED",
      },
    });
  }
  console.log(`Created ${drawsToCreate.length} draws with owned items`);

  // ─── Coin Transactions ──────────────────────────────────
  const txData = [
    { userId: user1.id, amount: 55000, balance: 55000, type: "CHARGE", description: "50,000円チャージ（+5,000ボーナス）" },
    { userId: user1.id, amount: 11500, balance: 66500, type: "CHARGE", description: "10,000円チャージ（+1,500ボーナス）" },
    { userId: user1.id, amount: -3000, balance: 63500, type: "DRAW", description: "超高額スニーカーくじ x1" },
    { userId: user1.id, amount: -5000, balance: 58500, type: "DRAW", description: "ポケカ 高レアリティくじ x1" },
    { userId: user1.id, amount: 2000, balance: 60500, type: "EXCHANGE", description: "Vans Old Skool → コイン交換" },
    { userId: user2.id, amount: 24000, balance: 24000, type: "CHARGE", description: "20,000円チャージ（+4,000ボーナス）" },
    { userId: user2.id, amount: -4000, balance: 20000, type: "DRAW", description: "ゲーマーズドリーム x1" },
    { userId: user2.id, amount: -3000, balance: 17000, type: "DRAW", description: "超高額スニーカーくじ x1" },
    { userId: user3.id, amount: 5500, balance: 5500, type: "CHARGE", description: "5,000円チャージ（+500ボーナス）" },
    { userId: user3.id, amount: -1000, balance: 4500, type: "DRAW", description: "ポケカ ビギナーパック x1" },
  ];

  for (const tx of txData) {
    await prisma.coinTransaction.create({ data: tx });
  }
  console.log(`Created ${txData.length} coin transactions`);

  // ─── Charge Orders ──────────────────────────────────────
  const plans = await prisma.chargePlan.findMany({ orderBy: { sortOrder: "asc" } });
  await prisma.chargeOrder.create({
    data: {
      userId: user1.id,
      chargePlanId: plans[6].id, // 50,000円
      coins: 55000,
      amount: 50000,
      bonus: 5000,
      status: "COMPLETED",
      paymentMethod: "CREDIT_CARD",
    },
  });
  await prisma.chargeOrder.create({
    data: {
      userId: user1.id,
      chargePlanId: plans[4].id, // 10,000円
      coins: 11500,
      amount: 10000,
      bonus: 1500,
      status: "COMPLETED",
      paymentMethod: "PAYPAY",
    },
  });
  await prisma.chargeOrder.create({
    data: {
      userId: user2.id,
      chargePlanId: plans[5].id, // 20,000円
      coins: 24000,
      amount: 20000,
      bonus: 4000,
      status: "COMPLETED",
      paymentMethod: "CREDIT_CARD",
    },
  });
  console.log("Created charge orders");

  // ─── Shipment (user1 has one shipped) ───────────────────
  const ownedForShip = await prisma.ownedItem.findFirst({
    where: { userId: user1.id, status: "OWNED" },
  });
  if (ownedForShip) {
    await prisma.ownedItem.update({
      where: { id: ownedForShip.id },
      data: { status: "SHIPPING" },
    });
    const shipment = await prisma.shipment.create({
      data: {
        userId: user1.id,
        shippingAddressId: addr1.id,
        status: "SHIPPED",
        trackingNumber: "1234-5678-9012",
        carrier: "ヤマト運輸",
        shippingFee: 800,
      },
    });
    await prisma.shipmentItem.create({
      data: { shipmentId: shipment.id, ownedItemId: ownedForShip.id },
    });
    console.log("Created shipment for user1");
  }

  console.log("\n=== Seeding complete! ===");
  console.log("Login credentials (all password: test1234):");
  console.log("  Admin:  admin@oripa.test");
  console.log("  User 1: user@oripa.test (Gold, 15,000 coins)");
  console.log("  User 2: tanaka@oripa.test (Silver, 3,200 coins)");
  console.log("  User 3: suzuki@oripa.test (Beginner, 500 coins)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
