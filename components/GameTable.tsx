
import React from 'react';
import { Player } from '../types';
import { TableSeat } from './TableSeat';
import { RotateCcw, CheckCheck } from 'lucide-react';

interface GameTableProps {
  players: Player[];
  finishOrder: string[]; // Array of player IDs
  onPlayerClick: (playerId: string) => void;
  onSwapPlayers: (sourceId: string, targetId: string) => void;
  onUpdateName: (playerId: string, name: string) => void;
  onResetRound: () => void;
  onConfirmRound: () => void;
  canConfirm: boolean;
}

export const GameTable: React.FC<GameTableProps> = ({ 
  players, 
  finishOrder, 
  onPlayerClick, 
  onSwapPlayers,
  onUpdateName,
  onResetRound,
  onConfirmRound,
  canConfirm
}) => {
  
  const getRank = (id: string) => {
    const index = finishOrder.indexOf(id);
    return index !== -1 ? index + 1 : undefined;
  };

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto my-6 select-none">
      {/* Table Surface */}
      <div className="absolute inset-4 rounded-[40px] bg-felt border-[8px] border-wood shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center">
        
        {/* Center Info / Branding */}
        <div className="text-center opacity-30 pointer-events-none">
          <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-2">
            <span className="text-2xl font-serif text-white/40">双扣</span>
          </div>
        </div>

        {/* Action Buttons Overlay (Center) */}
        <div className="absolute z-20 flex flex-col gap-3">
           {finishOrder.length > 0 && !canConfirm && (
             <button 
                onClick={onResetRound}
                className="bg-gray-800/80 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md shadow-lg flex items-center gap-2 transition-all"
             >
               <RotateCcw size={14} /> 重选
             </button>
           )}
           
           {canConfirm && (
             <button 
                onClick={onConfirmRound}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-xl animate-bounce flex items-center gap-2 transition-all"
             >
               <CheckCheck size={20} /> 结算
             </button>
           )}
        </div>

        {/* Click Hint */}
        {finishOrder.length === 0 && (
           <div className="absolute bottom-16 text-white/50 text-xs animate-pulse">
             点击赢家 (第1名)
           </div>
        )}
      </div>

      {/* Seats */}
      {players.map(p => (
        <TableSeat 
          key={p.id} 
          player={p} 
          rank={getRank(p.id)}
          onClick={() => onPlayerClick(p.id)}
          onSwap={onSwapPlayers}
          onUpdateName={onUpdateName}
          isNext={finishOrder.length < 4}
          disabled={finishOrder.includes(p.id)}
        />
      ))}
    </div>
  );
};