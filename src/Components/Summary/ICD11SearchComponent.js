import React, { useState, useEffect } from "react";
import { Search, X, Trash2, Plus } from "lucide-react";

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
    <div className="w-100">
      {/* Selected Diseases Table */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-light d-flex justify-content-between align-items-center py-3">
          <div className="d-flex gap-5">
            <h6 className="mb-0 fw-bold text-dark" style={{ minWidth: '120px' }}>Disease Code</h6>
            <h6 className="mb-0 fw-bold text-dark">Disease</h6>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-warning d-flex align-items-center gap-2"
            style={{ backgroundColor: '#f59e0b', borderColor: '#f59e0b' }}
          >
            <Search size={18} />
            Search ICD 11
          </button>
        </div>

        <div className="card-body p-0">
          {selectedDiseases.length === 0 ? (
            <div className="p-5 text-center text-muted">
              No diseases added. Click "Search ICD 11" to add diseases.
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {selectedDiseases.map((disease, index) => (
                <div 
                  key={disease.id} 
                  className={`list-group-item d-flex justify-content-between align-items-center ${index % 2 === 0 ? 'bg-light' : ''}`}
                >
                  <div className="d-flex gap-5 flex-grow-1">
                    <div style={{ minWidth: '120px' }} className="fw-semibold">{disease.code}</div>
                    <div className="flex-grow-1">{disease.name}</div>
                  </div>
                  <button
                    onClick={() => removeDisease(disease.id)}
                    className="btn btn-sm btn-outline-danger"
                    title="Remove disease"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      {showModal && (
        <div 
          className="modal d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={closeModal}
        >
          <div 
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              {/* Modal Header */}
              <div className="modal-header text-white" style={{ backgroundColor: '#0d9488' }}>
                <h4 className="modal-title">Diagnosis</h4>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeModal}
                ></button>
              </div>

              {/* Search Input */}
              <div className="modal-body">
                <div className="mb-4">
                  <div className="input-group">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Search ICD Disease"
                      className="form-control form-control-lg"
                      autoFocus
                    />
                    <button
                      onClick={handleSearch}
                      className="btn btn-secondary"
                      disabled={!searchQuery.trim() || loading}
                    >
                      <Search size={20} />
                    </button>
                  </div>
                </div>

                {/* Results */}
                <div style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
                  {loading ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      {searchQuery ? "No results found. Try a different search term." : "Enter a search term to find ICD-11 diseases"}
                    </div>
                  ) : (
                    <div>
                      <div className="row fw-bold border-bottom pb-2 mb-3 bg-light p-2">
                        <div className="col-3">Code</div>
                        <div className="col-9">Disease</div>
                      </div>
                      
                      {searchResults.map((result) => (
                        <div key={result.id} className="card mb-3 border">
                          <div className="card-body p-3">
                            <div className="row align-items-start">
                              <div className="col-3">
                                <span className="badge bg-primary fs-6 font-monospace">
                                  {result.theCode}
                                </span>
                              </div>
                              <div className="col-9">
                                <button
                                  onClick={() => addDisease(result)}
                                  className="btn btn-link text-start p-0 text-decoration-none text-dark w-100 d-flex align-items-start gap-2"
                                  style={{ transition: 'color 0.2s' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#0d9488'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#000'}
                                >
                                  <span 
                                    className="flex-grow-1" 
                                    dangerouslySetInnerHTML={{ __html: result.title }} 
                                  />
                                  <Plus size={20} className="flex-shrink-0 text-success" />
                                </button>
                                
                                {result.matchingPVs && result.matchingPVs.length > 0 && (
                                  <>
                                    <button
                                      onClick={() => toggleCodeExpansion(result.theCode)}
                                      className="btn btn-sm btn-link text-decoration-none mt-2"
                                      style={{ color: '#0d9488' }}
                                    >
                                      {expandedCodes[result.theCode] ? '− Hide' : '+ Show'} alternative labels ({result.matchingPVs.length})
                                    </button>

                                    {expandedCodes[result.theCode] && (
                                      <div className="mt-2 border-top pt-2">
                                        {result.matchingPVs.map((pv, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => addDisease(result, pv.label.replace(/<\/?em[^>]*>/g, ''))}
                                            className="btn btn-sm btn-outline-secondary w-100 text-start mb-2 d-flex justify-content-between align-items-center"
                                          >
                                            <div className="flex-grow-1">
                                              <span dangerouslySetInnerHTML={{ __html: pv.label }} />
                                              <div>
                                                <small className="text-muted">{pv.propertyId}</small>
                                              </div>
                                            </div>
                                            <Plus size={16} className="text-success" />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ICD11SearchComponent;