import React, { useState } from "react";

export default function Card({ cardData, onToggleLike }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      style={{
        border: "1px solid #e6e6e6",
        borderRadius: 10,
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
        color: "#333",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {!loaded && (
        <div
          style={{
            width: "100%",
            paddingTop: "56%",
            background: "#f0f0f0",
          }}
        />
      )}

    <img
  src={cardData.image}
  alt={cardData.title}
  // loading="lazy"  // 可以先注释掉
  onLoad={() => setLoaded(true)}
  style={{
    width: "100%",
    opacity: loaded ? 1 : 0,
    transition: "opacity .45s ease-in",
  }}
/>

      <div style={{ padding: 10 }}>
        <h3 style={{ margin: "8px 0", fontSize: 16, color: "#222" }}>
          {cardData.title}
        </h3>

        <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
          <img
            src={cardData.user.avatar}
            alt={cardData.user.name}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
          <span style={{ marginLeft: 8 }}>{cardData.user.name}</span>

          <button
            onClick={onToggleLike}
            style={{
              marginLeft: "auto",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ color: cardData.liked ? "red" : "#666", marginRight: 6 }}>
              {cardData.liked ? "❤️" : "🤍"}
            </span>
            <span style={{ color: "#333" }}>{cardData.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
