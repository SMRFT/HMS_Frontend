import React, { useState, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave, FiPlus, FiTrash2, FiMove, FiSettings, FiAlertTriangle } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchSidebarMapping, updateSidebarMapping } from '../../Auth/apiRequest';
import { PAGE_PERMISSIONS } from '../../Auth/FrontendPageMapping';

// ─── Global Style ──────────────────────────────────────────────
const GlobalStyle = createGlobalStyle`
  :root {
    --primary:       #0d9488;
    --primary-light: #14b8a6;
    --primary-dark:  #0f766e;
    --accent:        #6366f1;
    --danger:        #ef4444;
    --danger-soft:   #fee2e2;
    --warning:       #f59e0b;
    --bg:            #f0fdfa;
    --surface:       #ffffff;
    --border:        #e2e8f0;
    --text:          #0f172a;
    --muted:         #64748b;
    --radius-lg:     12px;
    --radius-md:     8px;
    --radius-sm:     6px;
    --shadow-sm:     0 1px 4px rgba(0,0,0,0.06);
    --shadow-md:     0 4px 16px rgba(13,148,136,0.12);
    --shadow-drag:   0 10px 36px rgba(13,148,136,0.22);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg); }
`;

// ─── Animations ────────────────────────────────────────────────
const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;
const shimmer = keyframes`0%,100% { opacity: 0.5; } 50% { opacity: 1; }`;

// ─── Layout ────────────────────────────────────────────────────
const PageContainer = styled.div`
  padding: 28px 32px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdfa 0%, #eff6ff 100%);
  animation: ${fadeIn} 0.4s ease;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
  position: sticky;
  top: 62px;
  background: rgba(240, 253, 250, 0.9);
  backdrop-filter: blur(8px);
  padding: 16px 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(13, 148, 136, 0.1);
`;

const TitleBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const TitleIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.3px;
`;

const Subtitle = styled.p`
  font-size: 0.85rem;
  color: var(--muted);
  margin-top: 3px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
`;

// ─── Buttons ───────────────────────────────────────────────────
const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(13,148,136,0.3);
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    box-shadow: 0 4px 14px rgba(13,148,136,0.4);
    transform: translateY(-1px);
  }

  @media (max-width: 480px) { padding: 9px 13px; font-size: 0.82rem; }
`;

const OutlineButton = styled(PrimaryButton)`
  background: var(--surface);
  color: var(--primary);
  border: 1.5px solid var(--primary);
  box-shadow: none;

  &:hover {
    background: #f0fdfa;
    box-shadow: 0 2px 10px rgba(13,148,136,0.15);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${p => p.danger ? 'var(--danger)' : 'var(--muted)'};
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  transition: all 0.15s;

  &:hover {
    background: ${p => p.danger ? 'var(--danger-soft)' : '#f1f5f9'};
    color: ${p => p.danger ? 'var(--danger)' : 'var(--text)'};
  }

  &:disabled { opacity: 0.3; cursor: not-allowed; }
`;

// ─── Group Card ────────────────────────────────────────────────
const GroupCard = styled.div`
  background: var(--surface);
  border: 1.5px solid ${p => p.dragging ? 'var(--primary)' : 'var(--border)'};
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 18px;
  box-shadow: ${p => p.dragging ? 'var(--shadow-drag)' : 'var(--shadow-sm)'};
  transition: box-shadow 0.2s, border-color 0.2s;
  animation: ${fadeIn} 0.3s ease;

  &:hover { border-color: #99f6e4; }
`;

const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1.5px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
  position: sticky;
  top: 142px; /* 62px (Main) + ~80px (SidebarEditor Header) */
  background: var(--surface);
  z-index: 10;
