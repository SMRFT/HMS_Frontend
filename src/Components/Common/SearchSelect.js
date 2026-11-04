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
const focusNextElement = (currentEl, reverse = false) => {
  if (!currentEl || typeof document === "undefined") return;

  const focusables = Array.from(
    document.querySelectorAll(
      'button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]):not([tabindex="-1"]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    )
  ).filter((el) => {
    if (el.offsetWidth === 0 && el.offsetHeight === 0 && el.getClientRects().length === 0) return false;
    if (el.getAttribute("data-search-select-input") === "true") return false;
    if (el.getAttribute("tabindex") === "-1") return false;
    return true;
  });

  const curIdx = focusables.indexOf(currentEl);
  if (curIdx >= 0) {
    const nextIdx = reverse ? curIdx - 1 : curIdx + 1;
    if (nextIdx >= 0 && nextIdx < focusables.length) {
      focusables[nextIdx].focus();
      return;
    }
  } else {
    for (let i = 0; i < focusables.length; i++) {
      const pos = currentEl.compareDocumentPosition(focusables[i]);
      if (pos & (typeof Node !== "undefined" ? Node.DOCUMENT_POSITION_FOLLOWING : 4)) {
        const target = reverse ? Math.max(0, i - 1) : i;
        if (target >= 0 && target < focusables.length) {
          focusables[target].focus();
          return;
        }
      }
    }
  }
};

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
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0, dropUp: false });
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
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

  // Keep inputValue in sync with selectedOpt when dropdown is closed or selection changes
  useEffect(() => {
    if (!isOpen) {
      setInputValue(selectedOpt ? selectedOpt.label : "");
    }
  }, [selectedOpt, isOpen]);

  // Filter options based on user search query (prefix/first letters matching)
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
    const q = query.trim().toLowerCase();

    // Match based on first letters (prefix of name, prefix of any word in name, or ID prefix)
    return normOptions.filter((o) => {
      if (isPrompt(o)) return false;

      const rawLabel = String(o.label || "").toLowerCase();
      // Strip common prefixes like "Dr." or "Dr "
      const nameWithoutTitle = rawLabel.replace(/^(dr\.?|doctor)\s*/i, "").trim();

      // Check if name starts with query (e.g. "Arun Kumar" starts with "ar")
      if (nameWithoutTitle.startsWith(q) || rawLabel.startsWith(q)) return true;

      // Check if any individual word in the name starts with query
      const words = nameWithoutTitle.split(/[\s.\-_/,]+/).filter(Boolean);
      if (words.some((w) => w.startsWith(q))) return true;

      // Check if value / ID starts with query
      const val = String(o.value || "").toLowerCase();
      if (val && val.startsWith(q)) return true;

      // Check if sub (e.g. ID: 50722) has a word starting with query
      if (o.sub) {
        const subWords = String(o.sub).toLowerCase().split(/[\s:.\-_/,]+/).filter(Boolean);
        if (subWords.some((w) => w.startsWith(q))) return true;
      }

      return false;
    });
  }, [normOptions, query]);

  // Update floating panel position based on trigger coordinates
  const updatePos = useCallback(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < 250 && rect.top > 250;
    setDropdownPos({
      top: dropUp ? Math.round(rect.top - 2) : Math.round(rect.bottom + 2),
      left: Math.round(rect.left),
      width: Math.round(rect.width),
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
      let targetIdx = -1;
      if (query.trim()) {
        targetIdx = filtered.length > 0 ? 0 : -1;
      } else {
        const idx = filtered.findIndex((o) => String(o.value) === String(value));
        targetIdx = idx >= 0 ? idx : (filtered.length > 0 ? 0 : -1);
      }
      setHighlightedIndex(targetIdx);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          if (query) {
            try {
              inputRef.current.setSelectionRange(query.length, query.length);
            } catch (e) {}
          }
        }
        if (listRef.current && targetIdx >= 0 && itemRefs.current[targetIdx]) {
          try {
            itemRefs.current[targetIdx].scrollIntoView({ block: "nearest", behavior: "auto" });
          } catch (e) {}
        }
      }, 30);
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

      try {
        el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
      } catch (err) {}

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
        setInputValue(selectedOpt ? selectedOpt.label : "");
      }
    };
    document.addEventListener("mousedown", handleOut);
    return () => document.removeEventListener("mousedown", handleOut);
  }, [isOpen, selectedOpt]);

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

  const handleChoose = (opt, refocus = true) => {
    if (disabled || !opt) return;
    fireChange(opt.value);
    setInputValue(opt.label);
    setQuery("");
    setIsOpen(false);
    if (refocus) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 30);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    fireChange("");
    setInputValue("");
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
      updatePos();
      setIsOpen(true);
    }
  };

  const handleChevronClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      setQuery("");
      setInputValue(selectedOpt ? selectedOpt.label : "");
    } else {
      updatePos();
      setIsOpen(true);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  };

  const handleInputFocus = () => {
    if (disabled) return;
    setIsFocused(true);
    updatePos();
    setIsOpen(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.select();
      }
    }, 15);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleInputClick = () => {
    if (disabled) return;
    if (!isOpen) {
      updatePos();
      setIsOpen(true);
    }
    if (inputRef.current && !query) {
      inputRef.current.select();
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    setQuery(val);
    if (!isOpen) {
      updatePos();
      setIsOpen(true);
    }
  };

  // Keyboard navigation handler for single input
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
      } else if (e.key === "Enter") {
        e.preventDefault();
        updatePos();
        setIsOpen(true);
      } else if (e.key === "Tab") {
        const curInput = inputRef.current;
        focusNextElement(curInput, e.shiftKey);
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
        handleChoose(filtered[highlightedIndex], true);
      } else if (filtered.length === 1) {
        handleChoose(filtered[0], true);
      } else {
        setIsOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setQuery("");
      setInputValue(selectedOpt ? selectedOpt.label : "");
      if (inputRef.current) inputRef.current.blur();
    } else if (e.key === "Tab") {
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        handleChoose(filtered[highlightedIndex], false);
      } else {
        setIsOpen(false);
        setQuery("");
        setInputValue(selectedOpt ? selectedOpt.label : "");
      }
      const curInput = inputRef.current;
      setTimeout(() => {
        focusNextElement(curInput, e.shiftKey);
      }, 20);
    }
  };

  // Only update hover index if user physically moved mouse
  const handleItemMouseMove = (idx, e) => {
    const dx = Math.abs(e.clientX - lastMousePos.current.x);
    const dy = Math.abs(e.clientY - lastMousePos.current.y);
    if (dx > 3 || dy > 3) {
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      isKeyboardNav.current = false;
      setHighlightedIndex(idx);
    }
  };

  function highlightMatch(text, search) {
    if (!text) return "";
    if (!search || !search.trim()) return text;
    const q = search.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    try {
      const regex = new RegExp(`(${escaped})`, "gi");
      const parts = String(text).split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === q.toLowerCase() ? (
          <span
            key={i}
            style={{
              fontWeight: 800,
              textDecoration: "underline",
              background: "rgba(254, 240, 138, 0.45)",
              color: "inherit",
              borderRadius: "2px",
              padding: "0 1px",
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch (e) {
      return text;
    }
  }

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
        boxSizing: "border-box",
        background: "#ffffff",
        border: "1.5px solid #0d9488",
        borderRadius: "6px",
        boxShadow: "0 10px 25px rgba(15, 23, 42, 0.14), 0 3px 8px rgba(13, 148, 136, 0.10)",
        zIndex: 999999,
        maxHeight: "260px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Sleek status bar: shows count and keyboard hint matching exact width */}
      <div
        style={{
          padding: "5px 10px",
          borderBottom: "1px solid #f1f5f9",
          background: "#f8fafc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.7rem",
          color: "#64748b",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        <span>
          {query ? `Found: ${filtered.length}` : `Total: ${normOptions.length}`}
        </span>
        <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>
          ↑↓ navigate
        </span>
      </div>

      {/* Options List */}
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: "220px",
          position: "relative",
          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",
        }}
      >
        {filtered.length === 0 ? (
          <div
            style={{
              padding: "20px 14px",
              fontSize: "0.82rem",
              color: "#64748b",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ fontSize: "18px" }}>🔍</span>
            <span style={{ fontWeight: 600, color: "#334155", fontSize: "0.8rem" }}>
              No matches found
            </span>
          </div>
        ) : (
          filtered.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightedIndex;

            let itemBg = "transparent";
            let itemColor = "#0f172a";
            let itemWeight = 500;

            if (isHighlighted) {
              itemBg = "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)";
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
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => handleChoose(opt)}
                onMouseMove={(e) => handleItemMouseMove(idx, e)}
                style={{
                  padding: "8px 10px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  background: itemBg,
                  color: itemColor,
                  fontWeight: itemWeight,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #f1f5f9",
                  userSelect: "none",
                  transition: "background 0.08s ease",
                  gap: "8px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                      color: itemColor,
                      fontWeight: itemWeight,
                      fontSize: "0.84rem",
                    }}
                  >
                    {highlightMatch(opt.label, query)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                  {opt.sub && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "2px 6px",
                        borderRadius: "6px",
                        background: isHighlighted ? "rgba(255,255,255,0.22)" : "#f1f5f9",
                        color: isHighlighted ? "#ffffff" : "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {highlightMatch(opt.sub, query)}
                    </span>
                  )}
                  {isSelected && (
                    <span
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 800,
                        color: isHighlighted ? "#ffffff" : "#0d9488",
                      }}
                    >
                      ✓
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
        {/* ── Single Combobox Input Box ── */}
        <div
          onClick={() => {
            if (inputRef.current && !disabled) {
              inputRef.current.focus();
            }
          }}
          style={{
            height: finalHeight,
            minHeight: finalHeight,
            boxSizing: "border-box",
            padding: "0 8px 0 10px",
            border: isError
              ? "1.5px solid #ef4444"
              : (isOpen || isFocused)
              ? "1.5px solid #0d9488"
              : style.borderColor
              ? `1px solid ${style.borderColor}`
              : "1px solid #cbd5e1",
            borderRadius: style.borderRadius || "6px",
            background: disabled ? "#f8fafc" : "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: disabled ? "not-allowed" : "text",
            boxShadow: (isOpen || isFocused) ? "0 0 0 3px rgba(13, 148, 136, 0.15)" : "none",
            outline: "none",
            transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <input
            ref={inputRef}
            data-search-select-trigger="true"
            type="text"
            name={name}
            disabled={disabled}
            value={inputValue}
            placeholder={effectivePlaceholder}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
            style={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              padding: 0,
              margin: 0,
              fontSize: style.fontSize || ".85rem",
              fontWeight: selectedOpt && !isOpen ? 600 : 400,
              color: disabled ? "#94a3b8" : "#0f172a",
              cursor: disabled ? "not-allowed" : "text",
              fontFamily: "inherit",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginLeft: 6,
              flexShrink: 0,
            }}
          >
            {(inputValue || selectedOpt) && !disabled && (
              <span
                onClick={handleClear}
                title="Clear selection"
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "2px 4px",
                  borderRadius: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#dc2626";
                  e.currentTarget.style.background = "#fee2e2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                ✕
              </span>
            )}
            <span
              onClick={handleChevronClick}
              title={isOpen ? "Close" : "Open"}
              style={{
                fontSize: "10px",
                color: isOpen ? "#0d9488" : "#64748b",
                fontWeight: 700,
                transform: isOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s ease, color 0.2s ease",
                cursor: disabled ? "not-allowed" : "pointer",
                padding: "2px",
                display: "inline-block",
              }}
            >
              ▼
            </span>
          </div>
        </div>
      </div>

      {dropdownMenu && createPortal(dropdownMenu, document.body)}
    </>
  );
}
