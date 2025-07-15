import React from 'react';
import Modal from './Modal';
import styles from './Modal.module.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const actions = (
    <>
      <button className={styles.cancelButton} onClick={onClose}>
        {cancelText}
      </button>
      <button 
        className={`${styles.confirmButton} ${variant === 'primary' ? styles.primary : ''}`} 
        onClick={handleConfirm}
      >
        {confirmText}
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmationModal;
