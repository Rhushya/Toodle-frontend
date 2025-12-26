import { useState, useEffect } from 'react';

import CloseIcon from '../../assets/CloseOutlined.svg';

const LinkModal = ({ isOpen, onClose, onSave, moduleId, link = null }) => {
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const isEditMode = !!link;

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLinkTitle(link ? link.title : '');
      setLinkUrl(link ? link.url : '');
      setUrlError('');
    }
  }, [isOpen, link]);

  const validateUrl = url => {
    if (!url.trim()) return false;
    try {
      // Allow URLs with or without protocol
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = e => {
    const url = e.target.value;
    setLinkUrl(url);
    if (url && !validateUrl(url)) {
      setUrlError('Please enter a valid URL');
    } else {
      setUrlError('');
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    const finalUrl = linkUrl.startsWith('http')
      ? linkUrl.trim()
      : `https://${linkUrl.trim()}`;

    onSave({
      id: link ? link.id : Date.now().toString(),
      moduleId: link ? link.moduleId : moduleId,
      type: 'link',
      title: linkTitle.trim(),
      url: finalUrl,
    });
    setLinkTitle('');
    setLinkUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit link' : 'Add a link'}</h2>
          <button className="modal-close" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="link-url">URL</label>
              <input
                id="link-url"
                type="text"
                value={linkUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com"
                className={`form-input ${urlError ? 'input-error' : ''}`}
                autoFocus
              />
              {urlError && <span className="error-message">{urlError}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="link-title">Display name</label>
              <input
                id="link-title"
                type="text"
                value={linkTitle}
                onChange={e => setLinkTitle(e.target.value)}
                placeholder="Link title"
                className="form-input"
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
              disabled={!linkTitle.trim() || !linkUrl.trim() || !!urlError}
            >
              {isEditMode ? 'Save changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkModal;
