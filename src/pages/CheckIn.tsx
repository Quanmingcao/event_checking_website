import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { Attendant } from '../types';
import { ArrowLeft, CheckCircle, XCircle, QrCode, ScanFace, Camera, RefreshCw } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { loadModels } from '../services/faceService';

export default function CheckIn() {
  const { id } = useParams<{ id: string }>();
  
  // State
  const [mode, setMode] = useState<'qr' | 'face'>('qr');
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; attendant?: Attendant } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [matcher, setMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Init & Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 2. Load Models & Face Data when switching to Face Mode
  useEffect(() => {
    if (mode === 'face' && !matcher) {
      const initFaceReqs = async () => {
        setLoadingModels(true);
        try {
            // A. Load Models
            await loadModels();
            
            // B. Fetch Attendants with Descriptors
            const { data: attendants } = await supabase
                .from('attendants')
                .select('*')
                .eq('event_id', id)
                .not('face_descriptor', 'is', null);

            if (attendants && attendants.length > 0) {
                 const labeledDescriptors = attendants.map(att => {
                    const descriptorArray = new Float32Array(att.face_descriptor);
                    return new faceapi.LabeledFaceDescriptors(att.id, [descriptorArray]);
                 });
                 
                 // Create Matcher (standard distance 0.6)
                 setMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
            } else {
                 console.warn("No face data found for this event.");
            }

            // Camera is started by the next effect based on 'mode'
        } catch (err) {
            console.error("Setup Face Error:", err);
            setCameraError("Lỗi khởi tạo AI hoặc Camera.");
        } finally {
            setLoadingModels(false);
        }
      };
      initFaceReqs();
    }
    
    // Manage Camera Lifecycle
    if (mode === 'face' && matcher) {
        startCamera();
    } else {
        stopCamera();
    }
  }, [mode, matcher, facingMode]); // Restart camera if facingMode changes

  // 3. QR Code Scanner Effect
  useEffect(() => {
    if (mode === 'qr') {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );
        scanner.render(onScanSuccess, onScanFailure);

        return () => {
          scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }
  }, [mode, id]);

  // --- Helpers ---

  const startCamera = async () => {
      stopCamera(); // Ensure clean start
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: facingMode } 
          });
          streamRef.current = stream;
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
              
              // Start Detection Loop
              intervalRef.current = setInterval(detectFaceLoop, 200); // Check faster (200ms)
          }
      } catch (err) {
          console.error("Camera Error:", err);
          setCameraError("Không thể truy cập Camera. Vui lòng cấp quyền.");
      }
  };

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const stopCamera = () => {
      if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
      }
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
  };

  // ... (detectFaceLoop, onScanSuccess, onScanFailure, handleCheckIn remain unchanged) ...
  const detectFaceLoop = async () => {
      if (!videoRef.current || !matcher || processing) return;

      // Relax detection confidence slightly
      const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

      if (detection) {
          const bestMatch = matcher.findBestMatch(detection.descriptor);
          console.log("Face Detected:", bestMatch.toString()); // DEBUG

          // Logic: If result is NOT 'unknown', we have a match
          if (bestMatch.label !== 'unknown') {
              setProcessing(true);
              // bestMatch.label is the Attendant ID (set in LabeledFaceDescriptors)
              await handleCheckIn(bestMatch.label, 'face');
              
              // Cooldown
              setTimeout(() => setProcessing(false), 3000); 
          }
      }
  };

  const onScanSuccess = async (decodedText: string) => {
    if (processing) return;
    setProcessing(true);
    try {
        await handleCheckIn(decodedText, 'qr');
    } finally {
        setTimeout(() => setProcessing(false), 2000);
    }
  };

  const onScanFailure = (error: any) => {};

  const handleCheckIn = async (identifier: string, type: 'qr' | 'face') => {
    // 1. Fetch Attendant Details
    // For QR: identifier matches 'code'
    // For Face: identifier matches 'id' (UUID)
    
    let query = supabase.from('attendants').select('*, event_groups (zone_label)').eq('event_id', id);
    
    if (type === 'qr') {
        query = query.eq('code', identifier);
    } else {
        query = query.eq('id', identifier);
    }
    
    const { data: attendants, error } = await query.limit(1);

    if (error || !attendants || attendants.length === 0) {
        if (type === 'qr') setScanResult({ success: false, message: `Mã "${identifier}" không tồn tại.` });
        return;
    }

    const attendant = attendants[0];
    const groupInfo = (attendant as any).event_groups; // Joined data

    // Check Duplicate
    if (attendant.checked_in_at) {
        setScanResult({
            success: false,
            message: `ĐÃ CHECK-IN LÚC ${new Date(attendant.checked_in_at).toLocaleTimeString('vi-VN')}`,
            attendant: { ...attendant, _group: groupInfo } as any
        });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Err pattern
        return;
    }


    const now = new Date().toISOString();
    if (navigator.vibrate) navigator.vibrate(200);

    setScanResult({
        success: true,
        message: type === 'face' ? `Nhận diện: ${attendant.full_name}` : `Chào mừng, ${attendant.full_name}!`,
        attendant: { ...attendant, checked_in_at: now, _group: groupInfo } as any
    });

    // Update DB
    Promise.all([
        supabase.from('attendants').update({ checked_in_at: now }).eq('id', attendant.id),
        supabase.from('checkin_logs').insert([{ event_id: id, attendant_id: attendant.id, checked_in_at: now }])
    ]).catch(err => console.error("Update DB Error", err));
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center text-gray-500">
            <ArrowLeft className="w-5 h-5 mr-1" /> Quay lại
          </Link>
          <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                  onClick={() => setMode('qr')}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'qr' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              >
                  <QrCode className="w-4 h-4 mr-1.5" />
                  QR Code
              </button>
              <button
                  onClick={() => setMode('face')}
                  className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'face' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
              >
                  <ScanFace className="w-4 h-4 mr-1.5" />
                  Khuôn mặt
              </button>
          </div>
      </div>
      
      <div className="flex items-center justify-center space-x-2">
         <h1 className="text-xl font-bold text-center">
            {mode === 'qr' ? 'Quét Mã QR' : 'Nhận Diện Khuôn Mặt'}
         </h1>
         {mode === 'face' && (
             <button
                onClick={toggleCamera}
                className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                title="Đổi Camera"
             >
                <RefreshCw size={16} />
             </button>
         )}
      </div>
      
      {/* Main Content Area */}
      <div className="relative min-h-[300px] bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          
          {/* QR Mode */}
          {mode === 'qr' && (
              <div id="reader" className="w-full h-full bg-white"></div>
          )}

          {/* Face Mode */}
          {mode === 'face' && (
              <>
                {loadingModels && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/90 text-white">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                        <p className="text-sm">Đang tải dữ liệu khuôn mặt...</p>
                    </div>
                )}
                
                {cameraError && (
                    <div className="text-red-400 text-center p-4">
                        <XCircle className="w-8 h-8 mx-auto mb-2" />
                        {cameraError}
                    </div>
                )}

                {!cameraError && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} // Mirror if user facing
                    />
                )}

                {/* Face Overlay Guide */}
                <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-indigo-400/50 m-12 rounded-lg z-10 opacity-50"></div>
                {processing && (
                   <div className="absolute top-4 right-4 z-20">
                       <span className="flex items-center px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                           <CheckCircle className="w-3 h-3 mr-1" /> Đã xử lý
                       </span>
                   </div>
                )}
              </>
          )}
      </div>

      {resultDisplay()}

      <div className="text-center text-xs text-gray-400 mt-8">
        Event ID: {id}
      </div>
    </div>
  );

  function resultDisplay() {
      if (!scanResult) return null;

      const { success, message, attendant } = scanResult;
      const anyAttendant = attendant as any; // Access joined props
      const zone = anyAttendant?._group?.zone_label;
      const seat = anyAttendant?.seat_location;

      const bgColor = success ? 'bg-green-50' : 'bg-red-50';
      const textColor = success ? 'text-green-800 text-3xl font-bold' : 'text-red-800';
      const borderColor = success ? 'border-green-200' : 'border-red-200';
      const Icon = success ? CheckCircle : XCircle;

      return (
          <div className={`mt-6 p-6 rounded-lg border ${borderColor} ${bgColor} ${textColor} text-center shadow-sm animate-in fade-in zoom-in duration-300`}>
              <div className="flex justify-center mb-2">
                  <Icon className="w-12 h-12" />
              </div>
              <h2 className="text-lg font-bold">{success ? 'THÀNH CÔNG' : 'CHÚ Ý'}</h2>
              <p className="mt-1 font-medium text-lg">{message}</p>
              
      {attendant && (
                  <div className="mt-4 pt-4 border-t border-black/10">
                      {attendant.avatar_url && (
                          <img src={attendant.avatar_url} alt="Ava" className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border-4 border-white shadow-md" />
                      )}
                      <div className="text-2xl font-bold text-gray-900 mt-2">{attendant.full_name}</div>
                      <div className="text-base text-gray-600">{attendant.position}</div>
                      <div className="text-sm text-gray-500 uppercase tracking-widest mt-1">{attendant.organization}</div>
                      
                      {/* Seat / Zone Info */}
                      {(seat || zone) && (
                        <div className="mt-3 bg-white/50 p-2 rounded-md border border-black/5 inline-block min-w-[200px]">
                            {zone && <div className="text-sm text-gray-500 uppercase tracking-wider">Khu vực: <span className="text-gray-900 font-bold">{zone}</span></div>}
                            {seat && <div className="text-sm text-gray-500 uppercase tracking-wider">Ghế: <span className="text-indigo-700 font-bold">{seat}</span></div>}
                        </div>
                      )}

                      {attendant.is_vip && (
                          <div className="mt-3">
                            <span className="inline-block px-4 py-1 bg-yellow-400 text-yellow-900 text-sm font-bold rounded-full uppercase tracking-wide shadow-sm">
                                KHÁCH VIP
                            </span>
                          </div>
                      )}
                  </div>
              )}
          </div>
      );
  }
}
