import React from "react";

/**
 * Reusable High Risk Flag Badge
 * Displays a high risk flag icon + "High Risk" label + optional reason.
 */
export default function HighRiskBadge({
  reason = "",
  style = {},
  showReason = true,
  size = "sm",
}) {
  const isSm = size === "sm";
  const displayReason = typeof reason === "string" ? reason.trim() : "";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: "#fef2f2",
        color: "#b91c1c",
        border: "1px solid #fca5a5",
        padding: isSm ? "1.5px 6px" : "3px 8px",
        borderRadius: 4,
        fontSize: isSm ? "0.68rem" : "0.75rem",
        fontWeight: 700,
        lineHeight: 1.2,
        verticalAlign: "middle",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(185, 28, 28, 0.06)",
        cursor: "help",
        ...style,
      }}
      title={`🚩 High Risk Patient${displayReason ? `\nReason: ${displayReason}` : ""}`}
    >
      <span role="img" aria-label="high-risk-flag" style={{ fontSize: isSm ? "0.72rem" : "0.82rem" }}>
        🚩
      </span>
      <span>High Risk</span>
      {showReason && displayReason ? (
        <span
          style={{
            fontWeight: 600,
            color: "#991b1b",
            maxWidth: isSm ? 190 : 280,
            overflow: "hidden",
            textOverflow: "ellipsis",
            borderLeft: "1px solid #f87171",
            paddingLeft: 5,
            marginLeft: 2,
          }}
        >
          {displayReason}
        </span>
      ) : null}
    </span>
  );
}
