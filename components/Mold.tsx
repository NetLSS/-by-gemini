import React from 'react';
import { Bun, BunState, FillingType } from '../types';
import { FILLING_COLORS } from '../constants';
import { Flame, Trash2, CheckCircle, ChefHat } from 'lucide-react';

interface MoldProps {
  bun: Bun;
  onInteract: (id: number) => void;
  selectedFilling: FillingType;
  t: (key: string) => string;
}

const Mold: React.FC<MoldProps> = ({ bun, onInteract, selectedFilling, t }) => {
  
  const getVisual = () => {
    switch (bun.state) {
      case BunState.Empty:
        return (
          <div className="w-full h-full flex items-center justify-center text-gray-400 hover:text-gray-600">
            <div className="text-center">
              <div className="text-xs whitespace-pre-wrap">{t('click_to_pour')}</div>
            </div>
          </div>
        );
      case BunState.Dough:
        return (
          <div className="w-3/4 h-3/4 bg-amber-100 rounded-full opacity-80 flex flex-col items-center justify-center animate-pulse">
             <div className="w-16 h-8 bg-amber-200 rounded-full border-2 border-amber-300 flex items-center justify-center">
                <span className="text-[10px] text-amber-800 opacity-50 text-center leading-tight px-1">{t('add_filling')}</span>
             </div>
          </div>
        );
      case BunState.Filled:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="w-20 h-10 bg-amber-200 rounded-full border-2 border-amber-300 overflow-hidden relative">
               {/* Filling Blob */}
               <div className={`absolute inset-0 m-auto w-8 h-8 rounded-full ${FILLING_COLORS[bun.filling]} opacity-90`} />
            </div>
            <div className="absolute top-0 right-0 text-xs font-bold text-amber-800 bg-white/50 px-1 rounded">{t('raw')}</div>
          </div>
        );
      case BunState.Cooking:
        return (
          <div className="relative w-full h-full flex items-center justify-center">
             <div className={`w-24 h-12 rounded-full border-4 border-amber-600 bg-amber-300 transition-colors duration-300`} 
                  style={{ filter: `brightness(${0.8 + (bun.cookProgress/200)})` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-500 animate-bounce" />
                </div>
             </div>
             <div className="absolute bottom-1 w-full px-4">
               <div className="h-1.5 w-full bg-gray-300 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-red-500 transition-all duration-200" 
                    style={{ width: `${bun.cookProgress}%` }}
                 />
               </div>
             </div>
          </div>
        );
      case BunState.Cooked:
        return (
           <div className="relative w-full h-full flex items-center justify-center animate-bounce-slow">
             <div className="w-24 h-12 rounded-full border-4 border-amber-700 bg-amber-500 shadow-lg flex items-center justify-center relative">
                 {/* Fish detail lines */}
                 <div className="absolute left-3 top-3 w-1 h-1 bg-amber-900 rounded-full"></div> {/* Eye */}
                 <div className="absolute right-4 top-2 w-4 h-4 border-r-2 border-b-2 border-amber-800 rounded-br-full transform rotate-45"></div> {/* Tail detail */}
                 <CheckCircle className="text-white w-6 h-6 drop-shadow-md" />
             </div>
             <span className="absolute -top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse whitespace-nowrap">
               {t('perfect')}
             </span>
           </div>
        );
      case BunState.Burnt:
        return (
           <div className="relative w-full h-full flex items-center justify-center">
             <div className="w-24 h-12 rounded-full border-4 border-gray-800 bg-gray-700 shadow-inner flex items-center justify-center">
                <Trash2 className="text-gray-400 w-6 h-6" />
             </div>
             <span className="absolute top-2 text-xs font-bold text-red-600 bg-white/80 px-1 rounded whitespace-nowrap">{t('burnt')}</span>
           </div>
        );
    }
  };

  return (
    <button
      onClick={() => onInteract(bun.id)}
      className={`
        relative h-32 w-full rounded-xl border-4 transition-all duration-100 select-none
        ${bun.state === BunState.Empty ? 'border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100' : 'border-gray-800 bg-gray-800/10'}
        active:scale-95
      `}
    >
      {/* Mold Background Iron Texture */}
      {bun.state !== BunState.Empty && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg opacity-10 pattern-dots pointer-events-none" />
      )}
      
      {getVisual()}
    </button>
  );
};

export default Mold;
