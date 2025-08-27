import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import PropTypes from "prop-types";

const PhotoUpload = ({ pumpId, onUploadSuccess, onClose, isDarkMode }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("photos", file);
      });

      const response = await fetch(`/api/v1/pumps/${pumpId}/photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onUploadSuccess(result);
        setSelectedFiles([]);
        setUploadProgress(100);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Error uploading photos: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-2xl mx-4 ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-xl shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3
            className={`text-lg font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Upload Photos
          </h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <XMarkIcon
              className={`w-5 h-5 ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-[#0272AD] bg-[#0272AD]/5"
                : isDarkMode
                ? "border-gray-600 hover:border-gray-500"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <CloudArrowUpIcon
              className={`mx-auto h-12 w-12 mb-4 ${
                isDragActive
                  ? "text-[#0272AD]"
                  : isDarkMode
                  ? "text-gray-400"
                  : "text-gray-300"
              }`}
            />
            <p
              className={`text-lg font-medium mb-2 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {isDragActive ? "Drop files here" : "Drag & drop photos here"}
            </p>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              or click to select files
            </p>
            <p
              className={`text-xs mt-2 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Max file size: 5MB • Supported: JPG, PNG, GIF, WebP
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h4
                className={`text-sm font-medium mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <PhotoIcon
                        className={`w-5 h-5 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {file.name}
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className={`p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors`}
                    >
                      <XMarkIcon className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Uploading...
                </span>
                <span
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#0272AD] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={uploading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:text-white"
                : "text-gray-700 hover:text-gray-900"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
          <button
            onClick={uploadPhotos}
            disabled={selectedFiles.length === 0 || uploading}
            className={`px-4 py-2 text-sm font-medium text-white bg-[#0272AD] rounded-lg hover:bg-[#0272AD]/90 transition-colors ${
              selectedFiles.length === 0 || uploading
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {uploading ? "Uploading..." : "Upload Photos"}
          </button>
        </div>
      </div>
    </div>
  );
};

PhotoUpload.propTypes = {
  pumpId: PropTypes.string.isRequired,
  onUploadSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isDarkMode: PropTypes.bool.isRequired,
};

export default PhotoUpload;
