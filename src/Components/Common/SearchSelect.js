import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * SearchSelect - Reusable searchable dropdown with type-to-search filter,
 * Up/Down arrow keyboard navigation, teal active highlighting, Enter selection,
 * and synthetic mouse scroll protection matching Admission page UX.
 *
 * Rendered via createPortal to document.body with position:fixed so that
 * parent cards/tables with `overflow: hidden` or `overflow-x: auto` never clip the dropdown.
 *
 * Supports:
 * - `options`: Array of strings or objects { value, label, sub, subLabel }
 * - `children`: Standard `<option value="...">Label</option>` elements
 * - `value`: Current selected value
 * - `onChange`: Called with standard event { target: { name, value } }
 * - `placeholder`: Display text when nothing is selected
 * - `disabled`: Disable dropdown
 * - `error` / `$err`: Red border error indicator
 * - `name`: Form field name
 * - `height`: Custom trigger height (default: 34px)
 * - `style`: Additional styles
 */
export default function SearchSelect({
  options = [],
  children,
  value = "",
  onChange,
  placeholder,
  disabled = false,
  error = false,
  $err,
  name = "",
  style = {},
  height,
  className = "",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0, dropUp: false });
  const wrapRef = useRef(null);
  const dropPanelRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);
  const isKeyboardNav = useRef(false);
  const lastMousePos = useRef({ x: -1, y: -1 });

  const isError = Boolean(error || $err);

  // Parse options from either `options` prop or `children`
  const normOptions = useMemo(() => {
    let list = [];

    if (options && options.length > 0) {
      list = options;
    } else if (children) {
      React.Children.toArray(children).forEach((child) => {
        if (!child) return;
        if (child.type === "option") {
          const val = child.props.value !== undefined ? child.props.value : child.props.children;
          const lbl = child.props.children !== undefined ? child.props.children : val;
          list.push({
            value: val !== undefined && val !== null ? String(val) : "",
            label: typeof lbl === "string" || typeof lbl === "number" ? String(lbl) : String(val ?? ""),
            sub: child.props["data-sub"] || child.props.sub || "",
          });
        } else if (child.props && child.props.children) {
          React.Children.toArray(child.props.children).forEach((subChild) => {
            if (subChild && subChild.type === "option") {
              const val = subChild.props.value !== undefined ? subChild.props.value : subChild.props.children;
              const lbl = subChild.props.children !== undefined ? subChild.props.children : val;
              list.push({
                value: val !== undefined && val !== null ? String(val) : "",
                label: typeof lbl === "string" || typeof lbl === "number" ? String(lbl) : String(val ?? ""),
                sub: subChild.props["data-sub"] || subChild.props.sub || "",
              });
            }
          });
        }
      });
    }

    return list.map((opt) => {
      if (typeof opt === "string" || typeof opt === "number") {
        return { value: String(opt), label: String(opt), sub: "" };
      }
      const val = opt.value ?? opt.id ?? opt.employeeId ?? opt.packageNo ?? opt.code ?? opt.vendor_id ?? opt.outlet_code ?? "";
      const lbl = opt.label ?? opt.name ?? opt.employeeName ?? opt.packageName ?? opt.vendor_name ?? opt.outlet_name ?? String(val);
      const sub = opt.subLabel ?? opt.sub ?? (opt.totalPrice ? `₹${opt.totalPrice}` : "");
      return { value: String(val ?? ""), label: String(lbl ?? ""), sub: sub ? String(sub) : "" };
    });
  }, [options, children]);

  // Determine effective placeholder
  const effectivePlaceholder = useMemo(() => {
    if (placeholder) return placeholder;
    const emptyOpt = normOptions.find((o) => o.value === "");
    if (emptyOpt && emptyOpt.label) return emptyOpt.label;
    return "Search & select...";
  }, [placeholder, normOptions]);

  // Find currently selected option
  const selectedOpt = useMemo(() => {
    if (value === "" || value === null || value === undefined) return null;
    return normOptions.find((o) => String(o.value) === String(value)) || null;
  }, [normOptions, value]);

  // Filter options based on user search query
  const filtered = useMemo(() => {
    itemRefs.current = [];
    const isPrompt = (o) =>
      o.value === "" &&
      (o.label.startsWith("--") ||
        o.label.toLowerCase().includes("select") ||
        o.label.toLowerCase().includes("choose"));

    if (!query.trim()) {
      return normOptions.filter((o) => !isPrompt(o) || normOptions.length <= 1);
    }
    const q = query.toLowerCase();
    return normOptions.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        (o.sub && o.sub.toLowerCase().includes(q))
    );
  }, [normOptions, query]);

  // Update floating panel position based on trigger coordinates
  const updatePos = useCallback(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < 250 && rect.top > 250;
    setDropdownPos({
      top: dropUp ? rect.top - 4 : rect.bottom + 4,
      left: Math.max(6, rect.left),
      width: Math.max(rect.width, 160),
      dropUp,
    });
  }, []);

  // Sync position on open, scroll, or resize
  useEffect(() => {
    if (!isOpen) return;
    updatePos();
    const handleScrollOrResize = () => {
      updatePos();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePos]);

  // Sync highlightedIndex when menu opens or query changes
  useEffect(() => {
    if (isOpen) {
      const idx = filtered.findIndex((o) => String(o.value) === String(value));
      const targetIdx = idx >= 0 ? idx : (filtered.length > 0 ? 0 : -1);
      setHighlightedIndex(targetIdx);
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
        if (listRef.current && targetIdx >= 0 && itemRefs.current[targetIdx]) {
          try {
            itemRefs.current[targetIdx].scrollIntoView({ block: "nearest", behavior: "auto" });
          } catch (e) {}
        }
      }, 40);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, query]);

  // Precise scrolling on highlight change: works for both Up and Down arrows
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current && itemRefs.current[highlightedIndex]) {
      const container = listRef.current;
      const el = itemRefs.current[highlightedIndex];
      if (!el || !container) return;

      // 1. Native scrollIntoView
      try {
        el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
      } catch (err) {}

      // 2. Direct offsetTop bounds checking ensuring it is 100% inside container viewport
      const elTop = el.offsetTop;
      const elBottom = elTop + el.offsetHeight;
      const cTop = container.scrollTop;
      const cBottom = cTop + container.clientHeight;

      if (elTop < cTop) {
        container.scrollTop = elTop;
      } else if (elBottom > cBottom) {
        container.scrollTop = elBottom - container.clientHeight;
      }
    }
  }, [highlightedIndex, isOpen]);

  // Close when clicked outside both trigger and portal panel
  useEffect(() => {
    if (!isOpen) return;
    const handleOut = (e) => {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target) &&
        dropPanelRef.current && !dropPanelRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePos();
    }
    setIsOpen(!isOpen);
    setQuery("");
  };

  const fireChange = (newVal) => {
    if (onChange) {
      const syntheticEvent = {
        target: { name: name || "", value: newVal },
        currentTarget: { name: name || "", value: newVal },
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  const handleChoose = (opt) => {
    if (disabled || !opt) return;
    fireChange(opt.value);
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    fireChange("");
    setQuery("");
  };

  // Keyboard navigation handler for both input and trigger container
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        updatePos();
        setIsOpen(true);
        setQuery("");
        const idx = filtered.findIndex((o) => String(o.value) === String(value));
        if (e.key === "ArrowDown") {
          const next = idx >= 0 && idx < filtered.length - 1 ? idx + 1 : 0;
          setHighlightedIndex(next);
        } else {
          const prev = idx > 0 ? idx - 1 : (filtered.length > 0 ? filtered.length - 1 : 0);
          setHighlightedIndex(prev);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        updatePos();
        setIsOpen(true);
        setQuery("");
        const idx = filtered.findIndex((o) => String(o.value) === String(value));
        setHighlightedIndex(idx >= 0 ? idx : (filtered.length > 0 ? 0 : -1));
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length === 0) return;
      isKeyboardNav.current = true;
      setHighlightedIndex((prev) => {
        if (prev < 0) return 0;
        return Math.min(filtered.length - 1, prev + 1);
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length === 0) return;
      isKeyboardNav.current = true;
      setHighlightedIndex((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleChoose(filtered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Tab") {
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleChoose(filtered[highlightedIndex]);
      } else {
        setIsOpen(false);
        setQuery("");
      }
    }
  };

  // Only update hover index if user physically moved mouse (prevents scroll synthetic events overriding keyboard nav)
  const handleItemMouseMove = (idx, e) => {
    const dx = Math.abs(e.clientX - lastMousePos.current.x);
    const dy = Math.abs(e.clientY - lastMousePos.current.y);
    if (dx > 3 || dy > 3) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      isKeyboardNav.current = false;
      setHighlightedIndex(idx);
    }
  };

  const finalHeight = height || style.height || "34px";

  const dropdownMenu = isOpen && typeof document !== "undefined" && (
    <div
      ref={dropPanelRef}
      style={{
        position: "fixed",
        ...(dropdownPos.dropUp
          ? { bottom: `${Math.max(6, window.innerHeight - dropdownPos.top)}px` }
          : { top: `${Math.max(6, dropdownPos.top)}px` }),
        left: `${dropdownPos.left}px`,
        width: `${dropdownPos.width}px`,
        background: "#ffffff",
        border: "1.5px solid #0d9488",
        borderRadius: "7px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
        zIndex: 999999,
        maxHeight: "260px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sticky Search Filter Input */}
      <div
        style={{
          padding: "6px 8px",
          borderBottom: "1px solid #e2e8f0",
          background: "#f8fafc",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="🔍 Search or use ↑ / ↓ to navigate..."
          style={{
            width: "100%",
            height: "28px",
            padding: "0 8px",
            boxSizing: "border-box",
            fontSize: ".74rem",
            border: "1px solid #cbd5e1",
            borderRadius: "4px",
            outline: "none",
            background: "#ffffff",
            color: "#1e293b",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Options List */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: "210px",
          position: "relative",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "12px",
              fontSize: ".74rem",
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            No matches found
          </div>
        ) : (
          filtered.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;

            let itemBg = "transparent";
            let itemColor = "#111827";
            let itemWeight = 400;

            if (isHighlighted) {
              itemBg = "#0d9488";
              itemColor = "#ffffff";
              itemWeight = 700;
            } else if (isSelected) {
              itemBg = "#f0fdfa";
              itemColor = "#0f766e";
              itemWeight = 700;
            }

            return (
              <div
                key={opt.value || idx}
                ref={(el) => { itemRefs.current[idx] = el; }}
                onClick={() => handleChoose(opt)}
                onMouseMove={(e) => handleItemMouseMove(idx, e)}
                style={{
                  padding: "8px 12px",
                  fontSize: ".75rem",
                  cursor: "pointer",
                  background: itemBg,
                  color: itemColor,
                  fontWeight: itemWeight,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #f1f5f9",
                  userSelect: "none",
                  transition: "background .05s ease",
                }}
              >
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    color: itemColor,
                    fontWeight: itemWeight,
                  }}
                >
                  {opt.label}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8, flexShrink: 0 }}>
                  {opt.sub && (
                    <span
                      style={{
                        fontSize: ".65rem",
                        color: isHighlighted ? "#ccfbf1" : "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      {opt.sub}
                    </span>
                  )}
                  {isSelected && (
                    <span
                      style={{
                        fontSize: ".76rem",
                        fontWeight: 800,
                        color: isHighlighted ? "#ffffff" : "#0d9488",
                      }}
                    >
                      ✓
                    </span>
                  )}
                  {isHighlighted && !isSelected && (
                    <span
                      style={{
                        fontSize: ".62rem",
                        color: "#ccfbf1",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".04em",
                      }}
                    >
                      ↵ Enter
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={wrapRef}
        className={className}
        style={{
          position: "relative",
          width: style.width || "100%",
          minWidth: style.minWidth,
          fontFamily: "inherit",
          boxSizing: "border-box",
          ...style,
        }}
      >
        {/* ── Trigger Box ── */}
        <div
          tabIndex={disabled ? -1 : 0}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          style={{
            height: finalHeight,
            minHeight: finalHeight,
            boxSizing: "border-box",
            padding: "0 10px",
            fontSize: style.fontSize || ".81rem",
            border: isError ? "1.5px solid #ef4444" : isOpen ? "1.5px solid #0d9488" : "1px solid #d1d5db",
            borderRadius: style.borderRadius || "6px",
            background: disabled ? "#f3f4f6" : "#ffffff",
            color: disabled ? "#6b7280" : selectedOpt ? "#111827" : "#9ca3af",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: isOpen ? "0 0 0 2px #ccfbf1" : "none",
            userSelect: "none",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              fontWeight: selectedOpt ? 600 : 400,
            }}
          >
            {selectedOpt ? selectedOpt.label : effectivePlaceholder}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 6, flexShrink: 0 }}>
            {selectedOpt && !disabled && (
              <span
                onClick={handleClear}
                title="Clear selection"
                style={{
                  fontSize: ".7rem",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                ✕
              </span>
            )}
            <span style={{ fontSize: ".65rem", color: isOpen ? "#0d9488" : "#6b7280", fontWeight: 700 }}>
              {isOpen ? "▲" : "▼"}
            </span>
          </div>
        </div>
      </div>

      {dropdownMenu && createPortal(dropdownMenu, document.body)}
    </>
  );
}
