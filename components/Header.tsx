import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-brand tracking-tight">
          Kaori No Mori - Studio sản phẩm ✨
        </h1>
        <p className="text-brand/70 mt-1">Tạo ảnh sản phẩm chuyên nghiệp ngay lập tức.</p>
      </div>
    </header>
  );
};