import { useState } from 'react';
import CloseIcon from 'src/icons/CloseIcon';

export default function DeprecatedModal() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 animate-fadeIn">
      <div className="relative bg-[#0d151e]  rounded-xl shadow-2xl max-w-md mx-4 animate-slideUp">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#67778e] hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-white/10"
          aria-label="Close modal"
        >
          <CloseIcon width={16} height={16} />
        </button>
        
        <div className="flex flex-col items-center justify-center gap-6 px-8 py-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mb-2">
              <svg 
                className="w-8 h-8 text-yellow-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white text-center">
              Important Update
            </h2>
            
            <p className="text-[#8b98ad] text-center leading-relaxed">
              Jupiter Terminal has been deprecated and rebranded as 
              <span className="text-white font-semibold"> Jupiter Plugin</span>
            </p>
          </div>
          
          <div className="flex gap-3 w-full">
            <button
              onClick={handleClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-white/10 text-sm"
            >
              Dismiss
            </button>
            
            <button
              onClick={() => {
                window.open('https://plugin.jup.ag', '_blank');
                handleClose();
              }}
              className="flex-1 bg-primary/30 text-primary hover:bg-primary/60 px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
            >
              Visit Jupiter Plugin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
