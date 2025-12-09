import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const bodyScrollLocked = useRef(false);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Prevent body scroll - save current scroll position
      const scrollY = window.scrollY;
      bodyScrollLocked.current = true;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Focus the modal after a brief delay to ensure it's rendered
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      // Restore body scroll
      if (bodyScrollLocked.current) {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
        bodyScrollLocked.current = false;
      }
      
      // Restore focus to previous element
      previousActiveElement.current?.focus();
    }

    // Cleanup
    return () => {
      if (bodyScrollLocked.current) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        bodyScrollLocked.current = false;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ 
        // Ensure backdrop is visible and blur works
        isolation: 'isolate'
      }}
    >
      {/* Backdrop with blur - ensure page stays visible */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        style={{
          // Force backdrop-filter to work
          WebkitBackdropFilter: 'blur(4px)',
          backdropFilter: 'blur(4px)',
        }}
      />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative z-10 bg-white rounded-lg shadow-2xl w-full sm:${maxWidth} max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform transition-all scrollbar-hide`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{
          // Ensure modal is above backdrop
          isolation: 'isolate',
          // Hide scrollbar but keep scroll functionality
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg z-10">
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-gray-900">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="px-4 sm:px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at root level, avoiding stacking context issues
  return createPortal(modalContent, document.body);
};

export default Modal;

