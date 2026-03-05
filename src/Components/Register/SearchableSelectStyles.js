
const SearchableSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`

const DropdownList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
`

const DropdownItem = styled.li`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #1e293b;
  transition: background 0.2s;
  border-bottom: 1px solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
    color: #0d9488;
  }
`
