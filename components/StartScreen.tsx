
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (theme: string) => void;
  isLoading: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, isLoading }) => {
  const [theme, setTheme] = useState<string>('A lone knight discovering a forgotten, glowing ruin in a dark forest.');
  
  const popularThemes = [
    'Cyberpunk detective in a rain-slicked neon city',
    'A mage apprentice accidentally opens a portal to a chaotic realm',
    'Stranded astronaut on a mysterious, jungle-like alien planet',
    'Vampire navigating the political intrigue of a modern-day secret society',
  ];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim()) {
      onStart(theme.trim());
    }
  };
  
  const selectTheme = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-fade-in-down">
        <h1 className="text-6xl font-cinzel font-bold text-teal-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">Gemini Adventure</h1>
        <p className="text-gray-400 mt-2 text-lg">Your story, imagined by AI.</p>
      </div>

      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700 animate-fade-in-up">
        <form onSubmit={handleStart}>
          <label htmlFor="theme" className="block text-xl font-cinzel mb-3 text-gray-300">
            Describe your adventure's starting point...
          </label>
          <textarea
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full h-24 p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-shadow duration-300 text-gray-200 placeholder-gray-500"
            placeholder="e.g., A lone knight discovering a forgotten, glowing ruin..."
            rows={3}
          />
          <p className="text-sm text-gray-500 mt-2 mb-6">...or choose a theme below.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {popularThemes.map((pTheme) => (
               <button 
                 key={pTheme} 
                 type="button" 
                 onClick={() => selectTheme(pTheme)}
                 className={`p-3 text-left text-sm rounded-md transition-all duration-200 ${theme === pTheme ? 'bg-teal-600 ring-2 ring-teal-300' : 'bg-gray-700 hover:bg-gray-600'}`}>
                 {pTheme}
               </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !theme.trim()}
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold font-cinzel text-xl py-3 px-4 rounded-md transition-all duration-300 shadow-lg hover:shadow-teal-500/30 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Begin Your Journey'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StartScreen;
