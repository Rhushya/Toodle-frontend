import { useState, useEffect } from 'react';

import CloseIcon from '../../assets/CloseOutlined.svg';

const ModuleModal = ({ isOpen, onClose, onSave, module = null }) => {
  const [moduleName, setModuleName] = useState('');

  // Sync state with module prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setModuleName(module ? module.name : '');
    }
  }, [isOpen, module]);

  const handleSubmit = e => {
    e.preventDefault();
    if (!moduleName.trim()) return;

    onSave({
      id: module ? module.id : Date.now().toString(),
      name: moduleName.trim(),
    });
    setModuleName('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{module ? 'Edit module' : 'Create new module'}</h2>
          <button className="modal-close" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="module-name">Module name</label>
              <input
                id="module-name"
                type="text"
                value={moduleName}
                onChange={e => setModuleName(e.target.value)}
                placeholder="Introduction to Trigonometry"
                className="form-input"
                autoFocus
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-create"
              disabled={!moduleName.trim()}
            >
              {module ? 'Save changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModuleModal;
