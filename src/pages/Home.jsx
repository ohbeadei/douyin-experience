import React, { useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import initialMock from "../data/mockData.json";

const PAGE_SIZE = 6;
const PULL_THRESHOLD = 60;

function makeFakeItem(index) {
  const n = Date.now() + Math.floor(Math.random() * 10000) + index;
  return {
    id: `gen-${n}`,
    image: `https://i.pravatar.cc/300?img=${(n % 70) + 1}`,
    title: `自动生成文章 #${n}`,
    user: {
      avatar: `https://i.pravatar.cc/40?img=${(n % 70) + 1}`,
      name: `用户${(n % 1000) + 1}`,
    },
    likes: Math.floor(Math.random() * 200),
    liked: false,
  };
}

export default function Home() {
  const [allData, setAllData] = useState([...initialMock]);
  const [cards, setCards] = useState([]);
  const [page, setPage] = useState(1);
  const [columns, setColumns] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  // 下拉交互状态
  const startYRef = useRef(0);
  const pullRef = useRef(0);
  const pullingRef = useRef(false);
  const pullIndicatorRef = useRef(null);

  // 初始加载第一页
  useEffect(() => {
    setCards(allData.slice(0, PAGE_SIZE));
    setPage(1);
  }, [allData]);

  // 无限加载
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !sentinelRef.current) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { root: container, rootMargin: "200px", threshold: 0.01 }
    );

    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [cards, allData, page]);

  const loadMore = () => {
    const nextPage = page + 1;
    const neededCount = nextPage * PAGE_SIZE;

    if (allData.length < neededCount) {
      const toGenerate = neededCount - allData.length + 6;
      const newItems = Array.from({ length: toGenerate }).map((_, i) =>
        makeFakeItem(allData.length + i + 1)
      );
      setAllData((prev) => [...prev, ...newItems]);
      setCards((prev) => [...prev, ...newItems.slice(0, PAGE_SIZE)]);
      setPage(nextPage);
      return;
    }

    const nextCards = allData.slice(0, neededCount);
    setCards(nextCards);
    setPage(nextPage);
  };

  // 刷新
  const doRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setCards(allData.slice(0, PAGE_SIZE));
    setPage(1);
    setIsRefreshing(false);
  };

  // 下拉交互
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e) => {
      if (container.scrollTop > 0) return;
      pullingRef.current = true;
      startYRef.current = e.touches ? e.touches[0].clientY : e.clientY;
      pullRef.current = 0;
    };

    const onTouchMove = (e) => {
      if (!pullingRef.current) return;
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const diff = currentY - startYRef.current;
      if (diff > 0) {
        e.preventDefault?.();
        pullRef.current = Math.min(diff, 140);
        if (pullIndicatorRef.current) {
          pullIndicatorRef.current.style.height = `${pullRef.current}px`;
          pullIndicatorRef.current.style.opacity = Math.min(
            1,
            pullRef.current / PULL_THRESHOLD
          );
        }
      }
    };

    const onTouchEnd = () => {
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (pullRef.current >= PULL_THRESHOLD) {
        if (pullIndicatorRef.current) {
          pullIndicatorRef.current.style.height = `40px`;
          pullIndicatorRef.current.style.opacity = 1;
        }
        doRefresh().then(() => {
          if (pullIndicatorRef.current) {
            pullIndicatorRef.current.style.height = `0px`;
            pullIndicatorRef.current.style.opacity = 0;
          }
        });
      } else {
        if (pullIndicatorRef.current) {
          pullIndicatorRef.current.style.height = `0px`;
          pullIndicatorRef.current.style.opacity = 0;
        }
      }
      pullRef.current = 0;
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    container.addEventListener("mousedown", onTouchStart);
    window.addEventListener("mousemove", onTouchMove);
    window.addEventListener("mouseup", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("mousedown", onTouchStart);
      window.removeEventListener("mousemove", onTouchMove);
      window.removeEventListener("mouseup", onTouchEnd);
    };
  }, [allData]);

  const effectiveColumns = () => {
    const w = window.innerWidth;
    if (w < 640) return 1;
    return columns;
  };

  // 点赞回调
  const handleToggleLike = (id) => {
    setAllData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              liked: !item.liked,
              likes: item.liked ? item.likes - 1 : item.likes + 1,
            }
          : item
      )
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: "100vh",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background: "#f5f5f5",
      }}
    >
      <div
        ref={pullIndicatorRef}
        style={{
          height: 0,
          transition: "height 200ms ease, opacity 200ms ease",
          opacity: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: 14,
        }}
      >
        {isRefreshing ? "刷新中..." : "下拉刷新"}
      </div>

      <div style={{ padding: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setColumns((c) => (c === 1 ? 2 : 1))}
          style={{ padding: "6px 10px", borderRadius: 6 }}
        >
          切换为 {columns === 1 ? "双列" : "单列"}
        </button>

        <button onClick={doRefresh} style={{ padding: "6px 10px", borderRadius: 6 }}>
          手动刷新
        </button>

        <div style={{ marginLeft: "auto", fontSize: 12, color: "#666" }}>
          已加载 {cards.length} 条
        </div>
      </div>

      <div
        style={{
          padding: 12,
          maxWidth: 1100,
          margin: "0 auto",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns:
            effectiveColumns() === 1 ? "1fr" : "repeat(2, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {cards.map((c) => (
          <Card key={c.id} cardData={c} onToggleLike={() => handleToggleLike(c.id)} />
        ))}
        <div ref={sentinelRef} style={{ gridColumn: "1 / -1", height: 1 }} />
      </div>

      <div style={{ textAlign: "center", padding: 16, color: "#666" }}>
        向下滚动以加载更多
      </div>
    </div>
  );
}
