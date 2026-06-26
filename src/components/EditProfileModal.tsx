import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Type, Sparkles, X, User } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import Modal from './ui/Modal';
import AvatarWithCosmetic from './ui/AvatarWithCosmetic';

export function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state, updateUser } = useApp();
  const { settings, updateSetting } = useSettings();
  const { addToast } = useToast();

  const [displayName, setDisplayName] = useState(settings.profile.displayName || '');
  const [username, setUsername] = useState(settings.profile.username || '');
  const [email, setEmail] = useState(settings.profile.email || '');

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customInitials, setCustomInitials] = useState('');

  const avatarsList = ['🦊', '🐺', '🦉', '🐻', '🐼', '🦁', '🐅', '🐸'];

  useEffect(() => {
    if (isOpen) {
      setDisplayName(settings.profile.displayName || '');
      setUsername(settings.profile.username || '');
      setEmail(settings.profile.email || '');
      
      if (state.user.avatar && state.user.avatar.length <= 2 && !state.user.avatar.startsWith('data:') && !state.user.avatar.includes('/') && !state.user.avatar.includes('.')) {
        setCustomInitials(state.user.avatar);
      }
    } else {
      stopCamera();
    }
  }, [isOpen, settings.profile.displayName, settings.profile.username, settings.profile.email, state.user.avatar]);

  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, cameraActive]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } } 
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Camera access denied or unavailable");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        updateSetting('profile.avatarType', 'photo');
        updateSetting('profile.avatarImage', dataUrl);
        updateUser({ avatar: dataUrl });
        addToast("Photo captured successfully!", "success");
      }
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast("File too large (max 5MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        updateSetting('profile.avatarType', 'photo');
        updateSetting('profile.avatarImage', dataUrl);
        updateUser({ avatar: dataUrl });
        addToast("Image uploaded successfully!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCustomInitials(val);
    if (val.length > 0) {
      updateSetting('profile.avatarType', 'letter');
      updateUser({ avatar: val });
    }
  };

  const handleSaveProfile = () => {
    updateSetting('profile.displayName', displayName);
    updateSetting('profile.username', username);
    updateSetting('profile.email', email);
    updateUser({ name: displayName });
    addToast("Profile updated!", "success");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <div className="flex flex-col gap-6 max-h-[80vh] overflow-y-auto px-1 scrollbar-thin">
        {/* Avatar Visualizer */}
        <div className="flex flex-col items-center gap-4">
          <AvatarWithCosmetic avatarUrl={state.user.avatar} cosmeticId={state.user.activeCosmetic} size="xl" />

          {cameraActive ? (
            <div className="w-full bg-surface border border-border-strong rounded-2xl p-3 flex flex-col items-center gap-3">
              <div className="w-full aspect-square max-w-[200px] overflow-hidden rounded-xl border border-dashed border-primary/40 relative bg-bg-base">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover transform -scale-x-100" 
                />
              </div>
              {cameraError ? (
                <p className="text-xs text-error text-center font-semibold">{cameraError}</p>
              ) : (
                <p className="text-[11px] text-text-muted text-center">Position your face in the camera view</p>
              )}
              <div className="flex w-full gap-2">
                <button 
                  type="button" 
                  onClick={capturePhoto} 
                  className="flex-1 py-2 bg-primary text-white hover:opacity-90 rounded-[10px] text-xs font-bold transition-all"
                >
                  Capture Photo
                </button>
                <button 
                  type="button" 
                  onClick={stopCamera} 
                  className="px-3 py-2 bg-surface-2 border border-border-base text-text-primary hover:bg-surface-3 rounded-[10px] text-xs font-bold transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={startCamera}
                  className="py-3 bg-surface-2 hover:bg-surface-3 border border-border-base rounded-[14px] text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Camera size={15} className="text-primary" />
                  Take Picture
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 bg-surface-2 hover:bg-surface-3 border border-border-base rounded-[14px] text-xs font-bold text-text-primary flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload size={15} className="text-blue-500" />
                  Upload Image
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </div>

              <div className="bg-surface p-3 rounded-[20px] border border-border-base flex items-center gap-3">
                <div className="p-2 bg-surface-2 rounded-lg text-primary">
                  <Type size={16} />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Custom Initials</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={customInitials}
                    onChange={handleInitialsChange}
                    className="w-full bg-transparent border-none text-[15px] font-bold text-text-primary outline-none uppercase placeholder:text-text-muted"
                    placeholder="E.g. JDO"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-2 px-1">Select a Mascot</label>
                <div className="grid grid-cols-4 gap-2">
                  {avatarsList.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        updateSetting('profile.avatarType', 'mascot');
                        updateSetting('profile.avatarImage', null);
                        updateUser({ avatar: av });
                        addToast(`Mascot changed to ${av}!`, "success");
                      }}
                      className={`h-12 rounded-[12px] text-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                        state.user.avatar === av 
                          ? 'bg-primary/20 border border-primary' 
                          : 'bg-surface-2 border border-border-base hover:bg-surface-3'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-4 mt-2 border-t border-border-base pt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Display Name</label>
            <div className="flex items-center bg-surface-2 border border-border-base rounded-[12px] px-3 py-2">
              <User size={16} className="text-text-muted mr-2" />
              <input
                type="text"
                value={displayName}
                maxLength={30}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-transparent border-none w-full text-[14px] font-semibold text-text-primary outline-none"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Username</label>
            <div className="flex items-center bg-surface-2 border border-border-base rounded-[12px] px-3 py-2">
              <span className="text-text-muted font-bold mr-1">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="bg-transparent border-none w-full text-[14px] font-semibold text-text-primary outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
            <div className="flex items-center bg-surface-2 border border-border-base rounded-[12px] px-3 py-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none w-full text-[14px] font-semibold text-text-primary outline-none"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSaveProfile}
          className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-[12px] text-[15px] font-bold transition-all shadow-md mt-2"
        >
          Save Profile
        </button>
      </div>
    </Modal>
  );
}
