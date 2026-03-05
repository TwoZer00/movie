export default function KeyboardShortcutsModal({ onClose, mode = 'guess' }) {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6' onClick={(e) => e.stopPropagation()}>
        <h2 className='text-2xl font-bold mb-4 dark:text-white'>⌨️ Keyboard Shortcuts</h2>
        
        <div className='space-y-3 mb-6'>
          <div className='flex justify-between items-center'>
            <span className='text-gray-700 dark:text-gray-300'>Show this help</span>
            <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>?</kbd>
          </div>
          
          <div className='flex justify-between items-center'>
            <span className='text-gray-700 dark:text-gray-300'>Focus search</span>
            <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>S</kbd>
          </div>
          
          <div className='flex justify-between items-center'>
            <span className='text-gray-700 dark:text-gray-300'>Clear search</span>
            <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>Esc</kbd>
          </div>
          
          <div className='flex justify-between items-center'>
            <span className='text-gray-700 dark:text-gray-300'>Select single result</span>
            <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>Enter</kbd>
          </div>
          
          {mode === 'link' && (
            <>
              <div className='flex justify-between items-center'>
                <span className='text-gray-700 dark:text-gray-300'>Get hint</span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>H</kbd>
              </div>
              
              <div className='flex justify-between items-center'>
                <span className='text-gray-700 dark:text-gray-300'>Undo last move</span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>U</kbd>
              </div>
              
              <div className='flex justify-between items-center'>
                <span className='text-gray-700 dark:text-gray-300'>Give up (non-daily)</span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>G</kbd>
              </div>
            </>
          )}
          
          {mode === 'guess' && (
            <>
              <div className='flex justify-between items-center'>
                <span className='text-gray-700 dark:text-gray-300'>Pass turn</span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>P</kbd>
              </div>
              
              <div className='flex justify-between items-center'>
                <span className='text-gray-700 dark:text-gray-300'>Skip movie (non-daily)</span>
                <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>K</kbd>
              </div>
            </>
          )}
          
          <div className='flex justify-between items-center'>
            <span className='text-gray-700 dark:text-gray-300'>Close modal</span>
            <kbd className='px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono'>Esc</kbd>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className='w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600'
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
