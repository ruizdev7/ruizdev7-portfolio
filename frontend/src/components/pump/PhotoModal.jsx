import { useState } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const PhotoModal = ({ isOpen, onClose, pump, photoOrder, setPhotoOrder }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (!isOpen || !pump) return null;

  const photos = pump.photo_urls || [];
  const currentPhoto = photos[currentPhotoIndex];

  const handlePrevious = () => {
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="relative max-w-5xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              Photo Gallery
            </h3>
            <p className="text-sm text-slate-600 dark:text-gray-400 mt-1">
              {pump.serial_number || pump.ccn_pump} • {photos.length} photos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-slate-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Photos Available
              </h3>
              <p className="text-slate-600 dark:text-gray-400">
                This pump doesn't have any photos yet.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Main Photo */}
              <div className="flex items-center justify-center">
                <img
                  src={currentPhoto}
                  alt={`Pump photo ${currentPhotoIndex + 1}`}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              </div>

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all backdrop-blur-sm"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-all backdrop-blur-sm"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Photo Counter */}
              <div className="text-center mt-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300">
                  {currentPhotoIndex + 1} of {photos.length}
                </span>
              </div>

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        index === currentPhotoIndex
                          ? "border-[#0272AD] ring-2 ring-[#0272AD]/20"
                          : "border-slate-300 dark:border-gray-600 hover:border-slate-400"
                      }`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-gray-700 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0272AD] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

PhotoModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  pump: PropTypes.object,
  photoOrder: PropTypes.array,
  setPhotoOrder: PropTypes.func,
};

export default PhotoModal;
