import React, { useMemo, useRef, useEffect } from 'react';
import { Task, TaskStatus } from '../types.ts';
import { useTranslation } from '../i18n.tsx';
import { ICONS } from '../constants.tsx';

interface BacklogTimelineProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const getMonthsInRange = (startDate: Date, endDate: Date, lang: string): { name: string; year: number; days: number }[] => {
    const months = [];
    let current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1));

    while (current <= endDate) {
        months.push({
            name: current.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', { month: 'long', timeZone: 'UTC' }),
            year: current.getUTCFullYear(),
            days: new Date(current.getUTCFullYear(), current.getUTCMonth() + 1, 0).getUTCDate()
        });
        current.setUTCMonth(current.getUTCMonth() + 1);
    }
    return months;
};

const STATUS_BAR_COLORS: { [key in TaskStatus]: string } = {
  [TaskStatus.Aguardando]: 'bg-gray-400',
  [TaskStatus.EmDesenvolvimento]: 'bg-cyan-500',
  [TaskStatus.EmTestes]: 'bg-indigo-500',
  [TaskStatus.EmHomologacao]: 'bg-orange-500',
  [TaskStatus.AguardandoDeploy]: 'bg-pink-500',
  [TaskStatus.DeployFinalizado]: 'bg-emerald-500',
};


