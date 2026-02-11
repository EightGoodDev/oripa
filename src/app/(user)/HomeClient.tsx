"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { PackListItem, HomeBannerItem, HomeEventItem } from "@/types";
import { CATEGORY_LABELS, getCategoryLabel } from "@/types";
import Tabs from "@/components/ui/Tabs";
import OripaGrid from "@/components/oripa/OripaGrid";
import OripaCard from "@/components/oripa/OripaCard";

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
                  <div key={banner.id} className="relative shrink-0 w-full aspect-[4/1]">
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
            const href = event.linkUrl || (firstPack ? `/oripa/${firstPack.id}` : null);
            const backgroundColor = event.backgroundColor || "#4b1d1d";
            const borderColor = event.borderColor || "#f59e0b";
            const textColor = event.textColor || "#fff7ed";
            const hasImage = Boolean(event.imageUrl);

            return (
              <div
                key={event.id}
                className="rounded-xl border p-2.5 space-y-2"
                style={{
                  borderColor,
                  backgroundColor: "#111827",
                }}
              >
                {href ? (
                  <Link href={href} className="block">
                    {hasImage ? (
                      <div
                        className="relative rounded-lg overflow-hidden border aspect-[4/1]"
                        style={{ borderColor, backgroundColor }}
                      >
                        <Image
                          src={event.imageUrl!}
                          alt={event.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 760px"
                        />
                        <div className="absolute inset-0 bg-black/35" />
                        <div className="absolute inset-0 px-3 flex flex-col items-center justify-center text-center">
                          <h2 className="text-sm md:text-base font-bold" style={{ color: textColor }}>
                            {event.title}
                          </h2>
                          {event.subtitle && (
                            <p className="text-[11px] mt-0.5 opacity-90" style={{ color: textColor }}>
                              {event.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-9 rounded-lg border px-3 flex items-center justify-center text-center"
                        style={{ borderColor, backgroundColor }}
                      >
                        <h2 className="text-xs font-bold truncate" style={{ color: textColor }}>
                          {event.title}
                        </h2>
                      </div>
                    )}
                  </Link>
                ) : hasImage ? (
                  <div
                    className="relative rounded-lg overflow-hidden border aspect-[4/1]"
                    style={{ borderColor, backgroundColor }}
                  >
                    <Image
                      src={event.imageUrl!}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 760px"
                    />
                    <div className="absolute inset-0 bg-black/35" />
                    <div className="absolute inset-0 px-3 flex flex-col items-center justify-center text-center">
                      <h2 className="text-sm md:text-base font-bold" style={{ color: textColor }}>
                        {event.title}
                      </h2>
                      {event.subtitle && (
                        <p className="text-[11px] mt-0.5 opacity-90" style={{ color: textColor }}>
                          {event.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className="h-9 rounded-lg border px-3 flex items-center justify-center text-center"
                    style={{ borderColor, backgroundColor }}
                  >
                    <h2 className="text-xs font-bold truncate" style={{ color: textColor }}>
                      {event.title}
                    </h2>
                  </div>
                )}

                {event.packs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {event.packs.map((pack) => (
                      <OripaCard key={pack.id} pack={pack} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 px-1 py-1">対象パックはありません</p>
                )}
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
