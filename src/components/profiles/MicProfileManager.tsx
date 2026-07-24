import React, { useState } from 'react';
import { Mic, Plus, Check, Sliders, Volume2, ShieldCheck } from 'lucide-react';
import { MicProfile } from '../../db/SessionDatabase';

interface MicProfileManagerProps {
  profiles: MicProfile[];
  selectedProfileId: number | null;
  onSelectProfile: (id: number) => void;
  onSaveProfile: (profile: MicProfile) => void;
}

export const MicProfileManager: React.FC<MicProfileManagerProps> = ({
  profiles,
  selectedProfileId,
  onSelectProfile,
  onSaveProfile,
}) => {
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [newProfileType, setNewProfileType] = useState<string>('Clip-On Piezo');
  const [gain, setGain] = useState<number>(3.0);
  const [hpHz, setHpHz] = useState<number>(2500);
  const [lpHz, setLpHz] = useState<number>(6500);

  const handleCreateProfile = () => {
    if (!newProfileName) return;
    onSaveProfile({
      name: newProfileName,
      type: newProfileType,
      gainBoost: gain,
      highPassHz: hpHz,
      lowPassHz: lpHz,
      noiseFloorThreshold: 0.1,
      eqGain1: 3,
      eqGain2: 5,
      eqGain3: 2,
    });
    setNewProfileName('');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-pro-border pb-4">
        <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
          <Mic className="w-6 h-6 text-pro-cyan" /> MICROPHONE CALIBRATION PROFILES
        </h2>
        <p className="text-xs text-pro-muted mt-1">
          Store input gain, acoustic bandpass filters, and noise floor offsets per physical sensor
        </p>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const isSelected = selectedProfileId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => p.id && onSelectProfile(p.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-card-shadow flex flex-col justify-between ${
                isSelected
                  ? 'bg-pro-card border-pro-cyan shadow-cyan-glow'
                  : 'bg-pro-card border-pro-border/70 hover:border-pro-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-white">{p.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-pro-cyan" />}
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pro-purple/20 border border-pro-purple/40 text-pro-purple inline-block mb-3">
                  {p.type}
                </span>

                <div className="space-y-1.5 text-xs font-mono text-pro-muted">
                  <div className="flex justify-between">
                    <span>GAIN BOOST:</span>
                    <span className="text-pro-green font-bold">{p.gainBoost.toFixed(1)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HIGH-PASS:</span>
                    <span className="text-pro-cyan font-bold">{p.highPassHz} Hz</span>
                  </div>
                  <div className="flex justify-between">
                    <span>LOW-PASS:</span>
                    <span className="text-pro-purple font-bold">{p.lowPassHz} Hz</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-pro-border/50 text-[10px] text-pro-dim text-center font-bold">
                {isSelected ? 'ACTIVE CALIBRATION PROFILE' : 'CLICK TO ACTIVATE'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Profile Form */}
      <div className="bg-pro-card border border-pro-border rounded-2xl p-5 shadow-card-shadow space-y-4">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-pro-cyan" /> CREATE CUSTOM SENSOR PROFILE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] text-pro-muted font-bold block mb-1">PROFILE NAME</label>
            <input
              type="text"
              placeholder="e.g. Focusrite Scarlett Solo"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              className="w-full bg-[#0d0f14] border border-pro-border rounded-xl px-3 py-2 text-xs text-white placeholder-pro-dim focus:outline-none focus:border-pro-cyan"
            />
          </div>

          <div>
            <label className="text-[10px] text-pro-muted font-bold block mb-1">SENSOR TYPE</label>
            <select
              value={newProfileType}
              onChange={(e) => setNewProfileType(e.target.value)}
              className="w-full bg-[#0d0f14] text-white text-xs font-bold font-mono px-3 py-2 rounded-xl border border-pro-border focus:outline-none"
            >
              <option value="Internal">Internal Laptop/Desktop Mic</option>
              <option value="Clip-On Piezo">Clip-On Acoustic Piezo Sensor</option>
              <option value="Shotgun">Studio Condenser / Shotgun</option>
              <option value="USB Interface">USB Audio Interface</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCreateProfile}
              className="w-full py-2.5 rounded-xl bg-pro-cyan text-black font-extrabold text-xs tracking-wider shadow-cyan-glow hover:bg-cyan-300 transition-all"
            >
              SAVE SENSOR PROFILE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
