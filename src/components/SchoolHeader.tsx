import React from 'react';
import { Building } from 'lucide-react';

export const SchoolHeader = () => (
    <div className="bg-white py-2 px-4 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
            {/* Logo Placeholder */}
            <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-500">
                    <Building className="text-blue-600 w-8 h-8" />
                </div>
            </div>
            {/* School Name */}
            <div className="text-center md:text-left uppercase">
                <div className="text-xs font-bold text-gray-500">Bộ Giáo dục và Đào tạo</div>
                <div className="text-xl md:text-2xl font-bold text-blue-700 leading-tight">Trường Đại Học Mẫu</div>
                <div className="text-sm font-semibold text-orange-500 tracking-wider">Education Quality Accreditation</div>
            </div>
            {/* Search/Social placeholder - hidden on small */}
            <div className="hidden md:flex ml-auto gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center font-bold">Z</div>
                    <div className="w-8 h-8 bg-blue-800 text-white rounded flex items-center justify-center font-bold">f</div>
            </div>
        </div>
    </div>
);
