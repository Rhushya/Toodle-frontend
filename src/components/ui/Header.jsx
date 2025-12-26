import { useEffect, useRef, useState } from 'react';

import AddIcon from '../../assets/AddOutlined.svg';
import CaretDownIcon from '../../assets/CaretDownFilled.svg';
import LinkIcon from '../../assets/LinkOutlined.svg';
import SearchIcon from '../../assets/SearchOutlined.svg';
import SinglePointIcon from '../../assets/SinglePointRubric.svg';
import UploadIcon from '../../assets/UploadOutlined.svg';

const Header = ({
  onAddClick,
  searchQuery,
  onSearchChange,
  onExpandAll,
  onCollapseAll,
  onExport,
  onImport,
  onClearAll,
  moduleCount = 0,
  itemCount = 0,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const actionsRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleActionsClick = () => {
    setIsActionsOpen(!isActionsOpen);
  };

  const handleCreateModule = () => {
    onAddClick('module');
    setIsDropdownOpen(false);
  };

  const handleAddLink = () => {
    onAddClick('link');
    setIsDropdownOpen(false);
  };

  const handleUpload = () => {
    onAddClick('upload');
    setIsDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Course builder</h1>
        {(moduleCount > 0 || itemCount > 0) && (
          <div className="header-stats">
            <span className="stat-badge modules">{moduleCount} modules</span>
            <span className="stat-badge items">{itemCount} resources</span>
          </div>
        )}
      </div>
      <div className="header-right">
        <div className="search-container">
          <img src={SearchIcon} alt="Search" className="search-icon" />
          <input
            type="text"
            placeholder="Search modules & resources..."
            className="search-input"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearchChange('')}>
              ×
            </button>
          )}
        </div>

        {/* Actions dropdown */}
        <div className="dropdown-container actions-dropdown" ref={actionsRef}>
          <button
            className="actions-button"
            onClick={handleActionsClick}
            title="More actions"
          >
            <span className="dots-icon">⋮</span>
          </button>
          {isActionsOpen && (
            <div className="dropdown-menu actions-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  onExpandAll?.();
                  setIsActionsOpen(false);
                }}
              >
                <span className="item-emoji">📂</span>
                Expand all
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onCollapseAll?.();
                  setIsActionsOpen(false);
                }}
              >
                <span className="item-emoji">📁</span>
                Collapse all
              </button>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item"
                onClick={() => {
                  onExport?.();
                  setIsActionsOpen(false);
                }}
              >
                <span className="item-emoji">📤</span>
                Export course
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  onImport?.();
                  setIsActionsOpen(false);
                }}
              >
                <span className="item-emoji">📥</span>
                Import course
              </button>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item danger"
                onClick={() => {
                  onClearAll?.();
                  setIsActionsOpen(false);
                }}
              >
                <span className="item-emoji">🗑️</span>
                Clear all data
              </button>
            </div>
          )}
        </div>

        {/* Add dropdown */}
        <div className="dropdown-container" ref={dropdownRef}>
          <button className="add-button" onClick={handleAddClick}>
            <img src={AddIcon} alt="" className="add-icon" />
            Add
            <img
              src={CaretDownIcon}
              alt=""
              className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            />
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={handleCreateModule}>
                <img src={SinglePointIcon} alt="" className="item-icon" />
                Create module
              </button>
              <button className="dropdown-item" onClick={handleAddLink}>
                <img src={LinkIcon} alt="" className="item-icon" />
                Add a link
              </button>
              <button className="dropdown-item" onClick={handleUpload}>
                <img src={UploadIcon} alt="" className="item-icon" />
                Upload
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
