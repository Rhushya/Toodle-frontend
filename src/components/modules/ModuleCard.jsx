import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useState, useRef, useEffect, forwardRef } from 'react';

import AddIcon from '../../assets/AddOutlined.svg';
import CaretDownIcon from '../../assets/CaretDownFilled.svg';
import CaretUpIcon from '../../assets/CaretUpFilled.svg';
import DeleteIcon from '../../assets/DeleteOutlined.svg';
import DotsIcon from '../../assets/DotsVerticalOutlined.svg';
import DragIcon from '../../assets/DragHandleOutlined.svg';
import LinkIcon from '../../assets/LinkOutlined.svg';
import EditIcon from '../../assets/PencilLineOutlined.svg';
import UploadIcon from '../../assets/UploadOutlined.svg';

import SortableModuleItem from './SortableModuleItem';

const ModuleCard = forwardRef(
  (
    {
      module,
      onEdit,
      onDelete,
      items = [],
      onAddItem,
      onDeleteItem,
      onEditItem,
      dragHandleProps = {},
      isExpanded: controlledExpanded,
      onToggleExpand,
    },
    ref
  ) => {
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);
    // Use controlled or uncontrolled expand state
    const [internalExpanded, setInternalExpanded] = useState(true);
    const isExpanded =
      controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const optionsRef = useRef(null);
    const addMenuRef = useRef(null);

    const moduleItems = items.filter(item => item.moduleId === module.id);

    // Make the module a droppable target for items
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
      id: `module-${module.id}`,
    });

    // Close dropdowns when clicking outside
    useEffect(() => {
      const handleClickOutside = event => {
        if (optionsRef.current && !optionsRef.current.contains(event.target)) {
          setIsOptionsOpen(false);
        }
        if (addMenuRef.current && !addMenuRef.current.contains(event.target)) {
          setIsAddMenuOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const toggleOptions = e => {
      e.stopPropagation();
      setIsOptionsOpen(!isOptionsOpen);
    };

    const toggleExpanded = () => {
      if (onToggleExpand) {
        onToggleExpand(!isExpanded);
      } else {
        setInternalExpanded(!internalExpanded);
      }
    };

    const handleEdit = e => {
      e.stopPropagation();
      onEdit(module);
      setIsOptionsOpen(false);
    };

    const handleDelete = e => {
      e.stopPropagation();
      onDelete(module.id);
      setIsOptionsOpen(false);
    };

    const toggleAddMenu = e => {
      e.stopPropagation();
      setIsAddMenuOpen(!isAddMenuOpen);
    };

    const handleAddClick = type => {
      onAddItem(module.id, type);
      setIsAddMenuOpen(false);
    };

    return (
      <div className="module-card-container" ref={ref}>
        <div className="module-card">
          <div className="module-left">
            <div className="drag-handle" {...dragHandleProps}>
              <img src={DragIcon} alt="Drag" />
            </div>
            <div className="module-content" onClick={toggleExpanded}>
              <div className="module-icon">
                <img
                  src={isExpanded ? CaretDownIcon : CaretUpIcon}
                  alt={isExpanded ? 'Collapse' : 'Expand'}
                  className={`caret-icon ${isExpanded ? 'expanded' : ''}`}
                />
              </div>
              <div className="module-info">
                <h3 className="module-title">{module.name}</h3>
                <p className="module-subtitle">
                  {moduleItems.length === 0
                    ? 'Add items to this module'
                    : `${moduleItems.length} item${moduleItems.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>
          <div className="module-actions" ref={optionsRef}>
            <button
              className="btn-options"
              onClick={toggleOptions}
              aria-label="Module options"
            >
              <img src={DotsIcon} alt="Options" />
            </button>
            {isOptionsOpen && (
              <div className="options-menu">
                <button className="option-item" onClick={handleEdit}>
                  <img src={EditIcon} alt="" className="option-icon" />
                  Edit module name
                </button>
                <button className="option-item delete" onClick={handleDelete}>
                  <img src={DeleteIcon} alt="" className="option-icon" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {isExpanded && (
          <div
            ref={setDroppableRef}
            className={`module-content-expanded ${isOver ? 'drop-target-active' : ''}`}
          >
            {moduleItems.length > 0 && (
              <SortableContext
                items={moduleItems.map(item => `item-${item.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="module-items-list">
                  {moduleItems.map(item => (
                    <SortableModuleItem
                      key={item.id}
                      id={`item-${item.id}`}
                      item={item}
                      onDelete={onDeleteItem}
                      onEdit={onEditItem}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
            <div className="add-item-container" ref={addMenuRef}>
              <button
                className={`add-item-button ${isAddMenuOpen ? 'active' : ''}`}
                onClick={toggleAddMenu}
              >
                <img src={AddIcon} alt="" className="add-icon" />
                <span>Add item</span>
                <span className="add-item-plus">+</span>
              </button>
              {isAddMenuOpen && (
                <>
                  <div className="add-item-backdrop" onClick={toggleAddMenu} />
                  <div className="add-item-popup">
                    <div className="add-item-popup-header">
                      <h4>Add to module</h4>
                    </div>
                    <div className="add-item-popup-content">
                      <button
                        className="add-item-option"
                        onClick={() => handleAddClick('link')}
                      >
                        <div className="option-icon-wrapper link">
                          <img src={LinkIcon} alt="" className="item-icon" />
                        </div>
                        <div className="option-text">
                          <span className="option-title">Add a link</span>
                          <span className="option-desc">
                            Add a web link or URL
                          </span>
                        </div>
                      </button>
                      <button
                        className="add-item-option"
                        onClick={() => handleAddClick('file')}
                      >
                        <div className="option-icon-wrapper file">
                          <img src={UploadIcon} alt="" className="item-icon" />
                        </div>
                        <div className="option-text">
                          <span className="option-title">Upload file</span>
                          <span className="option-desc">
                            Upload PDF, images, or documents
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ModuleCard.displayName = 'ModuleCard';

export default ModuleCard;
