import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { DatePicker, ConfigProvider, Modal } from "antd";
import dayjs from "dayjs";
import apiRequest from "../../Auth/apiRequest";
import * as S from "../GlobalStyles";

const Hmsbaseurl = (process.env.REACT_APP_BACKEND_HMS_BASE_URL || "").replace(/\/$/, "");

const FormCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #edf2f7;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  margin-top: 16px;
  overflow: hidden;
`;

const FormHeader = styled.div`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  padding: 20px 24px;
  color: white;
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  p {
    margin: 4px 0 0;
    font-size: 0.85rem;
    opacity: 0.9;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  padding: 8px;
  border: 1px solid #c0dbff;
  border-radius: 6px;
  background: #f8fafc;
  min-height: 42px;
  align-items: center;
`;

const Chip = styled.span`
  background: #0d9488;
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: default;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

  button {
    background: none;
    border: none;
    color: white;
    font-weight: bold;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 0;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }
`;

const AttachmentPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
`;

const PreviewCard = styled.div`
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 8px;
  position: relative;
  background: #f8fafc;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  span {
    font-size: 0.75rem;
    color: #475569;
    word-break: break-all;
    margin-top: 6px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  button {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #fee2e2;
    color: #ef4444;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    &:hover {
      background: #fca5a5;
    }
  }
`;

const PreviewThumb = styled.div`
  width: 50px;
  height: 50px;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  background-image: ${props => props.$url ? `url(${props.$url})` : "none"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #64748b;
`;

const StatusBadge = styled.span`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background-color: ${props => {
    switch (props.$status?.toLowerCase()) {
      case "completed":
        return "#f0fdf4";
      case "in progress":
        return "#eff6ff";
      case "pending":
      default:
        return "#fffbeb";
    }
  }};
  color: ${props => {
    switch (props.$status?.toLowerCase()) {
      case "completed":
        return "#16a34a";
      case "in progress":
        return "#2563eb";
      case "pending":
      default:
        return "#d97706";
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status?.toLowerCase()) {
      case "completed":
        return "#bbf7d0";
      case "in progress":
        return "#bfdbfe";
      case "pending":
      default:
        return "#fde68a";
    }
  }};
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 2px;
`;

const DetailValue = styled.div`
  font-size: 0.9rem;
  color: #0f172a;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #edf2f7;
  min-height: 36px;
  white-space: pre-wrap;
`;

const DownloadLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #0d9488;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.8rem;
  margin-top: 4px;
  cursor: pointer;
  &:hover {
    color: #0f766e;
    text-decoration: underline;
  }
`;

const getPdfUrl = (dataUrl) => {
  if (!dataUrl) return "";
  if (dataUrl.startsWith("data:application/pdf;base64,")) {
    try {
      const base64Data = dataUrl.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Error converting base64 to Blob URL", e);
      return dataUrl;
    }
  }
  return dataUrl;
};

const Complaints = () => {
  const employeeId = localStorage.getItem("employeeId") || "EMP001";
  const employeeName = localStorage.getItem("name") || "Hospital Staff";

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Detail Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [environment, setEnvironment] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [ticketType, setTicketType] = useState("Issue");
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [previewFile, setPreviewFile] = useState(null);

  // Auto-detect environment details and fetch history on mount
  useEffect(() => {
    const detectEnvironment = () => {
      const ua = navigator.userAgent;
      let os = "Unknown OS";
      
      if (ua.indexOf("Win") !== -1) {
        os = "Windows";
        const winMatch = ua.match(/Windows NT ([\d.]+)/);
        if (winMatch) {
          const version = winMatch[1];
          if (version === "10.0") os = "Windows 10/11";
          else if (version === "6.3") os = "Windows 8.1";
          else if (version === "6.2") os = "Windows 8";
          else if (version === "6.1") os = "Windows 7";
          else if (version === "6.0") os = "Windows Vista";
          else if (version === "5.1") os = "Windows XP";
          else os = `Windows NT ${version}`;
        }
      } else if (ua.indexOf("Mac") !== -1) os = "MacOS";
      else if (ua.indexOf("X11") !== -1) os = "UNIX";
      else if (ua.indexOf("Linux") !== -1) os = "Linux";
      else if (/Android/.test(ua)) os = "Android";
      else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";

      let browser = "Unknown Browser";
      let version = "";

      // Detect Brave browser via navigator.brave object
      const isBrave = !!(navigator.brave && typeof navigator.brave.isBrave === "function");

      if (isBrave) {
        browser = "Brave";
        const match = ua.match(/(?:Chrome|Brave)\/(\d+\.\d+)/);
        if (match) version = match[1];
      } else if (ua.indexOf("Firefox") !== -1) {
        browser = "Firefox";
        const match = ua.match(/Firefox\/(\d+\.\d+)/);
        if (match) version = match[1];
      } else if (ua.indexOf("Chrome") !== -1) {
        browser = "Chrome";
        const match = ua.match(/Chrome\/(\d+\.\d+)/);
        if (match) version = match[1];
      } else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) {
        browser = "Safari";
        const match = ua.match(/Version\/(\d+\.\d+)/);
        if (match) version = match[1];
      } else if (ua.indexOf("MSIE") !== -1 || !!document.documentMode === true) {
        browser = "IE";
      } else if (ua.indexOf("Edg") !== -1) {
        browser = "Edge";
        const match = ua.match(/Edg\/(\d+\.\d+)/);
        if (match) version = match[1];
      }
      return `${os}, ${browser} ${version ? "v" + version : ""}`.trim();
    };

    setEnvironment(detectEnvironment());
    fetchHistory();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const res = await apiRequest(`${Hmsbaseurl}/complaints/departments/`, "GET");
    if (res.success && Array.isArray(res.data)) {
      setDepartments(res.data);
    } else {
      console.error("Failed to fetch departments list");
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    const res = await apiRequest(`${Hmsbaseurl}/complaints/?employee_id=${employeeId}`, "GET");
    if (res.success && Array.isArray(res.data)) {
      setHistory(res.data);
    } else {
      toast.error("Failed to fetch complaints history");
    }
    setLoading(false);
  };

  const handleAddTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && currentTag.trim()) {
      e.preventDefault();
      const val = currentTag.trim().toLowerCase();
      if (!tags.includes(val)) {
        setTags([...tags, val]);
      }
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [
          ...prev,
          {
            name: file.name,
            url: reader.result, // base64 string
            file_type: file.type
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Clear target value to allow re-uploading same file
    e.target.value = null;
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!title.trim()) {
      return toast.warning("Complaint Title is required");
    }

    setLoading(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      steps_to_reproduce: steps.trim(),
      environment: environment.trim(),
      ticket_type: ticketType,
      department: department,
      labels_tags: tags,
      attachments: attachments,
      reporter: employeeId,
      status: "Pending"
    };

    const res = await apiRequest(`${Hmsbaseurl}/complaints/`, "POST", payload);
    if (res.success) {
      toast.success("Complaint Ticket raised successfully!");
      // Reset form (keeping the auto-detected environment)
      setTitle("");
      setDescription("");
      setSteps("");
      setTicketType("Issue");
      setDepartment("");
      setTags([]);
      setAttachments([]);
      setIsFormOpen(false);
      // Refresh history list
      fetchHistory();
    } else {
      toast.error(res.error || "Failed to raise complaint ticket");
    }
    setLoading(false);
  };

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#0d9488" } }}>
      <S.PageWrapper>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color: "#0f172a" }}>Complaints & Support Center</h1>
            <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "0.85rem" }}>Submit complaints or request IT and system assistance</p>
          </div>
          <S.Button 
            onClick={() => setIsFormOpen(!isFormOpen)} 
            style={{ 
              padding: "10px 24px", 
              fontSize: "0.88rem", 
              fontWeight: 700, 
              borderRadius: "8px",
              background: isFormOpen ? S.colors.secondary : S.colors.primary,
              borderColor: isFormOpen ? S.colors.secondary : S.colors.primary,
              color: "white",
              transition: "all 0.3s ease"
            }}
          >
            {isFormOpen ? "- Close Form" : "+ Raise Complaint or Ticket"}
          </S.Button>
        </div>

        {/* Raise Ticket Form Inline Panel (Accordion style with slide Down transition) */}
        {isFormOpen && (
          <FormCard style={{ marginBottom: "24px", border: `1px solid ${S.colors.primary}` }}>
            <FormHeader style={{ background: `linear-gradient(135deg, ${S.colors.primary} 0%, ${S.colors.primaryDark} 100%)`, padding: "16px 24px" }}>
              <h3>+ Create New Complaint or Support Ticket</h3>
              <p>Provide detailed information. Auto-detected system environment is attached automatically.</p>
            </FormHeader>
            <div style={{ padding: "24px" }}>
              <form onSubmit={handleSubmit}>
                <S.FormRow style={{ gridTemplateColumns: "1fr" }}>
                  <S.InputWrapper>
                    <S.Label required>Issue Title</S.Label>
                    <S.Input 
                      placeholder="e.g. Pharmacy Stock Calculation Mismatch" 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </S.InputWrapper>
                </S.FormRow>

                 <S.FormRow style={{ gridTemplateColumns: "1fr", marginTop: "12px" }}>
                  <S.InputWrapper>
                    <S.Label required>Ticket Type</S.Label>
                    <div style={{ display: "flex", gap: "24px", marginTop: "4px", alignItems: "center" }}>
                      {[
                        { label: "Issue", value: "Issue" },
                        { label: "Add ons", value: "Add ons" },
                        { label: "Changes", value: "Changes" }
                      ].map(opt => (
                        <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer", fontWeight: 600, color: "#475569" }}>
                          <input 
                            type="radio" 
                            name="ticket_type"
                            value={opt.value}
                            checked={ticketType === opt.value}
                            onChange={() => setTicketType(opt.value)}
                            style={{ 
                              cursor: "pointer",
                              accentColor: S.colors.primary,
                              width: "16px",
                              height: "16px"
                            }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </S.InputWrapper>
                </S.FormRow>

                <S.FormRow style={{ gridTemplateColumns: "1fr", marginTop: "12px" }}>
                  <S.InputWrapper>
                    <S.Label required>Related Department</S.Label>
                    <S.Select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      required
                      style={{ width: "50%", height: "38px" }}
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map(dept => (
                        <option key={dept.department_code} value={dept.department_name}>
                          {dept.department_name}
                        </option>
                      ))}
                    </S.Select>
                  </S.InputWrapper>
                </S.FormRow>

                <S.FormRow style={{ gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                  <S.InputWrapper>
                    <S.Label>Description / Details</S.Label>
                    <S.TextArea 
                      placeholder="Describe what occurred, what was expected, and details about the error..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      style={{ minHeight: "100px" }}
                    />
                  </S.InputWrapper>
                  <S.InputWrapper>
                    <S.Label>Steps to Reproduce</S.Label>
                    <S.TextArea 
                      placeholder="1. Go to page X&#13;2. Click on Z..."
                      value={steps}
                      onChange={e => setSteps(e.target.value)}
                      style={{ minHeight: "100px" }}
                    />
                  </S.InputWrapper>
                </S.FormRow>

                <S.FormRow style={{ gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                  <S.InputWrapper>
                    <S.Label>Environment (OS, Browser, Version...)</S.Label>
                    <S.TextArea 
                      placeholder="Auto-detected environment..."
                      value={environment}
                      onChange={e => setEnvironment(e.target.value)}
                      style={{ minHeight: "80px" }}
                    />
                  </S.InputWrapper>
                  <S.InputWrapper>
                    <S.Label>Labels / Tags (Press Enter or Comma to add)</S.Label>
                    <S.Input 
                      placeholder="billing, urgent, backend, layout"
                      value={currentTag}
                      onChange={e => setCurrentTag(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                    <ChipContainer>
                      {tags.length === 0 && <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No tags added yet</span>}
                      {tags.map(t => (
                        <Chip key={t}>
                          {t}
                          <button type="button" onClick={() => handleRemoveTag(t)}>&times;</button>
                        </Chip>
                      ))}
                    </ChipContainer>
                  </S.InputWrapper>
                </S.FormRow>

                <div style={{ marginTop: "16px", borderTop: "1px solid #edf2f7", paddingTop: "16px" }}>
                  <S.Label>Attachments / Screenshots</S.Label>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                    <label style={{
                      padding: "8px 16px",
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#475569"
                    }}>
                      📁 Choose Files
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*,application/pdf,text/*" 
                        onChange={handleFileUpload} 
                        style={{ display: "none" }} 
                      />
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Images, PDFs, or Text files are supported.</span>
                  </div>

                  <AttachmentPreview>
                    {attachments.map((file, idx) => {
                      const isImage = file.file_type?.startsWith("image/");
                      return (
                        <PreviewCard key={idx}>
                          <button type="button" onClick={() => handleRemoveAttachment(idx)}>&times;</button>
                          {isImage ? (
                            <PreviewThumb $url={file.url} />
                          ) : (
                            <PreviewThumb>📄</PreviewThumb>
                          )}
                          <span>{file.name}</span>
                        </PreviewCard>
                      );
                    })}
                  </AttachmentPreview>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px", borderTop: "1px solid #edf2f7", paddingTop: "16px" }}>
                  <S.Button 
                    type="button" 
                    secondary 
                    onClick={() => setIsFormOpen(false)}
                    style={{ padding: "8px 20px" }}
                  >
                    Cancel
                  </S.Button>
                  <S.Button 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: "8px 24px", background: S.colors.primary, borderColor: S.colors.primary }}
                  >
                    {loading ? "Submitting..." : "Generate & Save Ticket"}
                  </S.Button>
                </div>
              </form>
            </div>
          </FormCard>
        )}

        <S.FormContent style={{ padding: 0, marginTop: "16px" }}>
          <S.TableWrapper>
            <S.Table>
              <thead>
                <tr>
                  <S.Th width="120">TICKET ID</S.Th>
                  <S.Th width="120">TYPE</S.Th>
                  <S.Th>TITLE</S.Th>
                  <S.Th width="120">STATUS</S.Th>
                  <S.Th width="120">PRIORITY</S.Th>
                  <S.Th width="150">DATE REPORTED</S.Th>
                  <S.Th width="120" style={{ textAlign: "center" }}>ACTIONS</S.Th>
                </tr>
              </thead>
              <tbody>
                {loading && history.length === 0 ? (
                  <tr>
                    <S.Td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                      Loading history...
                    </S.Td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <S.Td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                      <div style={{ fontSize: "2.5rem" }}>🎫</div>
                      <div style={{ fontWeight: 600, marginTop: "8px" }}>No tickets raised yet</div>
                      <div style={{ fontSize: "0.75rem" }}>Your ticket history will be listed here.</div>
                    </S.Td>
                  </tr>
                ) : (
                  history.map(ticket => (
                    <S.Tr key={ticket.issue_id}>
                      <S.Td style={{ fontWeight: 700, color: "#0d9488" }}>{ticket.issue_id}</S.Td>
                      <S.Td>
                        <span style={{
                          background: ticket.ticket_type === "Add ons" ? "#fff3e0" : ticket.ticket_type === "Changes" ? "#e8f5e9" : "#e1f5fe",
                          color: ticket.ticket_type === "Add ons" ? "#ef6c00" : ticket.ticket_type === "Changes" ? "#2e7d32" : "#0277bd",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          border: `1px solid ${ticket.ticket_type === "Add ons" ? "#ffe0b2" : ticket.ticket_type === "Changes" ? "#c8e6c9" : "#b3e5fc"}`
                        }}>{ticket.ticket_type || "Issue"}</span>
                      </S.Td>
                      <S.Td style={{ fontWeight: 600 }}>
                        <div>{ticket.title}</div>
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <div style={{ display: "flex", gap: "6px", marginTop: "6px", alignItems: "center" }} onClick={e => e.stopPropagation()}>
                            {ticket.attachments.map((file, idx) => {
                              const isImage = file.file_type?.startsWith("image/");
                              return (
                                <div 
                                  key={idx}
                                  onClick={() => setPreviewFile(file)}
                                  title={`Click to preview: ${file.name}`}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    border: "1px solid #cbd5e1",
                                    borderRadius: "4px",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "#f8fafc",
                                    fontSize: "0.6rem"
                                  }}
                                >
                                  {isImage ? (
                                    <img src={file.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    "📄"
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </S.Td>
                      <S.Td>
                        <StatusBadge $status={ticket.status}>{ticket.status}</StatusBadge>
                      </S.Td>
                      <S.Td>
                        {ticket.priority ? (
                          <span style={{ 
                            fontWeight: 600,
                            color: ticket.priority === "Critical" || ticket.priority === "High" ? "#ef4444" : "#475569",
                            fontSize: "0.8rem"
                          }}>
                            {ticket.priority}
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Not Set</span>
                        )}
                      </S.Td>
                      <S.Td>{dayjs(ticket.reported_date).format("DD/MM/YYYY hh:mm A")}</S.Td>
                      <S.Td style={{ textAlign: "center" }}>
                        <S.Button onClick={() => openTicketDetail(ticket)} style={{ padding: "4px 10px", fontSize: "0.75rem", margin: "0 auto" }}>
                           View Details
                        </S.Button>
                      </S.Td>
                    </S.Tr>
                  ))
                )}
              </tbody>
            </S.Table>
          </S.TableWrapper>
        </S.FormContent>

        {/* Details Preview Modal */}
        <Modal
          title={
            <div style={{ borderBottom: "1px solid #edf2f7", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0d9488" }}>{selectedTicket?.issue_id}</span>
              <span style={{
                background: selectedTicket?.ticket_type === "Add ons" ? "#fff3e0" : selectedTicket?.ticket_type === "Changes" ? "#e8f5e9" : "#e1f5fe",
                color: selectedTicket?.ticket_type === "Add ons" ? "#ef6c00" : selectedTicket?.ticket_type === "Changes" ? "#2e7d32" : "#0277bd",
                padding: "3px 8px",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                border: `1px solid ${selectedTicket?.ticket_type === "Add ons" ? "#ffe0b2" : selectedTicket?.ticket_type === "Changes" ? "#c8e6c9" : "#b3e5fc"}`
              }}>{selectedTicket?.ticket_type || "Issue"}</span>
              <StatusBadge $status={selectedTicket?.status}>{selectedTicket?.status}</StatusBadge>
            </div>
          }
          open={isDetailOpen}
          onCancel={() => setIsDetailOpen(false)}
          footer={[
            <S.Button key="close" onClick={() => setIsDetailOpen(false)} style={{ padding: "6px 16px" }}>
              Close Window
            </S.Button>
          ]}
          width={750}
          centered
        >
          {selectedTicket && (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "4px" }}>
                <DetailLabel>Issue Title</DetailLabel>
                <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1e293b", background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                  {selectedTicket.title}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <DetailLabel>Date Reported</DetailLabel>
                  <DetailValue>{dayjs(selectedTicket.reported_date).format("DD/MM/YYYY hh:mm A")}</DetailValue>
                </div>
                <div>
                  <DetailLabel>Department</DetailLabel>
                  <DetailValue>{selectedTicket.department || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not Set</span>}</DetailValue>
                </div>
                <div>
                  <DetailLabel>Assignee</DetailLabel>
                  <DetailValue>{selectedTicket.assignee || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not Assigned Yet</span>}</DetailValue>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <DetailLabel>Priority</DetailLabel>
                  <DetailValue>{selectedTicket.priority || <span style={{ color: "#94a3b8" }}>Not Set</span>}</DetailValue>
                </div>
                <div>
                  <DetailLabel>Severity</DetailLabel>
                  <DetailValue>{selectedTicket.severity || <span style={{ color: "#94a3b8" }}>Not Set</span>}</DetailValue>
                </div>
                <div>
                  <DetailLabel>Target Due Date</DetailLabel>
                  <DetailValue>
                    {selectedTicket.due_date 
                      ? dayjs(selectedTicket.due_date).format("DD/MM/YYYY") 
                      : <span style={{ color: "#94a3b8" }}>Not Set</span>}
                  </DetailValue>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <DetailLabel>Final Completion Date</DetailLabel>
                  <DetailValue>
                    {selectedTicket.final_completion_date 
                      ? dayjs(selectedTicket.final_completion_date).format("DD/MM/YYYY") 
                      : <span style={{ color: "#94a3b8" }}>-</span>}
                  </DetailValue>
                </div>
                <div>
                  <DetailLabel>Labels / Tags</DetailLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", padding: "8px", minHeight: "36px", background: "#f8fafc", borderRadius: "6px", border: "1px solid #edf2f7" }}>
                    {(!selectedTicket.labels_tags || selectedTicket.labels_tags.length === 0) && (
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>No tags</span>
                    )}
                    {selectedTicket.labels_tags?.map(t => (
                      <span key={t} style={{
                        background: "#e0f2f1",
                        color: "#0d9488",
                        padding: "2px 6px",
                        borderRadius: "12px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        border: "1px solid #b2dfdb"
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <DetailLabel>RCA (Root Cause Analysis)</DetailLabel>
                  <DetailValue>
                    {selectedTicket.rca || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>No RCA documented yet</span>}
                  </DetailValue>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <DetailLabel>Description</DetailLabel>
                  <DetailValue style={{ minHeight: "80px" }}>{selectedTicket.description || <span style={{ color: "#94a3b8" }}>No description provided</span>}</DetailValue>
                </div>
                <div>
                  <DetailLabel>Steps to Reproduce</DetailLabel>
                  <DetailValue style={{ minHeight: "80px" }}>{selectedTicket.steps_to_reproduce || <span style={{ color: "#94a3b8" }}>No steps provided</span>}</DetailValue>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <DetailLabel>Environment Details</DetailLabel>
                  <DetailValue style={{ minHeight: "80px" }}>{selectedTicket.environment || <span style={{ color: "#94a3b8" }}>No environment details provided</span>}</DetailValue>
                </div>
                <div>
                  <DetailLabel>Attachments ({selectedTicket.attachments?.length || 0})</DetailLabel>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "4px" }}>
                    {(!selectedTicket.attachments || selectedTicket.attachments.length === 0) && (
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem", fontStyle: "italic" }}>No attachments uploaded</span>
                    )}
                    {selectedTicket.attachments?.map((file, idx) => {
                      const isImage = file.file_type?.startsWith("image/");
                      return (
                        <div key={idx} style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          padding: "8px",
                          background: "#fff",
                          width: "120px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center"
                        }}>
                          {isImage ? (
                            <div style={{
                              width: "40px",
                              height: "40px",
                              backgroundImage: `url(${file.url})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              borderRadius: "4px"
                            }} />
                          ) : (
                            <span style={{ fontSize: "1.2rem" }}>📄</span>
                          )}
                          <span style={{
                            fontSize: "0.7rem",
                            color: "#64748b",
                            maxWidth: "100px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textAlign: "center",
                            marginTop: "4px"
                          }}>{file.name}</span>
                           <div style={{ display: "flex", gap: "6px", width: "100%", marginTop: "8px", justifyContent: "center" }}>
                            <span 
                              onClick={() => setPreviewFile(file)}
                              style={{ 
                                fontSize: "0.68rem", 
                                color: "#0d9488", 
                                cursor: "pointer", 
                                fontWeight: 600,
                                background: "#e0f2f1",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                border: "1px solid #b2dfdb"
                              }}
                            >
                              Preview
                            </span>
                            <DownloadLink 
                              href={file.url} 
                              download={file.name} 
                              style={{ 
                                margin: 0, 
                                padding: "2px 6px",
                                background: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #cbd5e1",
                                borderRadius: "4px",
                                fontSize: "0.68rem",
                                display: "inline-flex",
                                alignItems: "center"
                              }}
                            >
                              Download
                            </DownloadLink>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* File Preview Modal */}
        <Modal
          open={!!previewFile}
          title={previewFile?.name}
          zIndex={2000}
          footer={[
            <S.Button key="close" onClick={() => setPreviewFile(null)}>
              Close
            </S.Button>,
            <a key="download" href={previewFile?.url} download={previewFile?.name} style={{ textDecoration: "none", marginLeft: "8px" }}>
              <S.Button style={{ background: S.colors.primary, borderColor: S.colors.primary, color: "white" }}>
                Download File
              </S.Button>
            </a>
          ]}
          onCancel={() => setPreviewFile(null)}
          width={800}
          centered
        >
          {previewFile && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px", padding: "10px", background: "#f8fafc", borderRadius: "8px" }}>
              {previewFile.file_type?.startsWith("image/") ? (
                <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "4px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              ) : previewFile.file_type === "application/pdf" ? (
                <iframe src={getPdfUrl(previewFile.url)} title={previewFile.name} style={{ width: "100%", height: "60vh", border: "none" }} />
              ) : (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <span style={{ fontSize: "4rem" }}>📄</span>
                  <p style={{ marginTop: "12px", color: "#64748b", fontWeight: 600 }}>{previewFile.name}</p>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Preview is not supported for this file type.</p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </S.PageWrapper>
    </ConfigProvider>
  );
};

export default Complaints;
