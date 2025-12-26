import { useState, useEffect } from 'react';

import CloseIcon from '../../assets/CloseOutlined.svg';

const UploadModal = ({ isOpen, onClose, onSave, moduleId, file = null }) => {
  const [fileTitle, setFileTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const isEditMode = !!file;

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFileTitle(file ? file.title : '');
      setSelectedFile(null);
    }
  }, [isOpen, file]);

  const handleFileChange = e => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setSelectedFile(uploadedFile);
      // Auto-fill title from filename if empty
      if (!fileTitle) {
        setFileTitle(uploadedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (isEditMode) {
      // Just rename the file
      onSave({
        ...file,
        title: fileTitle.trim(),
      });
    } else {
      if (!selectedFile) return;
      // Create file URL for preview/download
      const fileUrl = URL.createObjectURL(selectedFile);

      onSave({
        id: Date.now().toString(),
        moduleId,
        type: 'file',
        title: fileTitle.trim(),
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        fileUrl: fileUrl,
      });
    }
    setFileTitle('');
    setSelectedFile(null);
  };

  const isSubmitDisabled = isEditMode
    ? !fileTitle.trim()
    : !fileTitle.trim() || !selectedFile;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Rename file' : 'Upload file'}</h2>
          <button className="modal-close" onClick={onClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {!isEditMode && (
              <div className="form-group">
                <label htmlFor="file-upload">Select file</label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
                />
                {selectedFile && (
                  <div className="selected-file">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">
                      ({Math.round(selectedFile.size / 1024)} KB)
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="file-title">Display name</label>
              <input
                id="file-title"
                type="text"
                value={fileTitle}
                onChange={e => setFileTitle(e.target.value)}
                placeholder="File title"
                className="form-input"
                autoFocus={isEditMode}
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
              disabled={isSubmitDisabled}
            >
              {isEditMode ? 'Save' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
