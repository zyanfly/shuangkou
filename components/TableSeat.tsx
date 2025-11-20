
import React, { useRef, useState, useEffect } from 'react';
import { Player } from '../types';
import { Trophy, Edit2 } from 'lucide-react';

interface TableSeatProps {
  player: Player;
  rank?: number;
  onClick: () => void;
  onSwap: (sourceId: string, targetId: string) => void;
  onUpdateName: (id: string, name: string) => void;
  isNext: boolean;
  disabled: boolean;
}

export const TableSeat: React.FC<TableSeatProps> = ({ 
  player, 
  rank, 
  onClick, 
  onSwap, 
  onUpdateName,
  isNext, 
  disabled 
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  // State for drag visual feedback
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Refs for logic (avoid re-renders during high-frequency events)
  const startPos = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef<number>(0);
  const isMouseDown = useRef(false);

  // Position styles
  const posStyles: Record<string, string> = {
    'Up': 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/4',
    'Down': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4',
    'Left': 'left-2 top-1/2 -translate-y-1/2', 
    'Right': 'right-2 top-1/2 -translate-y-1/2',
  };

  const getRankColor = (r: number) => {
    switch(r) {
      case 1: return 'bg-yellow-500 border-yellow-300 text-yellow-900';
      case 2: return 'bg-gray-300 border-gray-100 text-gray-800';
      case 3: return 'bg-amber-700 border-amber-500 text-amber-100';
      default: return 'bg-slate-600 border-slate-500 text-white';
    }
  };

  const isTeam1 = player.teamId === 1;

  // Handle name click to edit
  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt("请输入玩家名字:", player.name);
    if (newName) {
      onUpdateName(player.id, newName);
    }
  };

  // --- Shared Logic for Drag End ---
  const handleDragEnd = (clientX: number, clientY: number) => {
    const endTime = Date.now();
    const duration = endTime - dragStartTime.current;
    const totalDeltaX = clientX - startPos.current.x;
    const totalDeltaY = clientY - startPos.current.y;
    const movedSignificant = Math.abs(totalDeltaX) > 5 || Math.abs(totalDeltaY) > 5;

    // Reset State
    const wasDragging = isDragging || movedSignificant; 
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });

    // Case 1: It was a quick tap/click (No major movement, short duration)
    if (!movedSignificant && duration < 300) {
      onClick();
      return;
    }

    // Case 2: It was a Drag -> Swap
    if (wasDragging) {
       // Temporarily hide self so we can detect element below
      if (elementRef.current) elementRef.current.style.visibility = 'hidden';
      
      const targetEl = document.elementFromPoint(clientX, clientY);
      
      if (elementRef.current) elementRef.current.style.visibility = 'visible';

      // Look for a parent with data-seat-id
      const seatContainer = targetEl?.closest('[data-seat-id]');
      if (seatContainer) {
        const targetId = seatContainer.getAttribute('data-seat-id');
        if (targetId && targetId !== player.id) {
          onSwap(player.id, targetId);
        }
      }
    }
  };

  // --- Touch Handlers ---

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    dragStartTime.current = Date.now();
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;

    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setIsDragging(true);
      setDragOffset({ x: deltaX, y: deltaY });
      if (e.cancelable) e.preventDefault(); 
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.changedTouches[0];
    handleDragEnd(touch.clientX, touch.clientY);
  };

  // --- Mouse Handlers ---

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    // Don't trigger if clicking the edit button specifically
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    e.preventDefault(); // Prevent text selection
    startPos.current = { x: e.clientX, y: e.clientY };
    dragStartTime.current = Date.now();
    isMouseDown.current = true;
    setDragOffset({ x: 0, y: 0 });

    // Attach global listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (!isMouseDown.current) return;
    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    // Start visual drag if moved enough
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setIsDragging(true);
      setDragOffset({ x: deltaX, y: deltaY });
    }
  };

  const handleGlobalMouseUp = (e: MouseEvent) => {
    if (!isMouseDown.current) return;
    isMouseDown.current = false;
    
    // Cleanup
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);

    handleDragEnd(e.clientX, e.clientY);
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div 
      ref={elementRef}
      data-seat-id={player.id}
      className={`absolute ${posStyles[player.position]} flex flex-col items-center z-10 touch-none select-none cursor-pointer`}
      style={{
        transform: isDragging 
          ? `translate(calc(${posStyles[player.position].includes('-translate-x-1/2') ? '-50%' : '0px'} + ${dragOffset.x}px), calc(${posStyles[player.position].includes('-translate-y-1/2') ? '-50%' : '0px'} + ${dragOffset.y}px))` 
          : undefined,
        zIndex: isDragging ? 50 : 10,
        transition: isDragging ? 'none' : 'transform 0.2s',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Avatar Circle */}
      <div className={`
        relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 shadow-xl flex flex-col items-center justify-center
        transition-colors duration-300 pointer-events-none
        ${isTeam1 ? 'bg-blue-900/90 border-blue-500' : 'bg-red-900/90 border-red-500'}
        ${isNext && !rank && !disabled ? 'ring-4 ring-green-400 ring-opacity-70 animate-pulse' : ''}
        ${rank ? 'grayscale-0' : 'grayscale-[0.3]'}
        ${isDragging ? 'scale-110 opacity-80 shadow-2xl ring-4 ring-white' : ''}
      `}>
        {/* Color-based differentiation only */}
        <div className="text-white/20 font-bold text-3xl select-none">
           {isTeam1 ? 'A' : 'B'}
        </div>

        {/* Rank Badge */}
        {rank && (
          <div className={`
            absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg animate-pop-in
            ${getRankColor(rank)}
          `}>
            {rank === 1 ? <Trophy size={14} /> : <span className="font-black text-sm">{rank}</span>}
          </div>
        )}
      </div>

      {/* Name Label & Score */}
      <div className="mt-2 flex flex-col items-center gap-1">
         {/* Clickable Name */}
         <div 
           data-no-drag="true"
           onMouseDown={(e) => e.stopPropagation()} 
           onClick={handleNameClick}
           className="bg-gray-800/80 px-2 py-0.5 rounded text-xs text-gray-300 border border-gray-600 flex items-center gap-1 cursor-pointer hover:bg-gray-700 hover:text-white transition-colors z-20"
         >
           <span className="max-w-[60px] truncate text-center pointer-events-none">{player.name}</span>
           <Edit2 size={10} className="opacity-50 pointer-events-none" />
         </div>
         
         {/* Score */}
         <div className="bg-black/60 px-2 py-0.5 rounded text-xs text-white font-mono backdrop-blur-sm shadow-md pointer-events-none">
           {player.totalScore > 0 ? '+' : ''}{player.totalScore}
         </div>
      </div>
    </div>
  );
};
