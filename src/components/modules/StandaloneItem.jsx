import { useState, useRef, useEffect } from 'react';

import DeleteIcon from '../../assets/DeleteOutlined.svg';
import DotsIcon from '../../assets/DotsVerticalOutlined.svg';
import DragIcon from '../../assets/DragHandleOutlined.svg';
import LinkIcon from '../../assets/LinkColored.svg';
import PDFIcon from '../../assets/PDFColored.svg';
import EditIcon from '../../assets/PencilLineOutlined.svg';

const StandaloneItem = ({ item, onDelete, onEdit, dragHandleProps = {} }) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setIsOptionsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDelete = e => {
    e.stopPropagation();
    onDelete(item.id);
    setIsOptionsOpen(false);
  };

  const handleEdit = e => {
    e.stopPropagation();
    onEdit(item);
    setIsOptionsOpen(false);
  };

  const toggleOptions = e => {
    e.stopPropagation();
    setIsOptionsOpen(!isOptionsOpen);
  };

  const getFileIcon = () => {
    if (item.fileType?.includes('pdf')) {
      return PDFIcon;
    }
    return PDFIcon;
  };

  if (item.type === 'link') {
    return (
      <div className="standalone-item link-item">
        <div className="item-left">
          <div className="drag-handle" {...dragHandleProps}>
            <img src={DragIcon} alt="Drag" />
          </div>
          <div className="item-content">
            <div className="item-icon">
              <img src={LinkIcon} alt="Link" />
            </div>
            <div className="item-info">
              <h4 className="item-title">{item.title}</h4>
              <a
                href={item.url}
                className="item-url"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {item.url}
              </a>
            </div>
          </div>
        </div>
        <div className="item-actions" ref={optionsRef}>
          <button className="btn-options" onClick={toggleOptions}>
            <img src={DotsIcon} alt="Options" />
          </button>
          {isOptionsOpen && (
            <div className="options-menu item-options-menu">
              <button className="option-item" onClick={handleEdit}>
                <img src={EditIcon} alt="" className="option-icon" />
                Edit
              </button>
              <button className="option-item delete" onClick={handleDelete}>
                <img src={DeleteIcon} alt="" className="option-icon" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (item.type === 'file') {
    return (
      <div className="standalone-item file-item">
        <div className="item-left">
          <div className="drag-handle" {...dragHandleProps}>
            <img src={DragIcon} alt="Drag" />
          </div>
          <div className="item-content">
            <div className="item-icon">
              <img src={getFileIcon()} alt="File" />
            </div>
            <div className="item-info">
              <h4 className="item-title">{item.title}</h4>
              <p className="item-details">
                {item.fileName} ({Math.round(item.fileSize / 1024)} KB)
              </p>
            </div>
          </div>
        </div>
        <div className="item-actions" ref={optionsRef}>
          <button className="btn-options" onClick={toggleOptions}>
            <img src={DotsIcon} alt="Options" />
          </button>
          {isOptionsOpen && (
            <div className="options-menu item-options-menu">
              <button className="option-item" onClick={handleEdit}>
                <img src={EditIcon} alt="" className="option-icon" />
                Rename
              </button>
              <button className="option-item delete" onClick={handleDelete}>
                <img src={DeleteIcon} alt="" className="option-icon" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default StandaloneItem;
