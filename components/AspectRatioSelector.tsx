import React from 'react';

interface AspectRatioSelectorProps {
  selectedRatio: string;
  onRatioChange: (ratio: string) => void;
}

const ratios = [
  { id: '1:1', name: 'Vuông (1:1)' },
  { id: '16:9', name: 'Ngang (16:9)' },
  { id: '9:16', name: 'Dọc (9:16)' },
  { id: '4:3', name: 'Ảnh (4:3)' },
];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selectedRatio, onRatioChange }) => {
  return (
    <div className="mb-4">
      <h3 className="text-md font-semibold text-gray-600 mb-3">Tỷ lệ khung hình:</h3>
      <div className="flex flex-wrap gap-2">
        {ratios.map((ratio) => (
          <button
            key={ratio.id}
            onClick={() => onRatioChange(ratio.id)}
            className={`text-sm font-medium rounded-full py-2 px-4 transition-colors duration-200 ease-in-out
              ${selectedRatio === ratio.id
                ? 'bg-brand text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {ratio.name}
          </button>
        ))}
      </div>
    </div>
  );
};