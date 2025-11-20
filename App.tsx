
import React, { useState } from 'react';
import { INITIAL_PLAYERS, Player, RoundRecord, StakeConfig } from './types';
import { calculateRound } from './utils/gameLogic';
import { GameTable } from './components/GameTable';
import { SettingsPanel } from './components/SettingsPanel';
import { Card } from './components/Card';
import { HistoryList } from './components/HistoryList';
import { RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);
  
  // Configurable stakes state
  const [stakes, setStakes] = useState<StakeConfig>({ double: 3, second: 2, single: 1 });
  
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Handle clicking a player on the table (Game Logic)
  const handlePlayerClick = (playerId: string) => {
    if (finishOrder.includes(playerId)) return;
    
    const newOrder = [...finishOrder, playerId];
    setFinishOrder(newOrder);
    
    // Optional: Auto-complete if 3 players selected (4th is obvious)
    if (newOrder.length === 3) {
      const remaining = players.find(p => !newOrder.includes(p.id));
      if (remaining) {
        // Small delay for visual effect
        setTimeout(() => {
            setFinishOrder(prev => [...prev, remaining.id]);
        }, 300);
      }
    }
  };

  // Handle swapping positions (Drag Logic)
  const handleSwapPlayers = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    setPlayers(prev => {
      const p1 = prev.find(p => p.id === sourceId);
      const p2 = prev.find(p => p.id === targetId);
      
      if (!p1 || !p2) return prev;

      // Capture the properties of the SEATS (Position + Team)
      // We will assign these seat properties to the players moving into them.
      const pos1 = p1.position;
      const team1 = p1.teamId;
      
      const pos2 = p2.position;
      const team2 = p2.teamId;

      return prev.map(p => {
        // Player 1 moves to Seat 2: Takes Seat 2's Position AND Team
        if (p.id === sourceId) return { ...p, position: pos2, teamId: team2 };
        // Player 2 moves to Seat 1: Takes Seat 1's Position AND Team
        if (p.id === targetId) return { ...p, position: pos1, teamId: team1 };
        return p;
      });
    });
  };

  // Handle name editing
  const handleUpdateName = (playerId: string, newName: string) => {
    if (!newName.trim()) return;
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, name: newName.trim() } : p
    ));
  };

  // Reset the current round selection
  const handleResetRound = () => {
    setFinishOrder([]);
  };

  // Confirm and record the round
  const handleConfirmRound = () => {
    const result = calculateRound(finishOrder, players, stakes);
    if (!result) return;

    const newRound: RoundRecord = {
      id: Date.now(),
      timestamp: Date.now(),
      ...result
    };

    // Update history (prepend)
    setHistory(prev => [newRound, ...prev]);

    // Update total scores
    setPlayers(prevPlayers => prevPlayers.map(p => ({
      ...p,
      totalScore: p.totalScore + (result.scores[p.id] || 0)
    })));

    // Reset table for next round
    setFinishOrder([]);
  };

  // Delete a round from history and revert scores
  const handleDeleteRound = (roundId: number) => {
    const roundToDelete = history.find(r => r.id === roundId);
    if (!roundToDelete) return;

    // Revert scores
    setPlayers(prevPlayers => prevPlayers.map(p => ({
      ...p,
      totalScore: p.totalScore - (roundToDelete.scores[p.id] || 0)
    })));

    // Remove from history
    setHistory(prev => prev.filter(r => r.id !== roundId));
  };

  // Reset entire game
  const handleFullReset = () => {
    if (window.confirm("确定要重置所有分数和记录吗？")) {
      setPlayers(INITIAL_PLAYERS);
      setHistory([]);
      setFinishOrder([]);
    }
  };

  const canConfirm = finishOrder.length >= 3;
  const currentResult = canConfirm ? calculateRound(finishOrder, players, stakes) : null;

  // Helper to get the current win amount for display
  const getCurrentWinAmount = () => {
    if (!currentResult) return 0;
    // Any positive score in the result scores is the win amount
    return Object.values(currentResult.scores).find(s => s > 0) || 0;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 pb-10 font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4 sticky top-0 z-30 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-400 tracking-wider flex items-center gap-2">
            <span>♠️</span> 双扣记账本
          </h1>
          <button 
            onClick={handleFullReset}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw size={12} /> 重置总账
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        
        {/* Settings */}
        <SettingsPanel stakes={stakes} setStakes={setStakes} />

        {/* Game Board */}
        <Card className="mb-6 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="text-center mb-2">
            <p className="text-gray-400 text-sm">
              {finishOrder.length === 0 ? '点击头像标记顺序，按住拖拽交换座位' : 
               finishOrder.length < 3 ? `已选 ${finishOrder.length} 人...` : 
               '请确认本局结果'}
            </p>
          </div>
          
          <GameTable 
            players={players} 
            finishOrder={finishOrder}
            onPlayerClick={handlePlayerClick}
            onSwapPlayers={handleSwapPlayers}
            onUpdateName={handleUpdateName}
            onResetRound={handleResetRound}
            onConfirmRound={handleConfirmRound}
            canConfirm={canConfirm}
          />
          
          {/* Current Round Prediction/Preview */}
          {currentResult && (
             <div className="bg-black/30 rounded-lg p-3 mt-4 animate-pulse border border-white/10">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">本局结果:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-yellow-400 text-lg">
                      {currentResult.resultType}
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-mono">
                      赢 {getCurrentWinAmount()}
                    </span>
                  </div>
               </div>
             </div>
          )}
        </Card>

        {/* History Section */}
        <Card 
          title="对局记录" 
          action={
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className="text-xs text-blue-400 hover:underline"
            >
              {showHistory ? '收起' : '展开'}
            </button>
          }
        >
          {showHistory ? (
            <HistoryList 
              history={history} 
              players={players} 
              onDeleteRound={handleDeleteRound}
            />
          ) : (
            <div 
              className="text-center text-gray-500 text-sm py-2 cursor-pointer hover:text-gray-300 transition-colors"
              onClick={() => setShowHistory(true)}
            >
              点击查看 {history.length} 条记录
            </div>
          )}
        </Card>

      </main>
    </div>
  );
};

export default App;
