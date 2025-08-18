
import React from 'react';
import { PlusIcon } from './icons/PlusIcon.tsx';
import { CogIcon } from './icons/CogIcon.tsx';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon.tsx';

interface HeaderProps {
  onAddTask: () => void;
  isAddTaskDisabled: boolean;
  currentView: 'main' | 'settings';
  onNavigateToSettings: () => void;
  onNavigateToMain: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddTask, isAddTaskDisabled, currentView, onNavigateToSettings, onNavigateToMain }) => {
  return (
    <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-6 md:px-8 flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Accenture Task Manager
        </h1>
        <div className="flex items-center gap-4">
          {currentView === 'main' ? (
            <>
              <button
                onClick={onAddTask}
                disabled={isAddTaskDisabled}
                className="bg-white text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 px-4 py-2 rounded-md font-semibold shadow-sm transition-all transform hover:scale-105 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                title={isAddTaskDisabled ? "Adicione ao menos uma categoria e um status para criar tarefas." : "Adicionar Nova Tarefa"}
              >
                <PlusIcon />
                <span>Adicionar Nova Tarefa</span>
              </button>
              <button onClick={onNavigateToSettings} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors" title="Configurações">
                <CogIcon />
              </button>
            </>
          ) : (
            <button
                onClick={onNavigateToMain}
                className="bg-white text-indigo-600 hover:bg-indigo-50 flex items-center gap-2 px-4 py-2 rounded-md font-semibold shadow-sm transition-all transform hover:scale-105"
                title="Voltar para a lista de tarefas"
              >
                <ArrowLeftIcon />
                <span>Voltar</span>
              </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;