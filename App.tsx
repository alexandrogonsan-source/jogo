
import React, { useState, useCallback } from 'react';
import { GameState, FullScene, Choice } from './types';
import { generateSceneAndImage } from './services/gameService';
import LoadingIndicator from './components/LoadingIndicator';
import StartScreen from './components/StartScreen';

const SceneDisplay: React.FC<{ scene: FullScene }> = ({ scene }) => (
  <div className="relative w-full h-1/2 md:h-2/3 bg-black flex items-center justify-center">
    <div 
      style={{ backgroundImage: `url(${scene.imageUrl})` }}
      className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 animate-fade-in"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
    </div>
  </div>
);

const ChoiceButtons: React.FC<{ choices: Choice[], onSelect: (choice: Choice) => void, disabled: boolean }> = ({ choices, onSelect, disabled }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 md:p-6 w-full max-w-6xl mx-auto">
    {choices.map((choice, index) => (
      <button
        key={index}
        onClick={() => onSelect(choice)}
        disabled={disabled}
        className="bg-gray-800 text-gray-300 border border-gray-700 rounded-lg p-4 text-left hover:bg-teal-800/50 hover:border-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800 animate-fade-in-up"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <p>{choice.text}</p>
      </button>
    ))}
  </div>
);


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentScene, setCurrentScene] = useState<FullScene | null>(null);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [theme, setTheme] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleStartGame = useCallback(async (startTheme: string) => {
    setTheme(startTheme);
    setGameState('loading');
    setStoryHistory([]);
    setError(null);
    try {
      const newScene = await generateSceneAndImage(startTheme, []);
      setStoryHistory([`Adventure Theme: ${startTheme}`, `Scene 1: ${newScene.description}`]);
      setCurrentScene(newScene);
      setGameState('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setGameState('error');
    }
  }, []);

  const handleSelectChoice = useCallback(async (choice: Choice) => {
    setGameState('loading');
    setError(null);
    try {
      const newScene = await generateSceneAndImage(theme, storyHistory, choice.text);
      const newHistory = [...storyHistory, `Player chose: "${choice.text}"`, `Scene ${Math.floor(storyHistory.length / 2) + 1}: ${newScene.description}`];
      setStoryHistory(newHistory);
      setCurrentScene(newScene);
      setGameState('playing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setGameState('error');
    }
  }, [theme, storyHistory]);
  
  const restartGame = () => {
    setGameState('start');
    setCurrentScene(null);
    setStoryHistory([]);
    setError(null);
    setTheme('');
  };

  const renderContent = () => {
    if (gameState === 'start') {
        return <StartScreen onStart={handleStartGame} isLoading={false} />;
    }
    
    if (gameState === 'error') {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4">
          <h2 className="text-3xl font-cinzel text-red-500 mb-4">An Error Occurred</h2>
          <p className="text-gray-400 mb-6 text-center">{error}</p>
          <button
            onClick={restartGame}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold font-cinzel py-2 px-6 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        {gameState === 'loading' && currentScene && (
          <LoadingIndicator message={storyHistory.length === 2 ? "Crafting your world..." : "The story unfolds..."} />
        )}
        {currentScene && <SceneDisplay scene={currentScene} />}
        
        <div className="flex-grow flex flex-col w-full max-w-6xl mx-auto overflow-hidden">
            <div className="p-4 md:p-6 flex-shrink-0">
                <h2 className="text-2xl md:text-3xl font-cinzel text-teal-300 mb-4 animate-fade-in">The Story So Far...</h2>
                <div className="h-32 md:h-40 overflow-y-auto bg-black/30 p-4 rounded-lg border border-gray-700/50 custom-scrollbar animate-fade-in">
                    {storyHistory.map((entry, index) => (
                        <p key={index} className={`mb-3 text-gray-400 ${index === storyHistory.length -1 ? 'text-gray-200' : ''}`}>
                            {entry}
                        </p>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0">
                {currentScene && <ChoiceButtons choices={currentScene.choices} onSelect={handleSelectChoice} disabled={gameState === 'loading'} />}
            </div>
            
             <div className="p-4 text-center">
                <button
                    onClick={restartGame}
                    className="bg-red-800 hover:bg-red-700 text-white font-bold font-cinzel text-sm py-2 px-4 rounded-md transition-colors disabled:opacity-50"
                    disabled={gameState === 'loading'}
                >
                    Start New Adventure
                </button>
            </div>
        </div>
      </div>
    );
  };
  
  return (
    <main className="bg-gray-900">
        {gameState === 'loading' && !currentScene && <LoadingIndicator message="Crafting your world..." />}
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in { animation: fade-in 1s ease-in-out forwards; }

          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
          
          @keyframes fade-in-down {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4A5568; /* gray-600 */
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #2D3748; /* gray-700 */
          }
        `}</style>
        {renderContent()}
    </main>
  );
};

export default App;
