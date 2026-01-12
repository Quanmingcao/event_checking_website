import React from 'react';
import { Link } from 'react-router-dom';

export const SchoolNav = () => (
    <div className="bg-[#005a8d] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 py-3 text-sm font-bold uppercase tracking-wide">
                <Link to="/" className="hover:text-yellow-300 cursor-pointer flex items-center gap-1">Trang chủ</Link>
                <span className="hover:text-yellow-300 cursor-pointer flex items-center gap-1 opacity-75">Giới thiệu</span>
                <span className="hover:text-yellow-300 cursor-pointer flex items-center gap-1 opacity-75">Đào tạo</span>
                <span className="hover:text-yellow-300 cursor-pointer flex items-center gap-1 opacity-75">Tuyển sinh</span>
                <span className="hover:text-yellow-300 cursor-pointer flex items-center gap-1 opacity-75">Tin tức</span>
            </div>
        </div>
    </div>
);
