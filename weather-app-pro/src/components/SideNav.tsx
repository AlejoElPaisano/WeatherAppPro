'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, BarChart2, LayoutGrid, MapPin, 
  CalendarDays, TrendingUp, Newspaper, 
  ArrowUp, RotateCcw 
} from 'lucide-react';

const navItems = [
  { id: 'actual', label: 'Actual', icon: Sun },
  { id: 'hourly', label: 'Cada hora', icon: BarChart2 },
  { id: 'details', label: 'Detalles', icon: LayoutGrid },
  { id: 'monthly', label: 'Mensual', icon: CalendarDays },
  { id: 'trends', label: 'Tendencias', icon: TrendingUp },
  { id: 'news', label: 'Noticias', icon: Newspaper },
];

export default function SideNav() {
  const [activeId, setActiveId] = useState('actual');

  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      const visibleSections = entries.filter(e => e.isIntersecting);
      if (visibleSections.length > 0) {
        // Sort by intersection ratio or just pick the first
        visibleSections.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        setActiveId(visibleSections[0].target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    });

    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const reload = () => window.location.reload();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-[#1e2d3d]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-6 h-[calc(100vh-3rem)]">
        <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-amber-400 text-slate-900 font-semibold shadow-lg shadow-amber-400/20' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-slate-900' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        
        <div className="pt-4 mt-4 border-t border-white/10 flex justify-around">
          <button onClick={scrollToTop} className="p-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="Volver arriba">
            <ArrowUp className="w-5 h-5" />
          </button>
          <button onClick={reload} className="p-3 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors" title="Actualizar">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1e2d3d]/90 backdrop-blur-xl border-t border-white/10 px-2 py-3 pb-safe">
        <div className="flex items-center justify-around overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`p-3 rounded-xl flex-shrink-0 transition-all duration-300 ${
                  isActive 
                    ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20' 
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
                title={item.label}
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