const BacklogTimeline: React.FC<BacklogTimelineProps> = ({ tasks, onEdit, onDelete }) => {
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const timelineTasks = useMemo(() => tasks.map(task => ({
    ...task,
    startDate: new Date(task.startDate),
    deadline: new Date(task.deadline),
  })).sort((a,b) => a.startDate.getTime() - b.startDate.getTime()), [tasks]);

  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    if (timelineTasks.length === 0) {
      const today = new Date();
      const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
      const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
      return { timelineStart: start, timelineEnd: end, totalDays: 30 };
    }
    const startDates = timelineTasks.map(t => t.startDate);
    const endDates = timelineTasks.map(t => t.deadline);

    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));

    const timelineStart = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), 1));
    const timelineEnd = new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth() + 1, 0));
    
    const totalDays = (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    
    return { timelineStart, timelineEnd, totalDays };
  }, [timelineTasks]);

  const months = useMemo(() => getMonthsInRange(timelineStart, timelineEnd, language), [timelineStart, timelineEnd, language]);

  const today = useMemo(() => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }, []);

  const isTodayVisible = today >= timelineStart && today <= timelineEnd;

  const todayOffsetDays = useMemo(() => {
    if (!isTodayVisible) return 0;
    return (today.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
  }, [today, timelineStart, isTodayVisible]);

  useEffect(() => {
    if (isTodayVisible && scrollContainerRef.current) {
        const dayWidth = 30; // Corresponds to the width per day in pixels
        const scrollPosition = todayOffsetDays * dayWidth;
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const centeredPosition = Math.max(0, scrollPosition - (containerWidth / 2));
        
        scrollContainerRef.current.scrollLeft = centeredPosition;
    }
  }, [isTodayVisible, todayOffsetDays]);

  if (tasks.length === 0) {
    return <p className="text-center py-8 text-gray-500 dark:text-dark-text-secondary">{t('taskList.noTasksTimeline')}</p>;
  }
  
  const formatDate = (date: Date) => date.toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'UTC' });
  const totalWidth = totalDays * 30;

  return (
    <div className="flex w-full text-sm border-t border-gray-200 dark:border-dark-border" style={{ minHeight: '60vh' }}>
        {/* Task List Sidebar */}
        <div className="w-1/3 max-w-sm border-r border-gray-200 dark:border-dark-border bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
            <div className="h-16 flex items-center px-4 bg-slate-100 dark:bg-slate-700/50 border-b border-gray-200 dark:border-dark-border sticky top-0">
                <h3 className="font-bold text-gray-700 dark:text-dark-text">{t('taskList.headers.description')}</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-dark-border">
                {timelineTasks.map(task => {
                    const isCompleted = !!task.completionDate;
                    return (
                        <div key={task.id} className="h-12 flex items-center justify-between px-4 hover:bg-slate-200 dark:hover:bg-slate-700">
                            <div className="flex items-center gap-2 truncate">
                                {task.urgente && <span className="flex-shrink-0" title={t('taskList.headers.urgent')}>{ICONS.bolt}</span>}
                                {task.importante && <span className="flex-shrink-0" title={t('taskList.headers.important')}>{ICONS.star}</span>}
                                <p className={`truncate text-gray-800 dark:text-dark-text ${isCompleted ? 'line-through' : ''}`} title={task.descricao}>{task.descricao}</p>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                                 <button onClick={() => onEdit(task)} className="text-primary hover:text-primary-dark p-1 rounded-full hover:bg-primary-light dark:hover:bg-primary/20 transition-colors">{ICONS.pencil}</button>
                                 <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">{ICONS.trash}</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Gantt Chart Area */}
        <div className="flex-grow overflow-x-auto" ref={scrollContainerRef}>
            <div className="relative" style={{ width: `${totalWidth}px` }}>
                 {/* Month Headers */}
                <div className="h-16 flex bg-slate-100 dark:bg-slate-700/50 border-b border-gray-200 dark:border-dark-border sticky top-0 z-10">
                    {months.map(month => (
                        <div key={`${month.name}-${month.year}`} className="flex-shrink-0 border-r border-gray-200 dark:border-dark-border flex items-center justify-center" style={{ width: `${month.days * 30}px` }}>
                            <h4 className="font-semibold text-gray-600 dark:text-dark-text-secondary capitalize">{month.name} {month.year}</h4>
                        </div>
                    ))}
                </div>
                 {/* Grid and Bars */}
                 <div className="relative divide-y divide-gray-200 dark:divide-dark-border">
                    {months.map((month, index) => {
                       const left = months.slice(0, index).reduce((acc, m) => acc + m.days, 0) * 30;
                       return <div key={`${month.name}-${month.year}-grid`} className="absolute top-0 h-full border-r border-gray-200/70 dark:border-dark-border/50" style={{ left: `${left}px`, width: `${month.days * 30}px` }}></div>
                    })}
                    
                    {isTodayVisible && (
                        <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-primary z-20"
                            style={{ left: `${(todayOffsetDays / totalDays) * 100}%` }}
                            title={formatDate(today)}
                        >
                            <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap">
                                {t('timeline.today')}
                            </span>
                        </div>
                    )}

                     {timelineTasks.map(task => {
                        const startOffset = (task.startDate.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
                        const duration = (task.deadline.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
                        
                        const left = (startOffset / totalDays) * 100;
                        const width = (duration / totalDays) * 100;
                        const isCompleted = !!task.completionDate;
                        
                        return (
                            <div key={task.id} className="h-12 flex items-center px-2 relative group">
                                <div 
                                    className={`h-8 rounded-md text-white text-xs flex items-center px-2 shadow-md hover:opacity-80 transition-opacity ${STATUS_BAR_COLORS[task.status]} ${isCompleted ? 'bg-hatched' : ''}`} 
                                    style={{ left: `${left}%`, width: `${width}%`, position: 'absolute' }}
                                    title={task.descricao}
                                >
                                    <span className={`truncate font-semibold ${isCompleted ? 'line-through' : ''}`}>{task.taskId}</span>
                                </div>
                                {/* Tooltip */}
                                <div className="absolute left-0 -top-4 mt-12 w-64 p-3 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-lg shadow-xl invisible group-hover:visible z-20 transition-opacity">
                                    <h5 className="font-bold text-gray-900 dark:text-white">{task.taskId}: {task.descricao}</h5>
                                    <p className="text-gray-600 dark:text-dark-text-secondary mt-1"><span className="font-semibold">{t('timeline.startDate')}:</span> {formatDate(task.startDate)}</p>
                                    <p className="text-gray-600 dark:text-dark-text-secondary"><span className="font-semibold">{t('timeline.endDate')}:</span> {formatDate(task.deadline)}</p>
                                    <p className="text-gray-600 dark:text-dark-text-secondary"><span className="font-semibold">{t('taskList.headers.status')}:</span> {t(`statuses.${Object.keys(TaskStatus).find(k => TaskStatus[k as keyof typeof TaskStatus] === task.status) as string}`)}</p>
                                </div>
                            </div>
                        )
                     })}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default BacklogTimeline;
