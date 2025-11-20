import React from 'react';
import { Settings } from 'lucide-react';
import { StakeConfig } from '../types';

interface SettingsPanelProps {
  stakes: StakeConfig;
  setStakes: (val: StakeConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ stakes, setStakes }) => {
  
  const updateStake = (key: keyof StakeConfig, delta: number) => {
    const newVal = Math.max(1, stakes[key] + delta);
    setStakes({ ...stakes, [key]: newVal });
  };

  const handleInputChange = (key: keyof StakeConfig, val: string) => {
    const numVal = parseInt(val);
    if (!isNaN(numVal) && numVal >= 0) {
       setStakes({ ...stakes, [key]: numVal });
    }
  };

  const SettingItem = ({ label, sKey, color }: { label: string, sKey: keyof StakeConfig, color: string }) => (
    <div className="flex flex-col bg-gray-900/60 rounded-lg p-2 border border-gray-700/50">
      <span className={`text-xs mb-1 font-medium ${color}`}>{label}</span>
      <div className="flex items-center justify-between">
        <button 
          onClick={() => updateStake(sKey, -1)}
          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
        >
          -
        </button>
        <input 
          type="number" 
          value={stakes[sKey]}
          onChange={(e) => handleInputChange(sKey, e.target.value)}
          className="w-12 h-7 text-center bg-transparent text-white font-bold border-b border-gray-600 focus:border-blue-500 outline-none appearance-none"
        />
        <button 
          onClick={() => updateStake(sKey, 1)}
          className="w-7 h-7 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800 p-3 rounded-xl mb-4 border border-gray-700 shadow-lg">
      <div className="flex items-center gap-2 text-gray-300 mb-3 pb-2 border-b border-gray-700/50">
        <Settings size={16} />
        <span className="text-sm font-bold">规则设定 (金额)</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SettingItem label="双扣" sKey="double" color="text-yellow-400" />
        <SettingItem label="次扣" sKey="second" color="text-blue-300" />
        <SettingItem label="单扣" sKey="single" color="text-gray-400" />
      </div>
    </div>
  );
};