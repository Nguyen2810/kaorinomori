import React from 'react';

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const PromptInput: React.FC<PromptInputProps> = ({ value, onChange, placeholder }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "ví dụ: Một ngọn nến thơm trên phiến đá cẩm thạch tối giản với ánh sáng buổi sáng dịu nhẹ."}
      rows={4}
      className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/50 focus:border-brand transition-shadow resize-none placeholder:text-gray-500"
    />
  );
};