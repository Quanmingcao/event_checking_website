import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Clock, Star, LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalUsers: 0,
        upcomingEvents: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // 1. Total Events (Count all)
            const { count: eventCount } = await supabase
                .from('events')
                .select('*', { count: 'exact', head: true });
            
            // 2. Total Users (Start from profiles)
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 3. Upcoming Events
            const { data: upcomingData } = await supabase
                .from('events')
                .select('*')
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true })
                .limit(5);

            setStats({
                totalEvents: eventCount || 0,
                totalUsers: userCount || 0,
                upcomingEvents: upcomingData || []
            });

        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Quản Trị</h1>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center transition-transform hover:scale-105">
                    <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Tổng sự kiện</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center transition-transform hover:scale-105">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Tổng tài khoản</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex items-center transition-transform hover:scale-105">
                    <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                        <Star size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Sự kiện sắp tới</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents.length}</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Events List */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h3 className="text-lg font-medium text-gray-900">Sự kiện sắp diễn ra</h3>
                    <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center font-medium">
                        Xem tất cả <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>
                <div className="divide-y divide-gray-200">
                    {stats.upcomingEvents.length > 0 ? (
                        stats.upcomingEvents.map(evt => (
                            <Link to={`/admin/events/${evt.id}`} key={evt.id} className="block hover:bg-gray-50 transition-colors group">
                                <div className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-base font-bold text-indigo-700 mb-1 group-hover:text-indigo-900">{evt.name}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock size={14} className="mr-1" />
                                            {evt.start_time ? new Date(evt.start_time).toLocaleString('vi-VN') : 'Chưa định ngày'}
                                            <span className="mx-2 text-gray-300">|</span>
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs border border-gray-200 text-gray-600">{evt.event_code}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center text-gray-400 group-hover:translate-x-1 transition-transform">
                                        <span className="text-xs mr-2 opacity-0 group-hover:opacity-100 transition-opacity">Chi tiết</span>
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                            <Calendar className="h-10 w-10 text-gray-300 mb-2" />
                            Không có sự kiện nào sắp tới trong 30 ngày tới.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
