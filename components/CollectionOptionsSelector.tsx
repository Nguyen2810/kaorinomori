import React from 'react';

interface CollectionOptionsSelectorProps {
  selectedCount: number;
  onCountChange: (count: number) => void;
}

const options = [
  { id: 1, name: 'Một ảnh' },
  { id: 4, name: 'Bộ sưu tập x4' },
  { id: 6, name: 'Bộ sưu tập x6' },
  { id: 8, name: 'Bộ sưu tập x8' },
];

export const CollectionOptionsSelector: React.FC<CollectionOptionsSelectorProps> = ({ selectedCount, onCountChange }) => {
  return (
    <div>
      <h3 className="text-md font-semibold text-gray-600 mb-3">Chế độ tạo ảnh:</h3>
      <div className="grid grid-cols-4 gap-1 bg-gray-200 rounded-lg p-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onCountChange(option.id)}
            className={`py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
              selectedCount === option.id
                ? 'bg-white text-indigo-600 shadow'
                : 'bg-transparent text-gray-600 hover:bg-gray-300'
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
};
