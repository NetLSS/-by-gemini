import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Bun, BunState, Customer, FillingType, GameState, DailyEvent, Upgrade, Language 
} from './types';
import { 
    INITIAL_UPGRADES, GAME_TICK_MS, COOK_SPEED_BASE, 
    PATIENCE_DECAY_BASE, SPAWN_RATE_BASE, PRICES, DAY_LENGTH_SECONDS,
    FILLING_COLORS, FILLING_NAMES, TRANSLATIONS 
} from './constants';
import Mold from './components/Mold';
import CustomerArea from './components/CustomerArea';
import HoldingArea from './components/HoldingArea';
import { generateDailyEvent, generateDayReview } from './services/gemini';
import { Play, Pause, RefreshCw, Coins, TrendingUp, Clock, ShoppingBag, ArrowUpCircle, Globe } from 'lucide-react';

// Helper for unique IDs
const uid = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  // --- State ---
  const [language, setLanguage] = useState<Language>('ko');
  const [gameState, setGameState] = useState<GameState>({
    money: 1000,
    day: 1,
    reputation: 10,
    inventory: {
       [FillingType.None]: 0,
       [FillingType.RedBean]: 0,
       [FillingType.Custard]: 0,
       [FillingType.Nutella]: 0
    },
    holdingArea: []
  });

  const [buns, setBuns] = useState<Bun[]>([
    { id: 1, state: BunState.Empty, filling: FillingType.None, cookProgress: 0, isFlipped: false },
    { id: 2, state: BunState.Empty, filling: FillingType.None, cookProgress: 0, isFlipped: false },
    { id: 3, state: BunState.Empty, filling: FillingType.None, cookProgress: 0, isFlipped: false },
  ]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedFilling, setSelectedFilling] = useState<FillingType>(FillingType.RedBean);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);
  const [dailyEvent, setDailyEvent] = useState<DailyEvent | null>(null);
  const [isDayActive, setIsDayActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(DAY_LENGTH_SECONDS);
  const [dayEnded, setDayEnded] = useState(false);
  const [dayStats, setDayStats] = useState({ served: 0, burnt: 0, earned: 0, review: '' });
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);

  // --- Refs for Loop ---
  const lastTickRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  const isDayActiveRef = useRef(isDayActive); // To access in loop

  useEffect(() => {
      isDayActiveRef.current = isDayActive;
  }, [isDayActive]);

  // --- Translations Helper ---
  const t = useCallback((key: string, params: Record<string, any> = {}) => {
    // @ts-ignore - access unknown key
    let text = TRANSLATIONS[language][key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  }, [language]);

  // --- Game Logic ---

  const startDay = async () => {
    setIsGeminiLoading(true);
    const event = await generateDailyEvent(gameState.day, gameState.reputation, language);
    setDailyEvent(event || { 
        title: t('default_event_title'), 
        description: t('default_event_desc'), 
        effect: "NORMAL" 
    });
    setIsGeminiLoading(false);
    
    setTimeRemaining(DAY_LENGTH_SECONDS);
    setDayStats({ served: 0, burnt: 0, earned: 0, review: '' });
    setCustomers([]);
    setIsDayActive(true);
    setDayEnded(false);
    // Reset Buns
    setBuns(b => b.map(bun => ({ ...bun, state: BunState.Empty, cookProgress: 0, filling: FillingType.None })));
  };

  const endDay = useCallback(async () => {
    setIsDayActive(false);
    setDayEnded(true);
    
    setIsGeminiLoading(true);
    const review = await generateDayReview(gameState.day, dayStats.served, dayStats.burnt, dayStats.earned, language);
    setDayStats(prev => ({ ...prev, review: review || t('default_review') }));
    setIsGeminiLoading(false);
  }, [gameState.day, dayStats.served, dayStats.burnt, dayStats.earned, language, t]);

  const advanceDay = () => {
      setGameState(prev => ({ ...prev, day: prev.day + 1 }));
      setDayEnded(false);
      setDailyEvent(null);
  };

  const handleInteractMold = (id: number) => {
    setBuns(prevBuns => prevBuns.map(bun => {
      if (bun.id !== id) return bun;

      // Logic State Machine
      switch (bun.state) {
        case BunState.Empty:
          return { ...bun, state: BunState.Dough };
        
        case BunState.Dough:
          return { ...bun, state: BunState.Filled, filling: selectedFilling };
        
        case BunState.Filled:
          return { ...bun, state: BunState.Cooking, cookProgress: 0 };

        case BunState.Cooking:
            return bun; 

        case BunState.Cooked:
          // Harvest
          addToInventory(bun.filling);
          return { ...bun, state: BunState.Empty, filling: FillingType.None, cookProgress: 0 };

        case BunState.Burnt:
          // Trash
          setDayStats(s => ({ ...s, burnt: s.burnt + 1 }));
          return { ...bun, state: BunState.Empty, filling: FillingType.None, cookProgress: 0 };
          
        default:
          return bun;
      }
    }));
  };

  const addToInventory = (type: FillingType) => {
      setGameState(prev => {
          // Check if we already have a stack
          const existing = prev.holdingArea.find(i => i.type === type);
          let newHolding;
          if (existing) {
              newHolding = prev.holdingArea.map(i => i.type === type ? { ...i, count: i.count + 1 } : i);
          } else {
              newHolding = [...prev.holdingArea, { type, count: 1 }];
          }
          return { ...prev, holdingArea: newHolding };
      });
  };

  const removeFromInventory = (type: FillingType) => {
      setGameState(prev => {
          const existing = prev.holdingArea.find(i => i.type === type);
          if (!existing || existing.count <= 0) return prev;

          const newHolding = prev.holdingArea.map(i => i.type === type ? { ...i, count: i.count - 1 } : i)
                                             .filter(i => i.count > 0);
          return { ...prev, holdingArea: newHolding };
      });
  };

  const handleServeCustomer = (customerId: string) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      // Check inventory
      const inStock = gameState.holdingArea.find(h => h.type === customer.order);
      if (inStock && inStock.count > 0) {
          removeFromInventory(customer.order);
          
          // Rewards
          const price = PRICES[customer.order];
          const tip = dailyEvent?.effect === 'RICH' ? Math.floor(price * 0.5) : 0;
          const total = price + tip;

          setGameState(prev => ({ ...prev, money: prev.money + total, reputation: prev.reputation + 1 }));
          setDayStats(prev => ({ ...prev, served: prev.served + 1, earned: prev.earned + total }));
          setCustomers(prev => prev.filter(c => c.id !== customerId));
      }
  };

  const buyUpgrade = (upgradeId: string) => {
      const upgrade = upgrades.find(u => u.id === upgradeId);
      if (!upgrade || gameState.money < upgrade.cost || upgrade.level >= upgrade.maxLevel) return;

      setGameState(prev => ({ ...prev, money: prev.money - upgrade.cost }));
      setUpgrades(prev => prev.map(u => u.id === upgradeId ? { ...u, level: u.level + 1, cost: Math.floor(u.cost * 1.5) } : u));

      // Apply Effect Immediately
      if (upgradeId === 'mold_count') {
          setBuns(prev => [
              ...prev, 
              { id: prev.length + 1, state: BunState.Empty, filling: FillingType.None, cookProgress: 0, isFlipped: false }
          ]);
      }
  };

  // --- Game Loop ---

  const gameTick = (timestamp: number) => {
      if (!lastTickRef.current) lastTickRef.current = timestamp;
      const delta = timestamp - lastTickRef.current;

      if (isDayActiveRef.current && delta > GAME_TICK_MS) {
          lastTickRef.current = timestamp;

          // 1. Cooking Progress
          const speedMult = 1 + (upgrades.find(u => u.id === 'cook_speed')?.level || 1) * 0.2;
          setBuns(prev => prev.map(bun => {
              if (bun.state === BunState.Cooking) {
                  const newProgress = bun.cookProgress + (COOK_SPEED_BASE * speedMult);
                  if (newProgress >= 100) return { ...bun, state: BunState.Cooked, cookProgress: 0 }; // Auto finish cooking phase
                  return { ...bun, cookProgress: newProgress };
              }
              if (bun.state === BunState.Cooked) {
                  // Burn logic
                  const burnProgress = bun.cookProgress + 0.2; 
                  if (burnProgress > 100) return { ...bun, state: BunState.Burnt };
                  return { ...bun, cookProgress: burnProgress };
              }
              return bun;
          }));

          // 2. Customer Spawning
          spawnTimerRef.current += 1;
          let spawnThreshold = SPAWN_RATE_BASE;
          if (dailyEvent?.effect === 'RUSH') spawnThreshold /= 2;
          if (dailyEvent?.effect === 'SLOW') spawnThreshold *= 2;

          const maxCustomers = 3 + Math.floor(gameState.reputation / 10);

          if (spawnTimerRef.current > spawnThreshold && customers.length < maxCustomers) {
              spawnTimerRef.current = 0;
              // Random Order
              const types = [FillingType.RedBean, FillingType.Custard];
              if (gameState.day > 3) types.push(FillingType.Nutella);
              
              const randomType = types[Math.floor(Math.random() * types.length)];
              
              setCustomers(prev => [...prev, {
                  id: uid(),
                  order: randomType,
                  patience: 100,
                  maxPatience: 100,
                  avatarId: Math.floor(Math.random() * 5)
              }]);
          }

          // 3. Patience Decay
          const patienceDecay = PATIENCE_DECAY_BASE / (1 + (upgrades.find(u => u.id === 'marketing')?.level || 1) * 0.2);
          setCustomers(prev => prev.map(c => ({ ...c, patience: c.patience - patienceDecay }))
                                   .filter(c => {
                                       if (c.patience <= 0) {
                                           setGameState(s => ({ ...s, reputation: Math.max(0, s.reputation - 2) })); // Penalty
                                           return false; // Leave
                                       }
                                       return true;
                                   }));
      }

      requestRef.current = requestAnimationFrame(gameTick);
  };

  useEffect(() => {
      requestRef.current = requestAnimationFrame(gameTick);
      return () => cancelAnimationFrame(requestRef.current!);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customers.length, upgrades, dailyEvent]);

  // Time limit
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (isDayActive) {
          interval = setInterval(() => {
              setTimeRemaining(prev => {
                  if (prev <= 1) {
                      endDay();
                      return 0;
                  }
                  return prev - 1;
              });
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [isDayActive, endDay]);


  // --- Render ---

  return (
    <div className="min-h-screen max-w-md mx-auto bg-amber-50 flex flex-col shadow-2xl relative overflow-hidden font-sans text-gray-800">
      
      {/* Header Stats */}
      <header className="bg-amber-500 text-white p-3 flex justify-between items-center shadow-md z-10">
        <div className="flex flex-col">
             <span className="text-xs font-bold opacity-80">{t('day_label')} {gameState.day}</span>
             <span className="font-black text-xl">{timeRemaining}s</span>
        </div>
        <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                 <div className="flex items-center gap-1">
                    <Coins size={16} className="text-yellow-200" />
                    <span className="font-bold text-lg">{gameState.money.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center gap-1 text-xs opacity-90">
                    <TrendingUp size={12} />
                    <span>{t('reputation')}: {gameState.reputation}</span>
                 </div>
             </div>
             <button 
              onClick={() => setLanguage(l => l === 'en' ? 'ko' : 'en')}
              className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
             >
               <Globe size={18} className="text-white" />
               <span className="sr-only">Switch Language</span>
             </button>
        </div>
      </header>

      {/* Daily Event Banner */}
      {isDayActive && dailyEvent && (
          <div className="bg-blue-600 text-white px-4 py-2 text-sm flex items-center justify-between shadow-md animate-slide-down">
              <div>
                  <span className="font-bold mr-2">📢 {dailyEvent.title}:</span>
                  <span className="opacity-90">{dailyEvent.description}</span>
              </div>
              {dailyEvent.effect !== 'NORMAL' && (
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded uppercase whitespace-nowrap">
                      {t(`event_${dailyEvent.effect.toLowerCase()}`)}
                  </span>
              )}
          </div>
      )}

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col relative">
          
          {/* Customer Area */}
          <div className="pt-4 pb-2 bg-sky-100 border-b-4 border-sky-200 relative">
              <div className="absolute top-2 left-2 text-sky-800 font-bold text-xs opacity-50 uppercase tracking-widest">{t('queue')}</div>
              <CustomerArea 
                customers={customers} 
                onServe={handleServeCustomer} 
                holdingArea={gameState.holdingArea}
                t={t}
              />
          </div>

          {/* Cooking Station */}
          <div className="flex-1 p-4 bg-orange-50 relative flex flex-col gap-4">
               <div className="grid grid-cols-3 gap-3">
                  {buns.map(bun => (
                      <Mold 
                        key={bun.id} 
                        bun={bun} 
                        onInteract={handleInteractMold} 
                        selectedFilling={selectedFilling}
                        t={t}
                      />
                  ))}
               </div>

               {/* Filling Controls */}
               <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                   <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">{t('select_filling')}</span>
                   <div className="flex gap-2">
                       {[FillingType.RedBean, FillingType.Custard, FillingType.Nutella].map(type => (
                           <button
                             key={type}
                             onClick={() => setSelectedFilling(type)}
                             className={`
                                flex-1 py-2 rounded-lg text-sm font-bold transition-all flex flex-col items-center gap-1
                                ${selectedFilling === type ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                             `}
                           >
                               <div className={`w-4 h-4 rounded-full ${FILLING_COLORS[type]}`} />
                               {t(FILLING_NAMES[type])}
                           </button>
                       ))}
                   </div>
               </div>
          </div>

          {/* Inventory / Holding Area */}
          <HoldingArea inventory={gameState.holdingArea} t={t} />
          
      </main>

      {/* Overlays */}
      
      {/* Start Day / Lobby Screen */}
      {!isDayActive && !dayEnded && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-pop-in">
                  <div className="text-center mb-6">
                      <h1 className="text-3xl font-black text-amber-600 mb-2">{t('start_day_title', { day: gameState.day })}</h1>
                      <p className="text-gray-500">{t('ready_msg')}</p>
                  </div>

                  {/* Shop / Upgrades */}
                  <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                      {upgrades.map(u => (
                          <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                              <div>
                                  <div className="font-bold text-sm">{t(u.name)}</div>
                                  <div className="text-xs text-gray-500">{t(u.description)}</div>
                                  <div className="text-xs font-bold text-amber-600 mt-1">Lvl {u.level} / {u.maxLevel}</div>
                              </div>
                              <button 
                                disabled={gameState.money < u.cost || u.level >= u.maxLevel}
                                onClick={() => buyUpgrade(u.id)}
                                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 hover:bg-green-600 whitespace-nowrap"
                              >
                                  {u.level >= u.maxLevel ? t('max_level') : (
                                    <>
                                        <ArrowUpCircle size={12} />
                                        {u.cost}
                                    </>
                                  )}
                              </button>
                          </div>
                      ))}
                  </div>

                  <button 
                    onClick={startDay}
                    disabled={isGeminiLoading}
                    className="w-full py-4 bg-amber-500 text-white text-xl font-bold rounded-xl hover:bg-amber-600 shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
                  >
                      {isGeminiLoading ? <RefreshCw className="animate-spin" /> : <Play fill="currentColor" />}
                      {t('open_shop')}
                  </button>
              </div>
          </div>
      )}

      {/* End Day Report */}
      {dayEnded && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center animate-pop-in relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 to-amber-500" />
                  
                  <h2 className="text-2xl font-black text-gray-800 mb-6">{t('day_complete', { day: gameState.day })}</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 p-3 rounded-xl">
                          <div className="text-green-800 text-xs font-bold uppercase">{t('stat_served')}</div>
                          <div className="text-2xl font-black text-green-600">{dayStats.served}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-xl">
                          <div className="text-red-800 text-xs font-bold uppercase">{t('stat_burnt')}</div>
                          <div className="text-2xl font-black text-red-600">{dayStats.burnt}</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-xl col-span-2">
                          <div className="text-yellow-800 text-xs font-bold uppercase">{t('stat_earnings')}</div>
                          <div className="text-3xl font-black text-yellow-600">₩ {dayStats.earned.toLocaleString()}</div>
                      </div>
                  </div>

                  {/* AI Review */}
                  <div className="bg-gray-100 p-4 rounded-xl mb-6 text-left relative">
                      <div className="absolute -top-3 -left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow rotate-[-5deg]">
                          {t('customer_review')}
                      </div>
                      {isGeminiLoading ? (
                          <div className="flex items-center justify-center py-2 text-gray-400 gap-2">
                              <RefreshCw className="animate-spin w-4 h-4" />
                              <span className="text-xs">{t('reading_reviews')}</span>
                          </div>
                      ) : (
                          <p className="text-sm text-gray-600 italic">"{dayStats.review}"</p>
                      )}
                  </div>

                  <button 
                    onClick={advanceDay}
                    className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-lg flex items-center justify-center gap-2"
                  >
                      <ShoppingBag size={18} />
                      {t('next_day')}
                  </button>
              </div>
          </div>
      )}

    </div>
  );
}
