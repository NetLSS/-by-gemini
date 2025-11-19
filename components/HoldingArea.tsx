import React from 'react';
import { FillingType } from '../types';
import { FILLING_COLORS, FILLING_NAMES } from '../constants';

interface HoldingAreaProps {
  inventory: { type: FillingType; count: number }[];
  t: (key: string) => string;
}

const HoldingArea: React.FC<HoldingAreaProps> = ({ inventory, t }) => {
  return (
    <div className="bg-amber-50 border-t-4 border-amber-200 p-4 flex gap-4 justify-center shadow-inner">
      {inventory.map((item) => (
        <div key={item.type} className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-16 h-16 bg-white rounded-xl border-2 border-amber-300 shadow-sm flex items-center justify-center">
               <div className="flex flex-col items-center">
                  {/* Fish Icon */}
                  <div className="relative">
                    <div className={`w-10 h-6 rounded-full bg-amber-400 border border-amber-600 flex items-center justify-center`}>
                        <div className={`w-3 h-3 rounded-full ${FILLING_COLORS[item.type]} opacity-70`}></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 mt-1">{t(FILLING_NAMES[item.type])}</span>
               </div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow border border-white">
              {item.count}
            </div>
          </div>
        </div>
      ))}
      {inventory.length === 0 && <span className="text-gray-400 text-sm italic py-4">{t('cook_to_stock')}</span>}
    </div>
  );
};

export default HoldingArea;
