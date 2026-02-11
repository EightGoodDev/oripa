"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PackListItem, HomeBannerItem, HomeEventItem } from "@/types";
import { CATEGORY_LABELS, getCategoryLabel } from "@/types";
import Tabs from "@/components/ui/Tabs";
import OripaGrid from "@/components/oripa/OripaGrid";

type SortKey = "recommended" | "newest" | "price-asc" | "price-desc";
const DEFAULT_CATEGORY_ORDER = ["sneaker", "card", "figure", "game", "other"];

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "おすすめ" },
  { value: "newest", label: "新着" },
  { value: "price-asc", label: "安い順" },
  { value: "price-desc", label: "高い順" },
];

export default function HomeClient({
  packs,
  banners,
  events,
}: {
  packs: PackListItem[];
  banners: HomeBannerItem[];
  events: HomeEventItem[];
}) {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [activeBanner, setActiveBanner] = useState(0);
  const [pauseBanner, setPauseBanner] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || pauseBanner) return;

    const timer = window.setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % Math.max(1, banners.length));
    }, 4000);

    return () => window.clearInterval(timer);
  }, [banners.length, pauseBanner]);

  const normalizedBanner = banners.length > 0 ? activeBanner % banners.length : 0;

  const categoryTabs = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        packs
          .map((pack) => pack.category.trim())
          .filter((value) => value.length > 0),
      ),
    );

    const ordered = [
      ...DEFAULT_CATEGORY_ORDER.filter((category) =>
        uniqueCategories.includes(category),
      ),
      ...uniqueCategories
        .filter((category) => !DEFAULT_CATEGORY_ORDER.includes(category))
        .sort((a, b) => a.localeCompare(b, "ja")),
    ];

    return [
      { value: "all", label: CATEGORY_LABELS.all },
      ...ordered.map((value) => ({ value, label: getCategoryLabel(value) })),
    ];
  }, [packs]);

  const activeCategory = categoryTabs.some((tab) => tab.value === category)
    ? category
    : "all";

  const filtered = useMemo(() => {
    let result =
      activeCategory === "all"
        ? packs
        : packs.filter((p) => p.category === activeCategory);

    switch (sort) {
      case "price-asc":
        result = [...result].sort((a, b) => a.pricePerDraw - b.pricePerDraw);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.pricePerDraw - a.pricePerDraw);
        break;
      case "newest":
        result = [...result].reverse();
        break;
    }

    return result;
  }, [packs, activeCategory, sort]);

  return (
    <div className="pt-2 pb-4 space-y-3">
      {banners.length > 0 && (
        <section
          className="px-4"
          onMouseEnter={() => setPauseBanner(true)}
          onMouseLeave={() => setPauseBanner(false)}
          onTouchStart={() => setPauseBanner(true)}
          onTouchEnd={() => setPauseBanner(false)}
        >
          <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${normalizedBanner * 100}%)` }}
            >
              {banners.map((banner) => {
                const content = (
                  <div key={banner.id} className="relative shrink-0 w-full aspect-[16/5]">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title ?? "banner"}
                      fill
                      sizes="(max-width: 768px) 100vw, 760px"
                      className="object-cover"
                    />
                  </div>
                );

                return banner.linkUrl ? (
                  <Link key={banner.id} href={banner.linkUrl} className="shrink-0 w-full">
                    {content}
                  </Link>
                ) : (
                  <div key={banner.id} className="shrink-0 w-full">
                    {content}
                  </div>
                );
              })}
            </div>

            {banners.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="前へ"
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white"
                  onClick={() =>
                    setActiveBanner((prev) =>
                      prev === 0 ? banners.length - 1 : prev - 1,
                    )
                  }
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="次へ"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white"
                  onClick={() =>
                    setActiveBanner((prev) => (prev + 1) % banners.length)
                  }
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {banners.map((banner, index) => (
                    <button
                      type="button"
                      key={banner.id}
                      className={`w-2 h-2 rounded-full ${
                        index === normalizedBanner ? "bg-white" : "bg-white/40"
                      }`}
                      onClick={() => setActiveBanner(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {events.length > 0 && (
        <section className="px-4 space-y-3">
          {events.map((event) => {
            const firstPack = event.packs[0];
            const href = event.linkUrl ?? (firstPack ? `/oripa/${firstPack.id}` : "/");

            return (
              <div
                key={event.id}
                className="rounded-xl border border-yellow-700/40 bg-gradient-to-r from-yellow-500/20 via-orange-500/15 to-red-500/20 p-3"
              >
                <Link href={href} className="block">
                  <div className="relative rounded-lg overflow-hidden border border-yellow-400/30 aspect-[16/6]">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 760px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-center">
                      <p className="text-[11px] text-yellow-300 font-bold">EVENT</p>
                      <h2 className="text-sm md:text-base font-bold text-white mt-1">{event.title}</h2>
                      {event.subtitle && (
                        <p className="text-xs text-yellow-100 mt-0.5">{event.subtitle}</p>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {event.packs.map((pack) => (
                    <Link
                      key={pack.id}
                      href={`/oripa/${pack.id}`}
                      className="shrink-0 min-w-40 rounded-lg border border-gray-700 bg-gray-900/80 p-2"
                    >
                      <p className="text-xs text-white truncate">{pack.title}</p>
                      <p className="text-[11px] text-yellow-300 mt-1">{pack.pricePerDraw.toLocaleString()}コイン</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <Tabs tabs={categoryTabs} active={activeCategory} onChange={setCategory} />

      <div className="flex gap-1 px-4 py-1">
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              sort === opt.value
                ? "bg-gray-700 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <OripaGrid packs={filtered} />
    </div>
  );
}
