import React, { useRef, useState } from "react";

const EditProfileImageModal = ({ onClose, onSave }) => {
  const fileInputRef = useRef();
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (preview) onSave(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
        <h2 className="text-xl font-bold text-[#0A4D68] mb-4">Update Profile Photo</h2>
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border shadow mb-4">
            <img
              src={preview || "https://via.placeholder.com/150"}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="mb-4 text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-[#0A4D68]"
          >
            Choose Image
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-[#0A4D68] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#08374f]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileImageModal;
