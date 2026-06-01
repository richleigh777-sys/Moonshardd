import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface ModernDatePickerProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
  calculatedYear?: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function ModernDatePicker({ date, onChange, className = '', calculatedYear }: ModernDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const parseLocal = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date();
  };

  const validDate = date ? parseLocal(date) : new Date();

  const [currentMonth, setCurrentMonth] = useState(validDate.getMonth());
  const [currentYear, setCurrentYear] = useState(calculatedYear || validDate.getFullYear());
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  useEffect(() => {
    if (calculatedYear && !date) {
      setCurrentYear(calculatedYear);
    }
  }, [calculatedYear, date]);

  useEffect(() => {
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [date]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMonthDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handleDayClick = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    // Format to YYYY-MM-DD local time
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  let selectedDay = null;
  let selectedMonth = null;
  let selectedYear = null;

  if (date) {
    const parts = date.split('-');
    if (parts.length === 3) {
      selectedYear = Number(parts[0]);
      selectedMonth = Number(parts[1]) - 1;
      selectedDay = Number(parts[2]);
    }
  }

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface-alt/70 border border-border-subtle rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-surface-main transition-all flex items-center justify-between text-left"
      >
        <span className={date ? 'text-text-primary' : 'text-text-muted'}>
          {date ? formatDateDisplay(date) : 'Date of Birth'}
        </span>
        <CalendarIcon size={18} className="text-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-surface-main border border-border-subtle rounded-2xl shadow-xl w-72 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} type="button" className="p-1 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors">
              <ChevronLeft size={20} />
            </button>
            
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
                className="font-bold text-text-primary flex items-center gap-1 hover:bg-surface-alt px-2 py-1 rounded-lg transition-colors"
              >
                {MONTHS[currentMonth]} {currentYear}
                <ChevronDown size={14} className="text-text-muted" />
              </button>
              
              {showMonthDropdown && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface-main border border-border-subtle rounded-xl shadow-lg w-40 p-2 grid grid-cols-2 gap-1 z-50">
                  {MONTHS.map((month, idx) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(idx);
                        setShowMonthDropdown(false);
                      }}
                      className={`text-xs p-2 rounded-lg text-left ${currentMonth === idx ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'hover:bg-surface-alt text-text-secondary'}`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={nextMonth} type="button" className="p-1 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-[10px] font-bold text-text-muted uppercase">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-8" />
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day && selectedMonth === currentMonth && selectedYear === currentYear;
              const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isSelected 
                      ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20' 
                      : isToday 
                        ? 'border border-indigo-500/30 text-indigo-400' 
                        : 'hover:bg-surface-alt text-text-primary'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
