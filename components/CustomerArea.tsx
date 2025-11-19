import React from 'react';
import { Customer, FillingType } from '../types';
import { FILLING_COLORS, FILLING_NAMES } from '../constants';
import { User, Frown, Meh, Smile } from 'lucide-react';

interface CustomerAreaProps {
  customers: Customer[];
  onServe: (customerId: string) => void;
  holdingArea: { type: FillingType; count: number }[];
  t: (key: string) => string;
}

const CustomerArea: React.FC<CustomerAreaProps> = ({ customers, onServe, holdingArea, t }) => {
  
  const getMoodIcon = (percentage: number) => {
    if (percentage > 60) return <Smile className="w-5 h-5 text-green-600" />;
    if (percentage > 30) return <Meh className="w-5 h-5 text-yellow-600" />;
    return <Frown className="w-5 h-5 text-red-600" />;
  };

  // Check if we can serve this customer
  const canServe = (order: FillingType) => {
    const stock = holdingArea.find(h => h.type === order);
    return stock && stock.count > 0;
  };

  return (
    <div className="flex flex-row-reverse gap-4 overflow-x-auto pb-4 min-h-[160px] items-end px-4">
      {customers.map((customer) => {
        const isServeable = canServe(customer.order);
        const patiencePercent = (customer.patience / customer.maxPatience) * 100;

        return (
          <div 
            key={customer.id} 
            className={`
                flex-shrink-0 w-32 bg-white border-2 border-gray-200 rounded-xl p-3 shadow-md relative transition-all duration-300
                ${isServeable ? 'ring-4 ring-green-400 cursor-pointer hover:scale-105' : ''}
                ${patiencePercent < 20 ? 'animate-shake bg-red-50' : ''}
            `}
            onClick={() => isServeable && onServe(customer.id)}
          >
             {/* Speech Bubble with Order */}
             <div className="absolute -top-6 left-0 w-full flex justify-center">
                <div className="bg-white border-2 border-gray-800 rounded-lg px-3 py-1 shadow-sm flex items-center gap-2 text-sm font-bold z-10">
                    <div className={`w-3 h-3 rounded-full ${FILLING_COLORS[customer.order]}`} />
                    {t(FILLING_NAMES[customer.order])}
                </div>
             </div>

             <div className="flex flex-col items-center gap-2 mt-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border border-gray-300">
                   <User className={`w-8 h-8 text-gray-500`} />
                </div>
                
                {/* Patience Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-200 ${patiencePercent > 50 ? 'bg-green-500' : patiencePercent > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${patiencePercent}%` }}
                    />
                </div>
                
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    {getMoodIcon(patiencePercent)}
                    {(customer.patience / 10).toFixed(0)}s
                </div>
             </div>
             
             {isServeable && (
                 <div className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center pointer-events-none">
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow">{t('serve')}</span>
                 </div>
             )}
          </div>
        );
      })}
      
      {customers.length === 0 && (
          <div className="w-full text-center text-gray-400 py-8 italic">
              {t('waiting_customers')}
          </div>
      )}
    </div>
  );
};

export default CustomerArea;
