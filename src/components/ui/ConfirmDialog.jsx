import { useState } from 'react';

import CloseIcon from '../../assets/CloseOutlined.svg';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  const [isClosing, setIsClosing] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <div
      className={`confirm-overlay ${isClosing ? 'closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`confirm-dialog ${isClosing ? 'closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="confirm-header">
          <h3>{title}</h3>
          <button className="confirm-close" onClick={handleClose}>
            <img src={CloseIcon} alt="Close" />
          </button>
        </div>
        <div className="confirm-body">
          <div className={`confirm-icon ${type}`}>
            {type === 'danger' ? '🗑️' : type === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <p>{message}</p>
        </div>
        <div className="confirm-footer">
          <button className="btn-cancel" onClick={handleClose}>
            {cancelText}
          </button>
          <button
            className={`btn-confirm ${type === 'danger' ? 'btn-danger' : ''}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
