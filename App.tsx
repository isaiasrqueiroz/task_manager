import React, { useState } from 'react';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard';
import { useTranslation } from './i18n';
import { useTheme } from './contexts/ThemeContext';

type View = 'tasks' | 'dashboard';

// Icons for the theme switcher
const THEME_ICONS = {
    sun: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>,
    moon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>,
    desktop: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="14" x="2" y="3" rx="2"></rect><line x1="8" x2="16" y1="21" y2="21"></line><line x1="12" x2="12" y1="17" y2="21"></line></svg>,
};


function App() {
  const [view, setView] = useState<View>('tasks');
  const { t, setLanguage, language } = useTranslation();
  const { theme, setTheme } = useTheme();

  const NavButton = ({ currentView, targetView, children }: { currentView: View, targetView: View, children: React.ReactNode }) => (
    <button
      onClick={() => setView(targetView)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        currentView === targetView
          ? 'bg-primary text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-primary-light hover:text-primary dark:hover:text-primary'
      }`}
    >
      {children}
    </button>
  );

  const LangButton = ({ lang }: { lang: 'pt-br' | 'en' }) => (
    <button
      onClick={() => setLanguage(lang)}
      className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
        language === lang ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-gray-200 dark:hover:bg-slate-500'
      }`}
    >
      {lang === 'pt-br' ? 'PT' : 'EN'}
    </button>
  );

  const ThemeButton = ({ targetTheme, icon }: { targetTheme: 'light' | 'dark' | 'system', icon: React.ReactNode }) => (
    <button
      onClick={() => setTheme(targetTheme)}
      className={`p-2 rounded-md transition-colors ${
        theme === targetTheme ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-slate-700'
      }`}
      aria-label={`Switch to ${targetTheme} theme`}
    >
        {icon}
    </button>
  );

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white dark:bg-dark-card shadow-sm dark:border-b dark:border-dark-border sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('nav.title')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <NavButton currentView={view} targetView="tasks">{t('nav.tasks')}</NavButton>
              <NavButton currentView={view} targetView="dashboard">{t('nav.dashboard')}</NavButton>
            </div>
            <div className="flex items-center space-x-2 border-l border-gray-200 dark:border-dark-border pl-4">
              <LangButton lang="pt-br" />
              <LangButton lang="en" />
            </div>
            <div className="flex items-center space-x-1 border-l border-gray-200 dark:border-dark-border pl-4">
                <ThemeButton targetTheme='light' icon={THEME_ICONS.sun} />
                <ThemeButton targetTheme='dark' icon={THEME_ICONS.moon} />
                <ThemeButton targetTheme='system' icon={THEME_ICONS.desktop} />
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'tasks' ? <TaskList /> : <Dashboard />}
      </main>
    </div>
  );
}

export default App;