
import React from 'react';
import { RoundRecord, Player } from '../types';
import { Trash2 } from 'lucide-react';

interface HistoryListProps {
  history: RoundRecord[];
  players: Player[];
  onDeleteRound: (id: number) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, players, onDeleteRound }) => {
  if (history.length === 0) {
    return <div className="text-center text-gray-500 py-4">暂无对局记录</div>;
  }

  return (
    <div className="space-y-3">
      {history.map((round, idx) => {
        const roundNumber = history.length - idx; 
        const p1Score = round.scores['p1'] || 0;
        
        // Logic assumes p1/p2 are Team Blue (1), p3/p4 are Team Red (2) based on initial setup
        // But checking any player from team 1 is safer
        const team1Player = players.find(p => p.teamId === 1);
        const team1Score = team1Player ? round.scores[team1Player.id] : 0;
        const isTeam1Win = team1Score > 0;
        
        const winAmount = Math.abs(Object.values(round.scores).find(s => s !== 0) || 0);

        return (
          <div key={round.id} className="bg-gray-700/50 rounded-lg p-3 text-sm border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-gray-600 text-white px-1.5 rounded text-xs">#{roundNumber}</span>
                
                {/* Winner Visual Indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                  isTeam1Win 
                    ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' 
                    : 'bg-red-900/40 border-red-500/50 text-red-300'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isTeam1Win ? 'bg-blue-500' : 'bg-red-500'}`} />
                  <span className="font-bold">{round.resultType}</span>
                </div>
                
                <span className="text-xs font-mono text-gray-400">
                  赢 {winAmount}
                </span>
              </div>
              
              <button 
                onClick={() => onDeleteRound(round.id)}
                className="text-gray-500 hover:text-red-400 transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
            
            {/* Player Scores Grid */}
            <div className="grid grid-cols-4 gap-1 text-center mt-2">
              {players.map(p => {
                 const score = round.scores[p.id];
                 const isPTeam1 = p.teamId === 1;
                 return (
                   <div key={p.id} className="flex flex-col items-center">
                     <div className={`w-full h-1 rounded-full mb-1 ${isPTeam1 ? 'bg-blue-600/50' : 'bg-red-600/50'}`} />
                     <span className="text-[10px] text-gray-400 truncate max-w-full px-1">{p.name}</span>
                     <span className={`font-mono font-bold text-xs ${score > 0 ? 'text-green-400' : score < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                       {score > 0 ? '+' : ''}{score}
                     </span>
                   </div>
                 )
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
