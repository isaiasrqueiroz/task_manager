import { TaskCategory, TaskStatus } from './types';
import type { ReactNode } from 'react';

export const CATEGORY_OPTIONS = Object.values(TaskCategory);
export const STATUS_OPTIONS = Object.values(TaskStatus);

export const CATEGORY_COLORS: { [key in TaskCategory]: string } = {
  [TaskCategory.Ciclo]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  [TaskCategory.Cadastro]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  [TaskCategory.Apontamento]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  [TaskCategory.Relatorio]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  [TaskCategory.Corretiva]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

export const STATUS_COLORS: { [key in TaskStatus]: string } = {
  [TaskStatus.Aguardando]: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
  [TaskStatus.EmDesenvolvimento]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300',
  [TaskStatus.EmTestes]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
  [TaskStatus.EmHomologacao]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  [TaskStatus.AguardandoDeploy]: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300',
  [TaskStatus.DeployFinalizado]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
};

export const ICONS: { [key: string]: ReactNode } = {
    bolt: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-yellow-500"><path d="M13 3v7h6l-8 11v-7H5l8-11z"/></svg>,
    star: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-amber-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
    pencil: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
    trash: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>,
    sparkles: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>,
    spinner: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,
};

export const STATUS_ICONS: { [key in TaskStatus]: ReactNode } = {
    [TaskStatus.Aguardando]: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    [TaskStatus.EmDesenvolvimento]: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
    [TaskStatus.EmTestes]: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path></svg>,
    [TaskStatus.EmHomologacao]: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>,
    [TaskStatus.AguardandoDeploy]: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05-.64-.75-1.94-1.03-3.05-.05zm9 .05c-1.1.98-2.4.7-3.05-.05-.65-.75-.66-2.21.05-3.05 1.26-1.5 5-2 5-2s-.5 3.74-2 5z"/><path d="M12 12V2l-4 4"/><path d="m16 16 6 6"/></svg>,
    [TaskStatus.DeployFinalizado]: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
};

export const STATUS_VISUALS: { [key in TaskStatus]: { bg: string; icon: string; color: string; } } = {
  [TaskStatus.Aguardando]: { bg: 'bg-gray-100 dark:bg-gray-800/50', icon: 'text-gray-500 dark:text-gray-400', color: '#6B7280' },
  [TaskStatus.EmDesenvolvimento]: { bg: 'bg-cyan-100 dark:bg-cyan-900/40', icon: 'text-cyan-500 dark:text-cyan-400', color: '#06B6D4' },
  [TaskStatus.EmTestes]: { bg: 'bg-indigo-100 dark:bg-indigo-900/40', icon: 'text-indigo-500 dark:text-indigo-400', color: '#6366F1' },
  [TaskStatus.EmHomologacao]: { bg: 'bg-orange-100 dark:bg-orange-900/40', icon: 'text-orange-500 dark:text-orange-400', color: '#F97316' },
  [TaskStatus.AguardandoDeploy]: { bg: 'bg-pink-100 dark:bg-pink-900/40', icon: 'text-pink-500 dark:text-pink-400', color: '#EC4899' },
  [TaskStatus.DeployFinalizado]: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', icon: 'text-emerald-500 dark:text-emerald-400', color: '#10B981' },
};