`;

const GroupLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DragHandle = styled.div`
  color: var(--muted);
  cursor: grab;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;

  &:hover { background: #f1f5f9; color: var(--primary); }
  &:active { cursor: grabbing; }
`;

const GroupBadge = styled.span`
  background: linear-gradient(135deg, #f0fdfa, #eff6ff);
  color: var(--primary);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #99f6e4;
  white-space: nowrap;
`;

// ─── Input ─────────────────────────────────────────────────────
const Input = styled.input`
  padding: 8px 11px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  color: var(--text);
  background: #fafafa;
  width: 100%;
  transition: all 0.15s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(13,148,136,0.12);
  }

  &::placeholder { color: #a8b5c8; }
`;

// ─── Table ─────────────────────────────────────────────────────
const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 620px;

  th {
    padding: 10px 12px;
    text-align: left;
    background: linear-gradient(90deg, #f8fafc, #f0fdfa);
    font-weight: 700;
    color: var(--muted);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1.5px solid var(--border);
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }

  tbody tr:last-child td { border-bottom: none; }

  tbody tr:hover td { background: #f8fffd; }
`;

const DraggingRow = styled.tr`
  background: #f0fdfa !important;
  box-shadow: var(--shadow-md);
  display: ${p => p.dragging ? 'table' : 'table-row'};
`;

// ─── Warning Card ──────────────────────────────────────────────
const WarningCard = styled.div`
  background: linear-gradient(135deg, #fff7ed, #fff5f5);
  border: 1.5px solid #fca5a5;
  border-left: 5px solid var(--danger);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 20px;
  animation: ${fadeIn} 0.3s ease;
`;

const WarningTitle = styled.h3`
  color: var(--danger);
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const RouteTag = styled.span`
  background: #fee2e2;
  color: #991b1b;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.82rem;
  border: 1px solid #f87171;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const RoutePerm = styled.span`
  background: #fca5a5;
  color: #7f1d1d;
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.75rem;
`;

// ─── Loading ───────────────────────────────────────────────────
const LoadingDot = styled.div`
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--primary);
  animation: ${shimmer} 1s ease infinite;
  animation-delay: ${p => p.delay || '0s'};
`;

const LoadingScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
`;

const EmptyRow = styled.tr`
  td {
    text-align: center;
    color: var(--muted);
    padding: 24px !important;
    font-size: 0.88rem;
    font-style: italic;
  }
`;

// ─── Tag Input Components ──────────────────────────────────────
const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 6px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: #fafafa;
  min-height: 38px;
  cursor: text;

  &:focus-within {
    border-color: var(--primary);
    background: white;
    box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.12);
  }
`;

const Tag = styled.span`
  background: var(--primary-soft, #ccfbf1);
  color: var(--primary-dark);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TagClose = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  &:hover { color: var(--danger); }
`;

const GhostInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.82rem;
  color: var(--text);
  flex: 1;
  min-width: 60px;
  &::placeholder { color: #a8b5c8; }
`;

const PermissionsCell = styled.div`
  position: relative;
`;

const PermissionTagInput = ({ value, onChange }) => {
    const [inputValue, setInputValue] = useState('');
    const containerRef = React.useRef(null);

    const tags = Array.isArray(value) ? value : [];

    const addTag = (tag) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setInputValue('');
    };

    const removeTag = (index) => {
        const newTags = [...tags];
        newTags.splice(index, 1);
        onChange(newTags);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <PermissionsCell ref={containerRef}>
            <TagContainer onClick={() => containerRef.current?.querySelector('input').focus()}>
                {tags.map((tag, i) => (
                    <Tag key={i}>
                        {tag}
                        <TagClose onClick={(e) => { e.stopPropagation(); removeTag(i); }}>×</TagClose>
                    </Tag>
                ))}
                <GhostInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? "Add permissions…" : ""}
                />
            </TagContainer>
        </PermissionsCell>
    );
};

