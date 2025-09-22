import React from 'react';

interface MaterialSelectorProps {
  selectedMaterial: string;
  onMaterialChange: (material: string) => void;
}

const materials = [
  { id: 'Default', name: 'Mặc định' },
  { id: 'Glossy', name: 'Bóng' },
  { id: 'Frosted', name: 'Mờ' },
  { id: 'Mirrored', name: 'Tráng gương' },
  { id: 'Transparent', name: 'Trong suốt' },
];

export const MaterialSelector: React.FC<MaterialSelectorProps> = ({ selectedMaterial, onMaterialChange }) => {
  return (
    <div className="mb-4">
      <h3 className="text-md font-semibold text-gray-600 mb-3">Chất liệu sản phẩm:</h3>
      <div className="flex flex-wrap gap-2">
        {materials.map((material) => (
          <button
            key={material.id}
            onClick={() => onMaterialChange(material.id)}
            className={`text-sm font-medium rounded-full py-2 px-4 transition-colors duration-200 ease-in-out
              ${selectedMaterial === material.id
                ? 'bg-brand text-white shadow'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {material.name}
          </button>
        ))}
      </div>
    </div>
  );
};