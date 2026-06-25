import React from 'react';
import Modal from './ui/Modal';

interface RepeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDays: string[];
  onChange: (days: string[]) => void;
}

const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RepeatModal({ isOpen, onClose, selectedDays, onChange }: RepeatModalProps) {
  const isEveryday = selectedDays.length === allDays.length;

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const toggleEveryday = () => {
    if (isEveryday) {
      onChange([]);
    } else {
      onChange(allDays);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Repeat">
      <div className="flex flex-col gap-2">
        <button
          onClick={toggleEveryday}
          className={`h-[52px] w-full rounded-[12px] border px-4 text-[16px] flex items-center justify-between transition-colors ${
            isEveryday
              ? 'bg-[#6FBBF7] border-[#6FBBF7] text-[#0A0A0A] font-bold'
              : 'bg-[#1A1A1A] border-[rgba(255,255,255,0.08)] text-[#F0F0F0]'
          }`}
        >
          Everyday
          {isEveryday && <div className="w-4 h-4 rounded-full bg-[#0A0A0A]" />}
        </button>
        {allDays.map(day => (
          <button
            key={day}
            onClick={() => toggleDay(day)}
            className={`h-[52px] w-full rounded-[12px] border px-4 text-[16px] flex items-center justify-between transition-colors ${
              selectedDays.includes(day)
                ? 'bg-[#6FBBF7] border-[#6FBBF7] text-[#0A0A0A] font-bold'
                : 'bg-[#1A1A1A] border-[rgba(255,255,255,0.08)] text-[#F0F0F0]'
            }`}
          >
            Every {day}
            {selectedDays.includes(day) && <div className="w-4 h-4 rounded-full bg-[#0A0A0A]" />}
          </button>
        ))}
      </div>
    </Modal>
  );
}
