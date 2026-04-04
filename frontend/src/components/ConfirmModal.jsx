import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <AlertTriangle size={36} className="text-danger" color="var(--danger)" />
        </div>
        <h3 className="modal-title">Reset Index?</h3>
        <p className="modal-desc">
          All your uploaded documents and chat history will be permanently deleted. This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={() => { onConfirm(); onClose(); }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}
