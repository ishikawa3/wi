import React from "react";

/**
 * Favorites List Component — Liquid Glass
 */
const FavoritesList = ({ favorites, onRemove, onFlyTo, darkMode = false }) => {
  if (favorites.length === 0) {
    return (
      <div style={{ fontSize: "12px", color: "var(--text-muted)", textAlign: "center", padding: "10px 0" }}>
        お気に入りはまだありません。<br />地点詳細から★で登録できます。
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {favorites.map((fav) => (
        <div
          key={fav.id}
          style={{
            padding: "10px 12px",
            backgroundColor: "var(--glass-bg)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "11px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
            <div>
              <span style={{ fontSize: "14px", color: "gold" }}>★</span>
              <span style={{ marginLeft: "6px", fontWeight: 700, color: "var(--text-primary)", fontSize: "13px" }}>
                {fav.wi_score != null ? `WI: ${fav.wi_score.toFixed(1)}` : "WI: N/A"}
              </span>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button
                onClick={() => onFlyTo(fav)}
                title="地図で表示"
                style={{
                  padding: "3px 8px",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                地図
              </button>
              <button
                onClick={() => onRemove(fav.id)}
                title="削除"
                style={{
                  padding: "3px 8px",
                  backgroundColor: "var(--accent-danger)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-xs)",
                  fontSize: "10px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                削除
              </button>
            </div>
          </div>
          {fav.address && (
            <div style={{ color: "var(--text-muted)", marginBottom: "2px", fontSize: "10px" }}>
              {fav.address.slice(0, 60)}{fav.address.length > 60 ? "..." : ""}
            </div>
          )}
          <div style={{ color: "var(--text-muted)", fontSize: "10px" }}>
            {new Date(fav.saved_at).toLocaleString("ja-JP", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </div>
          {fav.note && (
            <div style={{ color: "var(--text-muted)", fontStyle: "italic", marginTop: "4px", fontSize: "10px" }}>{fav.note}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;
