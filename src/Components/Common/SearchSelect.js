import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";

/**
 * SearchSelect - Reusable searchable dropdown with "type and search" filter,
 * matching the Admission page design and UX.
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0, dropUp: false });
  const wrapRef = useRef(null);
  const dropPanelRef = useRef(null);
  const inputRef = useRef(null);

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

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
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
    if (disabled) return;
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

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    } else if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleChoose(filtered[0]);
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
        border: "1.5px solid #cbd5e1",
        borderRadius: "7px",
        boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
        zIndex: 999999,
        maxHeight: "260px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sticky Search Filter Input */}
      <div
        style={{
          padding: "6px 8px",
          borderBottom: "1px solid #f1f5f9",
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
          placeholder="Type to filter..."
          style={{
            width: "100%",
            height: "28px",
            padding: "0 8px",
            boxSizing: "border-box",
            fontSize: ".78rem",
            border: "1px solid #cbd5e1",
            borderRadius: "5px",
            outline: "none",
            background: "#ffffff",
            color: "#1e293b",
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Options List */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "210px" }}>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "12px",
              fontSize: ".76rem",
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            No matches found
          </div>
        ) : (
          filtered.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                onClick={() => handleChoose(opt)}
                style={{
                  padding: "7px 10px",
                  fontSize: ".78rem",
                  cursor: "pointer",
                  background: isSelected ? "#f0fdf4" : "transparent",
                  color: isSelected ? "#0f766e" : "#1e293b",
                  fontWeight: isSelected ? 700 : 400,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #f8fafc",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e6f7f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSelected ? "#f0fdf4" : "transparent";
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {opt.label}
                </span>
                {opt.sub && (
                  <span
                    style={{
                      fontSize: ".68rem",
                      color: "#64748b",
                      marginLeft: 6,
                      flexShrink: 0,
                    }}
                  >
                    {opt.sub}
                  </span>
                )}
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
          onClick={handleToggle}
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
            boxShadow: isOpen ? "0 0 0 3px rgba(13,148,136,0.15)" : "none",
            userSelect: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              fontWeight: selectedOpt ? 500 : 400,
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
            <span style={{ fontSize: ".65rem", color: "#6b7280" }}>{isOpen ? "▲" : "▼"}</span>
          </div>
        </div>
      </div>

      {dropdownMenu && createPortal(dropdownMenu, document.body)}
    </>
  );
}
