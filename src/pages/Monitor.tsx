import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Attendant } from '../types';
import { ArrowLeft, User, Clock } from 'lucide-react';

export default function Monitor() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null); // To store event background
  const [stats, setStats] = useState({ total: 0, checkedIn: 0 });
  const [currentGuest, setCurrentGuest] = useState<Attendant | null>(null);
  
  // Timeout ref to clear welcome message
  const welcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Dùng Set để theo dõi những ID đã check-in, tránh update trùng lặp
  const checkedInIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
        fetchEventDetails();
        fetchInitialData();
        
        // --- REALTIME SETUP ---
        const channel = supabase
          .channel('realtime-monitor')
          .on(
            'postgres_changes',
            { 
              event: 'UPDATE', 
              schema: 'public', 
              table: 'attendants', 
              filter: `event_id=eq.${id}` // Chỉ nghe sự kiện của event này
            },
            (payload) => {
              const newRecord = payload.new as Attendant;
              
              // Logic: Nếu bản ghi này có 'checked_in_at' và chưa có trong danh sách đã check-in cục bộ
              if (newRecord.checked_in_at && !checkedInIds.current.has(newRecord.id)) {
                 
                 // 1. Đánh dấu đã xử lý
                 checkedInIds.current.add(newRecord.id);

                 // 2. Cập nhật Stats
                 setStats((prev) => ({ ...prev, checkedIn: prev.checkedIn + 1 }));

                 // 3. Fetch Full Details (include group/seat info)
                 supabase
                    .from('attendants')
                    .select('*, event_groups (zone_label)')
                    .eq('id', newRecord.id)
                    .single()
                    .then(({ data }) => {
                        if (data) {
                            showWelcome(data as any);
                        }
                    });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
          if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
        };
    }
  }, [id]);

  const fetchEventDetails = async () => {
      const { data } = await supabase.from('events').select('image_url, name').eq('id', id).single();
      if (data) setEvent(data);
  };
  
  const fetchInitialData = async () => {
    // Lấy tổng số
    const { count: total } = await supabase.from('attendants').select('*', { count: 'exact', head: true }).eq('event_id', id);
    // Lấy số đã check-in
    const { count: checkedIn } = await supabase.from('attendants').select('*', { count: 'exact', head: true }).eq('event_id', id).not('checked_in_at', 'is', null);
    
    setStats({ total: total || 0, checkedIn: checkedIn || 0 });

    // Lấy tất cả checked in ids để sync cache
    const { data } = await supabase
        .from('attendants')
        .select('id')
        .eq('event_id', id)
        .not('checked_in_at', 'is', null);
    
    if (data) {
        data.forEach(p => checkedInIds.current.add(p.id));
    }
  };

  const showWelcome = (guest: Attendant) => {
      setCurrentGuest(guest);
      
      // Clear existing timeout
      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
      
      // Auto clear after 10 seconds
      welcomeTimeoutRef.current = setTimeout(() => {
          setCurrentGuest(null);
      }, 10000);
  };

  const percentage = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden font-sans">
        {/* Background Layer */}
        {event?.image_url ? (
            <div 
                className="absolute inset-0 z-0 bg-no-repeat transition-all duration-1000"
                style={{ 
                    backgroundImage: `url(${event.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center'
                }}
            >
                {/* Overlay removed as requested */}
            </div>
        ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div>
        )}

        {/* Header / Stats Corner */}
        <div className="absolute top-6 right-6 z-10 flex flex-col items-end space-y-2">
             <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl text-white min-w-[240px]">
                <h3 className="text-sm font-medium uppercase tracking-wider text-white/70 mb-1">Hiện diện</h3>
                <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-bold">{stats.checkedIn}</span>
                    <span className="text-2xl text-white/60">/ {stats.total}</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                </div>
             </div>
             
             <Link to="/" className="text-white/50 hover:text-white p-2 bg-black/20 rounded-full backdrop-blur-sm transition-colors">
                 <ArrowLeft className="w-6 h-6" />
             </Link>
        </div>

        {/* Welcome Overlay - Centered */}
        <div className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-700 ${currentGuest ? 'opacity-100' : 'opacity-0'}`}>
            {currentGuest && (
                 <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl p-12 max-w-4xl w-full mx-4 text-center transform transition-transform duration-500 scale-100 border border-white/50 animate-in fade-in zoom-in-95">
                     
                     <div className="mb-8 flex flex-col items-center">
                         <span className="inline-block py-2 px-6 rounded-full bg-indigo-100 text-indigo-800 text-xl font-bold tracking-wide uppercase mb-6">
                            Xin Chào mừng
                         </span>
                         
                         <div className="relative inline-block">
                             {currentGuest.avatar_url ? (
                                 <img 
                                    src={currentGuest.avatar_url} 
                                    alt={currentGuest.full_name} 
                                    className="w-48 h-48 rounded-full object-cover border-8 border-indigo-50 shadow-lg mx-auto"
                                 />
                             ) : (
                                 <div className="w-48 h-48 rounded-full bg-slate-100 flex items-center justify-center border-8 border-indigo-50 shadow-lg mx-auto">
                                     <User className="w-24 h-24 text-slate-300" />
                                 </div>
                             )}
                             {currentGuest.is_vip && (
                                 <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 p-3 rounded-full border-4 border-white shadow-lg">
                                     <span className="text-xs font-bold uppercase">VIP</span>
                                 </div>
                             )}
                         </div>
                     </div>

                     <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 leading-tight">
                         {currentGuest.full_name}
                     </h1>
                     
                     <div className="space-y-2">
                        {currentGuest.position && (
                            <p className="text-2xl md:text-3xl text-indigo-600 font-medium">
                                {currentGuest.position}
                            </p>
                        )}
                        {currentGuest.organization && (
                            <p className="text-xl md:text-2xl text-slate-500 font-medium">
                                {currentGuest.organization}
                            </p>
                        )}
                        
                        {/* Seat / Zone Info */}
                         {((currentGuest as any).event_groups?.zone_label || currentGuest.seat_location) && (
                            <div className="mt-6 flex justify-center gap-4">
                                {(currentGuest as any).event_groups?.zone_label && (
                                    <div className="bg-indigo-50 border border-indigo-100 px-6 py-3 rounded-xl">
                                        <p className="text-sm text-indigo-500 uppercase font-bold tracking-wider">Khu vực</p>
                                        <p className="text-3xl text-indigo-900 font-bold">{(currentGuest as any).event_groups.zone_label}</p>
                                    </div>
                                )}
                                {currentGuest.seat_location && (
                                    <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-xl">
                                        <p className="text-sm text-emerald-600 uppercase font-bold tracking-wider">Số Ghế</p>
                                        <p className="text-3xl text-emerald-900 font-bold">{currentGuest.seat_location}</p>
                                    </div>
                                )}
                            </div>
                         )}

                     </div>

                     <div className="mt-8 pt-8 border-t border-slate-100">
                         <p className="text-slate-400 text-lg italic">
                             Chúc quý khách có những trải nghiệm tuyệt vời tại sự kiện!
                         </p>
                     </div>
                 </div>
            )}
        </div>
    </div>
  );
}