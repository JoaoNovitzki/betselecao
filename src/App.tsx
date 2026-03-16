import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Wallet, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  History,
  Trash2,
  Plus
} from 'lucide-react';
import { PLAYERS } from './constants';
import { Player, Bet, Position } from './types';

export default function App() {
  const [balance, setBalance] = useState(1000);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [betAmount, setBetAmount] = useState<string>('10');
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const positions: Position[] = ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campista', 'Atacante'];

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.find(p => p.id === player.id);
      if (isSelected) {
        return prev.filter(p => p.id !== player.id);
      } else {
        return [...prev, player];
      }
    });
  };

  const totalOdd = useMemo(() => {
    if (selectedPlayers.length === 0) return 0;
    // In betting, parlays multiply odds. 
    // However, for a "fun" app where odds are low (1.10), 
    // multiplying keeps them low. Summing might be what the user meant by "somada".
    // I will use multiplication as it's the standard, but display it clearly.
    return selectedPlayers.reduce((acc, p) => acc * p.odd, 1);
  }, [selectedPlayers]);

  const handlePlaceBet = () => {
    if (selectedPlayers.length === 0) return;
    const amount = parseFloat(betAmount);
    
    if (isNaN(amount) || amount <= 0) {
      showNotification('Insira um valor válido', 'error');
      return;
    }

    if (amount > balance) {
      showNotification('Saldo insuficiente', 'error');
      return;
    }

    const newBet: Bet = {
      playerId: 'group-' + Date.now(),
      playerName: selectedPlayers.length === 1 
        ? selectedPlayers[0].name 
        : `${selectedPlayers.length} Jogadores (Combo)`,
      odd: totalOdd,
      amount: amount
    };

    setBalance(prev => prev - amount);
    setActiveBets(prev => [newBet, ...prev]);
    setSelectedPlayers([]);
    setBetAmount('10');
    showNotification(`Aposta múltipla realizada!`, 'success');
  };

  const groupedPlayers = useMemo(() => {
    return positions.reduce((acc, pos) => {
      acc[pos] = PLAYERS.filter(p => p.position === pos);
      return acc;
    }, {} as Record<Position, Player[]>);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight">SELEÇÃO BET</h1>
              <p className="text-[10px] text-emerald-500 font-mono uppercase tracking-widest">Copa do Mundo 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-white/5 rounded-full transition-colors relative"
            >
              <History className="w-5 h-5 text-zinc-400" />
              {activeBets.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
            <div className="flex items-center gap-3 bg-zinc-900 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="font-mono font-medium text-emerald-500">
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-48">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 md:p-12">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter leading-none">
                MONTE SUA CONVOCAÇÃO
              </h2>
              <p className="text-emerald-100/80 text-lg mb-8">
                Selecione vários jogadores para criar uma aposta múltipla. 
                Quanto mais nomes, maior o retorno potencial!
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">Odds Acumulativas</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <Trophy className="w-full h-full transform translate-x-1/4 -translate-y-1/4 rotate-12" />
            </div>
          </div>
        </section>

        {/* Betting Grid */}
        <div className="space-y-12">
          {positions.map((pos) => (
            <section key={pos} id={pos.toLowerCase()}>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-xl font-bold tracking-tight uppercase">{pos}s</h3>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedPlayers[pos].map((player) => {
                  const isSelected = selectedPlayers.some(p => p.id === player.id);
                  return (
                    <motion.button
                      key={player.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => togglePlayerSelection(player)}
                      className={`group relative p-4 rounded-2xl transition-all text-left overflow-hidden border ${
                        isSelected 
                          ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                          : 'bg-zinc-900/50 hover:bg-zinc-800 border-white/5 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {player.position}
                        </span>
                        <div className={`px-2 py-1 rounded-lg border ${isSelected ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                          <span className="font-mono font-bold text-sm">@{player.odd.toFixed(2)}</span>
                        </div>
                      </div>
                      <h4 className={`font-bold transition-colors truncate pr-8 ${isSelected ? 'text-white' : 'text-zinc-100 group-hover:text-white'}`}>
                        {player.name}
                      </h4>
                      <div className="mt-4 flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {isSelected ? 'Selecionado' : 'Selecionar'}
                        </span>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Plus className="w-4 h-4 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* Betting Slip (Bottom Bar) */}
      <AnimatePresence>
        {selectedPlayers.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-emerald-500/30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Selected Players List (Horizontal Scroll) */}
                <div className="flex-1 w-full overflow-x-auto pb-2 scrollbar-hide">
                  <div className="flex gap-3">
                    {selectedPlayers.map(player => (
                      <div 
                        key={player.id}
                        className="flex-shrink-0 bg-zinc-800 border border-white/10 px-3 py-2 rounded-xl flex items-center gap-3"
                      >
                        <div className="text-left">
                          <p className="text-xs font-bold whitespace-nowrap">{player.name}</p>
                          <p className="text-[10px] text-emerald-500 font-mono">@{player.odd.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => togglePlayerSelection(player)}
                          className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bet Controls */}
                <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
                  <div className="flex items-center gap-8">
                    <div className="text-center lg:text-left">
                      <p className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">Odd Total</p>
                      <p className="text-2xl font-bold text-emerald-500 font-mono">@{totalOdd.toFixed(2)}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10 hidden sm:block" />
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-mono tracking-widest">Valor</label>
                      <div className="flex items-center bg-zinc-800 border border-white/10 rounded-xl px-3 py-1">
                        <span className="text-zinc-500 text-xs mr-2">R$</span>
                        <input 
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="bg-transparent w-20 font-mono font-bold focus:outline-none text-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="hidden sm:block text-right">
                      <p className="text-[10px] text-zinc-500 uppercase font-mono">Retorno</p>
                      <p className="text-lg font-bold text-emerald-500 font-mono">
                        R$ {(parseFloat(betAmount || '0') * totalOdd).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button 
                      onClick={handlePlaceBet}
                      className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      APOSTAR EM {selectedPlayers.length} {selectedPlayers.length === 1 ? 'NOME' : 'NOMES'}
                    </button>
                    <button 
                      onClick={() => setSelectedPlayers([])}
                      className="p-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xl transition-colors"
                      title="Limpar Seleção"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-zinc-900 border-l border-white/10 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xl font-bold">Minhas Apostas</h3>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeBets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <AlertCircle className="w-12 h-12" />
                    <p>Nenhuma aposta ativa no momento.</p>
                  </div>
                ) : (
                  activeBets.map((bet, i) => (
                    <div key={i} className="bg-zinc-800/50 border border-white/5 p-4 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold">{bet.playerName}</p>
                          <p className="text-[10px] text-zinc-500 font-mono uppercase">Odd Total: {bet.odd.toFixed(2)}</p>
                        </div>
                        <span className="text-[10px] bg-zinc-700 px-2 py-1 rounded-full text-zinc-300 font-mono">PENDENTE</span>
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-white/5">
                        <div>
                          <p className="text-[10px] text-zinc-500 uppercase">Aposta</p>
                          <p className="font-mono text-sm">R$ {bet.amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 uppercase">Retorno</p>
                          <p className="font-mono text-emerald-500 font-bold">R$ {(bet.amount * bet.odd).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' 
                ? 'bg-emerald-500 text-black border-emerald-400' 
                : 'bg-red-500 text-white border-red-400'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