// ─── Component ─────────────────────────────────────────────────
const SidebarEditor = () => {
    const [mapping, setMapping] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadMapping(); }, []);

    const loadMapping = async () => {
        setLoading(true);
        try {
            const data = await fetchSidebarMapping();
            
            let maxGroupId = 0;
            let maxPageId = 0;

            // Find existing maximums safely parsing to int
            data.forEach(g => {
                const gId = parseInt(g.group_id, 10);
                if (!isNaN(gId) && gId > maxGroupId) maxGroupId = gId;
                
                (g.pages || []).forEach(p => {
                    const pId = parseInt(p.page_id, 10);
                    if (!isNaN(pId) && pId > maxPageId) maxPageId = pId;
                });
            });

            const withIds = data.map((g) => {
                let group_id = parseInt(g.group_id, 10);
                if (isNaN(group_id)) {
                    maxGroupId += 1;
                    group_id = maxGroupId;
                }
                
                return {
                    ...g,
                    id: `grp_${group_id}`, // required for DND
                    group_id: group_id,
                    pages: (g.pages || []).map((p) => {
                        let page_id = parseInt(p.page_id, 10);
                        if (isNaN(page_id)) {
                            maxPageId += 1;
                            page_id = maxPageId;
                        }
                        return {
                            ...p,
                            id: `pg_${page_id}`, // required for DND
                            page_id: page_id
                        };
                    })
                };
            });
            setMapping(withIds);
        } catch {
            toast.error("Failed to load sidebar configuration.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const orderedMapping = mapping.map((group, index) => {
                const { id, ...groupData } = group; // remove DND id before saving
                return {
                    ...groupData,
                    order: index + 1,
                    pages: (groupData.pages || []).map(p => {
                        const { id, ...pageData } = p; // remove DND id
                        return pageData;
                    })
                };
            });
            await updateSidebarMapping(orderedMapping);
            toast.success("Sidebar configuration saved successfully!");
            loadMapping();
        } catch {
            toast.error("Failed to save sidebar configuration.");
        }
    };

    const handleGroupChange = (gi, field, value) => {
        const m = [...mapping];
        m[gi][field] = value;
        setMapping(m);
    };

    const handlePageChange = (gi, pi, field, value) => {
        const m = [...mapping];
        if (field === 'permissions') {
            // value is already an array if coming from PermissionTagInput
            m[gi].pages[pi][field] = Array.isArray(value) ? value : value.split(',').map(s => s.trim()).filter(Boolean);
        } else {
            m[gi].pages[pi][field] = value;
        }
        setMapping(m);
    };

    const getNextGroupId = () => {
        let maxId = 0;
        mapping.forEach(g => {
            const id = parseInt(g.group_id, 10);
            if (!isNaN(id) && id > maxId) maxId = id;
        });
        return maxId + 1;
    };

    const getNextPageId = () => {
        let maxId = 0;
        mapping.forEach(g => {
            (g.pages || []).forEach(p => {
                const id = parseInt(p.page_id, 10);
                if (!isNaN(id) && id > maxId) maxId = id;
            });
        });
        return maxId + 1;
    };

    const addGroup = () => {
        const group_id = getNextGroupId();
        setMapping([...mapping, {
            id: `grp_${group_id}`,
            group_id: group_id,
            group: 'New Group',
            order: mapping.length + 1,
            pages: []
        }]);
    };

    const deleteGroup = (gi) => setMapping(mapping.filter((_, i) => i !== gi));

    const addPage = (gi) => {
        const m = [...mapping];
        const page_id = getNextPageId();
        m[gi].pages.push({
            id: `pg_${page_id}`,
            page_id: page_id,
            name: 'New Page',
            route: '/NewRoute',
            icon: 'FiActivity',
            permissions: []
        });
        setMapping(m);
    };

    const deletePage = (gi, pi) => {
        const m = [...mapping];
        m[gi].pages = m[gi].pages.filter((_, i) => i !== pi);
        setMapping(m);
    };

    const onDragEnd = ({ source, destination, type }) => {
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const m = Array.from(mapping);
        if (type === 'GROUP') {
            const [g] = m.splice(source.index, 1);
            m.splice(destination.index, 0, g);
            setMapping(m);
        } else {
            const si = m.findIndex(g => g.id === source.droppableId);
            const di = m.findIndex(g => g.id === destination.droppableId);
            if (si === -1 || di === -1) return;

            const sp = Array.from(m[si].pages);
            const dp = si === di ? sp : Array.from(m[di].pages);
            const [page] = sp.splice(source.index, 1);
            dp.splice(destination.index, 0, page);
            m[si].pages = sp;
            if (si !== di) m[di].pages = dp;
            setMapping(m);
        }
    };

    const getUnmappedRoutes = () => {
        const exclude = ['/', '/HMSUsers'];
        const all = Object.keys(PAGE_PERMISSIONS).filter(r => !exclude.includes(r));
        const mapped = new Set(mapping.flatMap(g => (g.pages || []).map(p => p.route)));
        return all.filter(r => !mapped.has(r));
    };

    if (loading) return (
        <>
            <GlobalStyle />
            <PageContainer>
                <LoadingScreen>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['0s', '0.2s', '0.4s'].map((d, i) => <LoadingDot key={i} delay={d} />)}
                    </div>
                    <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Loading sidebar configuration…</span>
                </LoadingScreen>
            </PageContainer>
        </>
    );

    const unmapped = getUnmappedRoutes();

    return (
        <>
            <GlobalStyle />
            <PageContainer>
                <ToastContainer position="top-right" autoClose={3000} />

                {/* ── Header ── */}
                <HeaderContainer>
                    <TitleBlock>
                        <TitleIcon><FiSettings /></TitleIcon>
                        <div>
                            <Title>Sidebar Configuration</Title>
                            <Subtitle>
                                Modify structure, names, icons, routes & permissions.
                                Drag <FiMove style={{ verticalAlign: 'middle' }} /> handles to reorder.
                            </Subtitle>
                        </div>
                    </TitleBlock>

                    <ButtonGroup>
                        <OutlineButton onClick={addGroup}>
                            <FiPlus /> Add Group
                        </OutlineButton>
                        <PrimaryButton onClick={handleSave}>
                            <FiSave /> Save Changes
                        </PrimaryButton>
                    </ButtonGroup>
                </HeaderContainer>



                {/* ── Drag & Drop Groups ── */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="groups" type="GROUP">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {mapping.map((group, gi) => (
                                    <Draggable key={group.id} draggableId={group.id} index={gi}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    ...(snapshot.isDragging ? { zIndex: 999 } : {})
                                                }}
                                            >
                                                <GroupCard dragging={snapshot.isDragging}>
                                                    <GroupHeader>
                                                        <GroupLeft>
                                                            <DragHandle {...provided.dragHandleProps}>
                                                                <FiMove size={17} />
                                                            </DragHandle>
                                                            <Input
                                                                value={group.group || ''}
                                                                onChange={e => handleGroupChange(gi, 'group', e.target.value)}
                                                                placeholder="Group Name"
                                                                style={{ width: '220px', fontWeight: '700', fontSize: '0.95rem' }}
                                                            />
                                                            <GroupBadge>Group ID: {group.group_id}</GroupBadge>
                                                            <GroupBadge>{group.pages?.length || 0} page{group.pages?.length !== 1 ? 's' : ''}</GroupBadge>
                                                        </GroupLeft>

                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <PrimaryButton onClick={() => addPage(gi)} style={{ padding: '8px 14px', fontSize: '0.83rem' }}>
                                                                <FiPlus /> Add Page
                                                            </PrimaryButton>
                                                            <IconButton danger onClick={() => deleteGroup(gi)}>
                                                                <FiTrash2 size={17} />
                                                            </IconButton>
                                                        </div>
                                                    </GroupHeader>

                                                    <TableWrapper>
                                                        <Table>
                                                            <thead>
                                                                <tr>
                                                                    <th style={{ width: '4%' }}></th>
                                                                    <th style={{ width: '6%' }}>ID</th>
                                                                    <th style={{ width: '16%' }}>Page Name</th>
                                                                    <th style={{ width: '16%' }}>Route</th>
                                                                    <th style={{ width: '12%' }}>Icon</th>
                                                                    <th style={{ width: '42%' }}>Permissions</th>
                                                                    <th style={{ width: '4%' }}></th>
                                                                </tr>
                                                            </thead>
                                                            <Droppable droppableId={group.id} type="PAGE">
                                                                {(provided) => (
                                                                    <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                                                        {group.pages.map((page, pi) => (
                                                                            <Draggable key={page.id} draggableId={page.id} index={pi}>
                                                                                {(provided, snapshot) => (
                                                                                    <DraggingRow
                                                                                        ref={provided.innerRef}
                                                                                        {...provided.draggableProps}
                                                                                        dragging={snapshot.isDragging}
                                                                                        style={{ ...provided.draggableProps.style }}
                                                                                    >
                                                                                        <td>
                                                                                            <DragHandle {...provided.dragHandleProps}>
                                                                                                <FiMove size={14} />
                                                                                            </DragHandle>
                                                                                        </td>
                                                                                        <td>
                                                                                            <GroupBadge style={{ fontSize: '0.7rem' }}>PG-{page.page_id}</GroupBadge>
                                                                                        </td>
                                                                                        <td>
                                                                                            <Input
                                                                                                value={page.name}
                                                                                                onChange={e => handlePageChange(gi, pi, 'name', e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <Input
                                                                                                value={page.route}
                                                                                                onChange={e => handlePageChange(gi, pi, 'route', e.target.value)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <Input
                                                                                                value={page.icon}
                                                                                                onChange={e => handlePageChange(gi, pi, 'icon', e.target.value)}
                                                                                                placeholder="e.g. FiHome"
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <PermissionTagInput
                                                                                                value={page.permissions || []}
                                                                                                onChange={val => handlePageChange(gi, pi, 'permissions', val)}
                                                                                            />
                                                                                        </td>
                                                                                        <td>
                                                                                            <IconButton danger onClick={() => deletePage(gi, pi)}>
                                                                                                <FiTrash2 size={15} />
                                                                                            </IconButton>
                                                                                        </td>
                                                                                    </DraggingRow>
                                                                                )}
                                                                            </Draggable>
                                                                        ))}
                                                                        {provided.placeholder}
                                                                        {(!group.pages || group.pages.length === 0) && (
                                                                            <EmptyRow>
                                                                                <td colSpan="6">No pages yet — click "Add Page" to get started.</td>
                                                                            </EmptyRow>
                                                                        )}
                                                                    </tbody>
                                                                )}
                                                            </Droppable>
                                                        </Table>
                                                    </TableWrapper>
                                                </GroupCard>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </PageContainer>
        </>
    );
};

export default SidebarEditor;
