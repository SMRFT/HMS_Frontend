import React, { useState, useEffect } from "react";
import { Search, X, Trash2, Plus, Activity, BookOpen, ChevronDown, ChevronUp, Info } from "lucide-react";

const ICD11SearchComponent = ({ onDiseasesChange, initialDiseases = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState(initialDiseases);
  const [expandedCodes, setExpandedCodes] = useState({});
  const HMSURL = process.env.REACT_APP_BACKEND_HMS_BASE_URL
  
  // Notify parent when diseases change
  useEffect(() => {
    if (onDiseasesChange) {
      onDiseasesChange(selectedDiseases);
    }
  }, [selectedDiseases]);

  const searchICD11 = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`${HMSURL}icd11/search/?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSearchResults(data.destinationEntities || []);
    } catch (error) {
      console.error("Error searching ICD-11:", error);
      alert("Failed to search ICD-11 codes. Please try again.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchICD11(searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleCodeExpansion = (code) => {
    setExpandedCodes(prev => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const addDisease = (disease, selectedLabel = null) => {
    const diseaseToAdd = {
      code: disease.theCode,
      name: selectedLabel || disease.title.replace(/<\/?em[^>]*>/g, ''),
      id: `${disease.theCode}-${Date.now()}`
    };
    
    setSelectedDiseases(prev => [...prev, diseaseToAdd]);
    setShowModal(false);
    setSearchQuery("");
    setSearchResults([]);
    setExpandedCodes({});
  };

  const removeDisease = (id) => {
    setSelectedDiseases(prev => prev.filter(d => d.id !== id));
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchQuery("");
    setSearchResults([]);
    setExpandedCodes({});
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", width: "100%" }}>
      {selectedDiseases.length === 0 ? (
        <span style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic" }}>
          No ICD‑11 conditions added yet.
        </span>
      ) : (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {selectedDiseases.map((disease) => (
            <span
              key={disease.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#f0fdfa",
                border: "1.5px solid #99f6e4",
                borderRadius: 20,
                padding: "3px 10px 3px 12px",
                fontSize: 12,
                color: "#0f766e",
                fontWeight: 600,
                boxShadow: "0 1px 3px rgba(13, 148, 136, 0.08)",
              }}
            >
              <strong style={{ color: "#0d9488", fontFamily: "monospace", fontSize: 12.5 }}>
                {disease.code}
              </strong>
              <span style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={disease.name}>
                {disease.name}
              </span>
              <button
                type="button"
                onClick={() => removeDisease(disease.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 2,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ef4444",
                  borderRadius: "50%",
                  marginLeft: 2,
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fee2e2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                title="Remove disease"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "linear-gradient(135deg, #0d9488 0%, #0284c7 100%)",
          color: "#ffffff",
          border: "none",
          borderRadius: 8,
          padding: "5px 14px",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(13, 148, 136, 0.2)",
          whiteSpace: "nowrap",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        title="Search WHO ICD-11 diseases database"
      >
        <Search size={13} />
        <span>{selectedDiseases.length > 0 ? "+ Add More ICD-11" : "Search ICD-11"}</span>
      </button>

      {/* Search Modal */}
      {showModal && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 1060,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={closeModal}
        >
          <style>{`
            @keyframes icdSpin {
              to { transform: rotate(360deg); }
            }
            @keyframes icdModalIn {
              from { opacity: 0; transform: scale(0.97) translateY(8px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .icd11-title em, .icd11-synonym em {
              font-style: normal;
              font-weight: 700;
              color: #0f766e;
              background: #ccfbf1;
              padding: 1px 5px;
              border-radius: 4px;
            }
            .icd11-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .icd11-scroll::-webkit-scrollbar-track {
              background: #f1f5f9;
            }
            .icd11-scroll::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 3px;
            }
            .icd11-scroll::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>

          <div 
            style={{
              background: "#ffffff",
              borderRadius: 16,
              width: "min(960px, 95vw)",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.38), 0 0 0 1px rgba(13, 148, 136, 0.15)",
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              animation: "icdModalIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div 
              style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #0284c7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    flexShrink: 0,
                  }}
                >
                  <Activity size={20} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.2px" }}>
                      WHO ICD‑11 Diagnostic Coding
                    </h4>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        background: "rgba(255, 255, 255, 0.22)",
                        color: "#ffffff",
                        padding: "2px 7px",
                        borderRadius: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Clinical Search
                    </span>
                  </div>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255, 255, 255, 0.88)", fontWeight: 500 }}>
                    Official World Health Organization International Classification of Diseases (11th Revision)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "#ffffff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.28)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input Section */}
            <div 
              style={{
                padding: "16px 24px 12px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                flexShrink: 0,
              }}
            >
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: 10,
                  padding: "5px 6px 5px 14px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.15s ease",
                }}
              >
                <Search size={18} color="#0d9488" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type diagnosis, symptom or ICD-11 code (e.g. liver, diabetes, pneumonia)..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    color: "#0f172a",
                    fontWeight: 500,
                    background: "transparent",
                  }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: 4,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "50%",
                    }}
                    title="Clear"
                  >
                    <X size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || loading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: !searchQuery.trim() || loading 
                      ? "#cbd5e1" 
                      : "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: !searchQuery.trim() || loading ? "not-allowed" : "pointer",
                    boxShadow: !searchQuery.trim() || loading ? "none" : "0 2px 6px rgba(13, 148, 136, 0.25)",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Search size={14} />
                  <span>{loading ? "Searching..." : "Search"}</span>
                </button>
              </div>

              {/* Quick Search Chips */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Popular:
                </span>
                {["Liver", "Diabetes", "Hypertension", "Fever", "Bronchitis", "Pneumonia", "Fracture"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      searchICD11(term);
                    }}
                    style={{
                      border: "1px solid #e2e8f0",
                      background: "#ffffff",
                      color: "#334155",
                      borderRadius: 14,
                      padding: "2px 9px",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#0d9488";
                      e.currentTarget.style.color = "#0d9488";
                      e.currentTarget.style.background = "#f0fdfa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = "#334155";
                      e.currentTarget.style.background = "#ffffff";
                    }}
                  >
                    {term}
                  </button>
                ))}
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8" }}>
                  Press <kbd style={{ background: "#e2e8f0", padding: "1px 5px", borderRadius: 4, fontSize: 10, color: "#475569" }}>Enter ↵</kbd>
                </span>
              </div>
            </div>

            {/* Results Section */}
            <div 
              className="icd11-scroll"
              style={{
                flex: 1,
                minHeight: 280,
                maxHeight: 520,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "16px 24px",
                background: "#f8fafc",
              }}
            >
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 20px" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      border: "3px solid #ccfbf1",
                      borderTopColor: "#0d9488",
                      borderRadius: "50%",
                      animation: "icdSpin 0.8s linear infinite",
                    }}
                  />
                  <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: "#0f766e" }}>
                    Searching WHO ICD‑11 Database...
                  </div>
                  <div style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
                    Retrieving official diagnostic classifications and synonyms
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ textAlign: "center", padding: "45px 20px" }}>
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: "50%",
                      background: searchQuery ? "#fef2f2" : "#f0fdfa",
                      border: `2px solid ${searchQuery ? "#fecaca" : "#99f6e4"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 14px",
                      color: searchQuery ? "#ef4444" : "#0d9488",
                    }}
                  >
                    {searchQuery ? <Search size={24} /> : <BookOpen size={24} />}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                    {searchQuery ? "No diagnostic results found" : "Search Official ICD‑11 Conditions"}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#64748b", maxWidth: 440, margin: "6px auto 0", lineHeight: 1.5 }}>
                    {searchQuery
                      ? `No matches found for "${searchQuery}". Try broader clinical terms (e.g., "liver", "fracture") or check spelling.`
                      : "Type a diagnosis, symptom, or disease in the search box above or click any popular term to explore WHO codes."}
                  </div>
                </div>
              ) : (
                <div>
                  {/* Results Count & Column Header */}
                  <div 
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 14px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px 8px 0 0",
                      borderBottom: "2px solid #cbd5e1",
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: "#475569",
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                    }}
                  >
                    <div style={{ width: 110 }}>Code</div>
                    <div style={{ flex: 1, paddingLeft: 8 }}>Disease / Clinical Entity</div>
                    <div style={{ width: 90, textAlign: "right" }}>Action</div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    {searchResults.map((result) => (
                      <div 
                        key={result.id}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "12px 14px",
                          marginBottom: 8,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#99f6e4";
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(13, 148, 136, 0.08)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          {/* Code Badge */}
                          <div style={{ width: 110, flexShrink: 0 }}>
                            <span 
                              style={{
                                display: "inline-block",
                                background: "#f0fdfa",
                                border: "1.5px solid #99f6e4",
                                color: "#0f766e",
                                borderRadius: 6,
                                padding: "4px 9px",
                                fontFamily: "monospace",
                                fontSize: 13,
                                fontWeight: 800,
                                letterSpacing: "0.2px",
                              }}
                            >
                              {result.theCode}
                            </span>
                          </div>

                          {/* Disease Title & Synonyms */}
                          <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                            <div
                              onClick={() => addDisease(result)}
                              style={{
                                cursor: "pointer",
                                fontSize: 14,
                                fontWeight: 600,
                                color: "#0f172a",
                                lineHeight: 1.4,
                                transition: "color 0.15s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = "#0d9488")}
                              onMouseLeave={(e) => (e.currentTarget.style.color = "#0f172a")}
                              title="Click to select this disease"
                            >
                              <span 
                                className="icd11-title" 
                                dangerouslySetInnerHTML={{ __html: result.title }} 
                              />
                            </div>
                            
                            {result.matchingPVs && result.matchingPVs.length > 0 && (
                              <div style={{ marginTop: 6 }}>
                                <button
                                  type="button"
                                  onClick={() => toggleCodeExpansion(result.theCode)}
                                  style={{
                                    border: "1px solid #e2e8f0",
                                    background: "#f1f5f9",
                                    color: "#0f766e",
                                    borderRadius: 6,
                                    padding: "3px 8px",
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    transition: "all 0.12s ease",
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                                >
                                  {expandedCodes[result.theCode] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                  <span>
                                    {expandedCodes[result.theCode] ? "Hide" : "Show"} alternative labels ({result.matchingPVs.length})
                                  </span>
                                </button>

                                {expandedCodes[result.theCode] && (
                                  <div 
                                    style={{
                                      marginTop: 8,
                                      background: "#f8fafc",
                                      border: "1px solid #e2e8f0",
                                      borderRadius: 8,
                                      padding: "8px 10px",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: 6,
                                    }}
                                  >
                                    {result.matchingPVs.map((pv, idx) => (
                                      <div
                                        key={idx}
                                        onClick={() => addDisease(result, pv.label.replace(/<\/?em[^>]*>/g, ''))}
                                        style={{
                                          background: "#ffffff",
                                          border: "1px solid #e2e8f0",
                                          borderRadius: 6,
                                          padding: "7px 10px",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: 10,
                                          cursor: "pointer",
                                          transition: "all 0.12s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.borderColor = "#99f6e4";
                                          e.currentTarget.style.background = "#f0fdfa";
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.borderColor = "#e2e8f0";
                                          e.currentTarget.style.background = "#ffffff";
                                        }}
                                      >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div 
                                            className="icd11-synonym"
                                            style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}
                                            dangerouslySetInnerHTML={{ __html: pv.label }} 
                                          />
                                          {pv.propertyId && (
                                            <small style={{ fontSize: 10.5, color: "#94a3b8", textTransform: "capitalize" }}>
                                              {pv.propertyId}
                                            </small>
                                          )}
                                        </div>
                                        <span
                                          style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 4,
                                            background: "#f0fdf4",
                                            color: "#16a34a",
                                            border: "1px solid #bbf7d0",
                                            borderRadius: 14,
                                            padding: "2px 8px",
                                            fontSize: 11,
                                            fontWeight: 700,
                                            flexShrink: 0,
                                          }}
                                        >
                                          <Plus size={12} />
                                          <span>Select</span>
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Add Action Button */}
                          <div style={{ width: 90, flexShrink: 0, textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => addDisease(result)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                background: "#f0fdf4",
                                color: "#16a34a",
                                border: "1.5px solid #86efac",
                                borderRadius: 18,
                                padding: "5px 12px",
                                fontSize: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                boxShadow: "0 1px 2px rgba(22, 163, 74, 0.06)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#16a34a";
                                e.currentTarget.style.color = "#ffffff";
                                e.currentTarget.style.borderColor = "#16a34a";
                                e.currentTarget.style.boxShadow = "0 3px 8px rgba(22, 163, 74, 0.28)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#f0fdf4";
                                e.currentTarget.style.color = "#16a34a";
                                e.currentTarget.style.borderColor = "#86efac";
                                e.currentTarget.style.boxShadow = "0 1px 2px rgba(22, 163, 74, 0.06)";
                              }}
                              title="Select this diagnosis"
                            >
                              <Plus size={14} />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div 
              style={{
                padding: "12px 24px",
                background: "#ffffff",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#64748b" }}>
                <Info size={14} color="#0d9488" />
                <span>WHO ICD‑11 MMS • Clinical Diagnostic Coding Database</span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  padding: "6px 18px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#334155",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ICD11SearchComponent;