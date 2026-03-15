import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const assets = [
  { symbol: 'BTC/USD', price: '64,231.50', change: '+2.45%', up: true },
  { symbol: 'ETH/USD', price: '3,452.12', change: '-1.12%', up: false },
  { symbol: 'XRP/USD', price: '0.6214', change: '+0.85%', up: true },
  { symbol: 'SOL/USD', price: '142.50', change: '+5.21%', up: true },
  { symbol: 'ADA/USD', price: '0.4512', change: '-0.32%', up: false },
  { symbol: 'DOT/USD', price: '7.12', change: '+1.15%', up: true },
  { symbol: 'LINK/USD', price: '18.45', change: '+3.20%', up: true },
  { symbol: 'MATIC/USD', price: '0.7214', change: '-2.14%', up: false },
];

export const Ticker = () => {
  return (
    <div className="w-full bg-[#111214] border-b border-slate-800/50 overflow-hidden h-10 flex items-center">
      <motion.div 
        className="flex whitespace-nowrap gap-8 px-4"
        animate={{ x: [0, -1000] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {[...assets, ...assets].map((asset, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300">{asset.symbol}</span>
            <span className="text-xs font-mono text-slate-100">{asset.price}</span>
            <div className={`flex items-center gap-1 text-[10px] font-bold ${asset.up ? 'text-emerald-500' : 'text-rose-500'}`}>
              {asset.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {asset.change}
            </div>
            <div className="w-[1px] h-3 bg-slate-800 ml-4"></div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
