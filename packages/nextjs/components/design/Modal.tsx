import React, { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  description?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = "", description = "" }) => {
  // Handle closing the modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg p-6 min-w-[600px] shadow-lg ${className}`}>
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
            <div className="text-gray-500 text-sm mt-1">{description}</div>
          </div>

          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
