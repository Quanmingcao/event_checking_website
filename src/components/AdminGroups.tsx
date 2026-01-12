import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { EventGroup } from '../types';
import { Plus, Trash2, Edit2, Save, X, Users, MapPin } from 'lucide-react';

interface AdminGroupsProps {
    eventId: string;
}

export const AdminGroups: React.FC<AdminGroupsProps> = ({ eventId }) => {
    const [groups, setGroups] = useState<EventGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form State
    const [newName, setNewName] = useState('');
    const [newLimit, setNewLimit] = useState(0);
    const [newZone, setNewZone] = useState('');
    const [isUnlimited, setIsUnlimited] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, [eventId]);

    const fetchGroups = async () => {
        setLoading(true);
        // 1. Get Groups
        const { data: groupsData, error } = await supabase
            .from('event_groups')
            .select('*')
            .eq('event_id', eventId)
            .order('name');
        
        if (error) {
            console.error(error);
            setLoading(false);
            return;
        }

        // 2. Get Counts (Optional optimization: use separate query or count)
        // For simplicity, we Fetch counts separately or join if possible.
        // Supabase handy way:
        const groupsWithCounts = await Promise.all(groupsData.map(async (g) => {
            const { count } = await supabase
                .from('attendants')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', g.id);
            return { ...g, current_count: count || 0 };
        }));

        setGroups(groupsWithCounts);
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!newName) return;
        
        const limitToSave = isUnlimited ? 0 : newLimit;

        const { error } = await supabase.from('event_groups').insert({
            event_id: eventId,
            name: newName,
            limit_count: limitToSave,
            zone_label: newZone
        });

        if (error) {
            alert('Lỗi thêm nhóm: ' + error.message);
        } else {
            setNewName('');
            setNewLimit(0);
            setNewZone('');
            setIsUnlimited(false);
            fetchGroups();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa nhóm này? Những người đã đăng ký thuộc nhóm này sẽ bị mất liên kết nhóm.")) return;
        
        const { error } = await supabase.from('event_groups').delete().eq('id', id);
        if (error) alert('Lỗi xóa: ' + error.message);
        else fetchGroups();
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Quản lý Đơn vị / Lớp / Nhóm
            </h3>

            {/* Add New */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tên Nhóm / Đơn vị</label>
                    <input 
                        type="text" 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="VD: Lớp 12A, Khách VIP..."
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-gray-500">Giới hạn {isUnlimited && '(Vô cực)'}</label>
                        <div className="flex items-center">
                            <input
                                id="unlimited_group" 
                                type="checkbox"
                                className="h-3 w-3 text-indigo-600 rounded"
                                checked={isUnlimited}
                                onChange={e => setIsUnlimited(e.target.checked)}
                            />
                            <label htmlFor="unlimited_group" className="ml-1 text-[10px] text-gray-500 cursor-pointer">Không GH</label>
                        </div>
                    </div>
                    <input 
                        type="number" 
                        disabled={isUnlimited}
                        className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isUnlimited ? 'bg-gray-100 text-gray-400' : ''}`}
                        placeholder={isUnlimited ? "∞" : "0"}
                        value={newLimit}
                        onChange={e => setNewLimit(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Khu vực ngồi (Zone)</label>
                    <input 
                        type="text" 
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="VD: Khu A, Hàng 1-5"
                        value={newZone}
                        onChange={e => setNewZone(e.target.value)}
                    />
                </div>
                <div className="flex items-end">
                    <button 
                        onClick={handleAdd}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Thêm
                    </button>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-4 text-gray-500">Đang tải...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên Nhóm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã đăng ký / Giới hạn</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {groups.map(group => (
                                <tr key={group.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {group.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mr-2 w-24">
                                                <div 
                                                    className={`h-2.5 rounded-full ${
                                                        (group.limit_count && group.current_count! >= group.limit_count) ? 'bg-red-600' : 'bg-green-600'
                                                    }`} 
                                                    style={{ width: `${group.limit_count ? Math.min((group.current_count || 0) / group.limit_count * 100, 100) : 0}%` }}
                                                ></div>
                                            </div>
                                            <span>
                                                {group.current_count} / {group.limit_count > 0 ? group.limit_count : '∞'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {group.zone_label ? (
                                            <span className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                                {group.zone_label}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(group.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {groups.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Chưa có nhóm nào. Vui lòng thêm nhóm phía trên.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
