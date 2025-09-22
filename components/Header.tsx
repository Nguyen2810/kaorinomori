import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Kaori No Mori - AI Studio
        </h1>
        <p className="text-gray-500 mt-1">Tạo ảnh sản phẩm ngay lập tức.</p>
      </div>
    </header>
  );
};
