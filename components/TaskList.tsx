import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { taskService } from '../services/taskService';
import { Task, TaskCategory, TaskStatus } from '../types';
import { CATEGORY_COLORS, STATUS_COLORS, ICONS } from '../constants';
import TaskFormModal from './TaskFormModal';
import TaskImportModal, { ValidatedTask } from './TaskImportModal';
import BacklogTimeline from './BacklogTimeline';
import ConfirmationModal from './ui/ConfirmationModal';
import { useTranslation } from '../i18n';

const calculateDeadline = (startDate: Date, hours: number): Date => {
    if (!hours || hours <= 0) return new Date(NaN);
    const workingHoursPerDay = 6;
    let workingDays = Math.ceil(hours / workingHoursPerDay);
    let deadline = new Date(startDate);
    let addedDays = 0;
    if (deadline.getDay() === 6) deadline.setDate(deadline.getDate() + 2);
    else if (deadline.getDay() === 0) deadline.setDate(deadline.getDate() + 1);

    while (addedDays < workingDays) {
        deadline.setDate(deadline.getDate() + 1);
        const dayOfWeek = deadline.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) addedDays++;
    }
    return deadline;
};

const TaskList: React.FC = () => {
    const { t, language } = useTranslation();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [taskToDeleteId, setTaskToDeleteId] = useState<number | null>(null);
    const [validatedTasks, setValidatedTasks] = useState<ValidatedTask[]>([]);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filter, setFilter] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedTasks = await taskService.getTasks();
            setTasks(fetchedTasks);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleOpenFormModal = (task: Task | null = null) => {
        setEditingTask(task);
        setIsFormModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsFormModalOpen(false);
        setIsImportModalOpen(false);
        setEditingTask(null);
        setValidatedTasks([]);
        setTaskToDeleteId(null);
    };

    const handleSaveTask = async (taskData: Task | Omit<Task, 'id'>) => {
        if ('id' in taskData) {
            await taskService.updateTask(taskData as Task);
        } else {
            await taskService.addTask(taskData);
        }
        await fetchTasks();
    };
    
    const handleDeleteRequest = (id: number) => {
        setTaskToDeleteId(id);
    };

    const handleCancelDelete = () => {
        setTaskToDeleteId(null);
    };

    const handleConfirmDelete = async () => {
        if (taskToDeleteId === null) return;
        try {
            await taskService.deleteTask(taskToDeleteId);
            await fetchTasks();
        } catch (error) {
            console.error("Failed to delete task:", error);
        } finally {
            setTaskToDeleteId(null);
        }
    };

    const getEnumKeyByValue = <T extends object>(enumObj: T, value: string): keyof T | undefined => {
        return (Object.keys(enumObj) as Array<keyof T>).find(key => enumObj[key] === value);
    }

    const filteredTasks = useMemo(() => {
        return tasks.filter(task =>
            task.taskId.toLowerCase().includes(filter.toLowerCase()) ||
            task.descricao.toLowerCase().includes(filter.toLowerCase()) ||
            t(`categories.${getEnumKeyByValue(TaskCategory, task.categoria)}`).toLowerCase().includes(filter.toLowerCase()) ||
            t(`statuses.${getEnumKeyByValue(TaskStatus, task.status)}`).toLowerCase().includes(filter.toLowerCase())
        );
    }, [tasks, filter, t]);

    const formatDate = (date: Date) => new Date(date).toLocaleString(t('language') === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'UTC' });
    
    const handleExportXLS = useCallback(() => {
        const headers = [
            t('taskList.headers.id'),
            t('taskList.headers.description'),
            t('taskList.headers.category'),
            t('taskList.headers.status'),
            t('taskList.headers.urgent'),
            t('taskList.headers.important'),
            t('taskList.headers.estimatedHours'),
            t('taskList.headers.startDate'),
            t('taskList.headers.completionDate'),
        ];

        const formatDateForExport = (date: Date | null | undefined): string => {
            if (!date) return '';
            const d = new Date(date);
            const year = d.getUTCFullYear();
            const month = String(d.getUTCMonth() + 1).padStart(2, '0');
            const day = String(d.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const rows = filteredTasks.map(task => {
            const categoryKey = getEnumKeyByValue(TaskCategory, task.categoria);
            const statusKey = getEnumKeyByValue(TaskStatus, task.status);
            return [
                task.taskId,
                task.descricao,
                categoryKey ? t(`categories.${categoryKey}`) : task.categoria,
                statusKey ? t(`statuses.${statusKey}`) : task.status,
                task.urgente ? t('general.yes') : t('general.no'),
                task.importante ? t('general.yes') : t('general.no'),
                task.estimatedHours,
                formatDateForExport(task.startDate),
                formatDateForExport(task.completionDate),
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");
        XLSX.writeFile(workbook, "tasks.xlsx");
    }, [filteredTasks, t]);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (json.length < 2) throw new Error("Sheet is empty or has only headers.");

                const headers = json[0].map(h => String(h).trim());
                const dataRows = json.slice(1);
                
                processAndValidateRows(headers, dataRows);
            } catch (error) {
                console.error("Error processing XLSX file:", error);
                alert(t('taskImportModal.fileError'));
            } finally {
                // Reset file input to allow re-uploading the same file
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };
    
    const { categoryMap, statusMap, booleanMap, headerMap } = useMemo(() => {
        const createMap = <T extends object>(enumObj: T, translationPrefix: string) => {
            const map = new Map<string, T[keyof T]>();
            for (const key of Object.keys(enumObj)) {
                map.set(t(`${translationPrefix}.${key}`), enumObj[key as keyof T]);
            }
            return map;
        };

        const bMap = new Map<string, boolean>([
            [t('general.yes').toLowerCase(), true],
            [t('general.no').toLowerCase(), false]
        ]);

        if (language === 'pt-br') {
            // Accept 'nao' as a common variation for 'não'
            bMap.set('nao', false); 
        }
        
        return {
            categoryMap: createMap(TaskCategory, 'categories'),
            statusMap: createMap(TaskStatus, 'statuses'),
            booleanMap: bMap,
            headerMap: {
                [t('taskList.headers.id')]: 'taskId',
                [t('taskList.headers.description')]: 'descricao',
                [t('taskList.headers.category')]: 'categoria',
                [t('taskList.headers.status')]: 'status',
                [t('taskList.headers.urgent')]: 'urgente',
                [t('taskList.headers.important')]: 'importante',
                [t('taskList.headers.estimatedHours')]: 'estimatedHours',
                [t('taskList.headers.startDate')]: 'startDate',
                [t('taskList.headers.completionDate')]: 'completionDate',
            }
        }
    }, [t, language]);

    const processAndValidateRows = (headers: string[], rows: (string | number)[][]) => {
        const colMap: { [key: string]: number } = {};
        headers.forEach((header, index) => {
            const internalKey = headerMap[header];
            if (internalKey) colMap[internalKey] = index;
        });
        
        const validated = rows.map(row => {
            const taskData: any = {};
            const errors: string[] = [];
            
            // Extract and validate data
            taskData.taskId = row[colMap.taskId]?.toString().trim() ?? '';
            if (!taskData.taskId) errors.push(t('taskImportModal.errors.missingTaskId'));

            taskData.descricao = row[colMap.descricao]?.toString().trim() ?? '';
            if (!taskData.descricao) errors.push(t('taskImportModal.errors.missingDescription'));
            
            const categoryStr = row[colMap.categoria]?.toString().trim() ?? '';
            taskData.categoria = categoryMap.get(categoryStr);
            if (!taskData.categoria) errors.push(t('taskImportModal.errors.invalidCategory', { value: categoryStr }));

            const statusStr = row[colMap.status]?.toString().trim() ?? '';
            taskData.status = statusMap.get(statusStr);
            if (!taskData.status) errors.push(t('taskImportModal.errors.invalidStatus', { value: statusStr }));
            
            const urgentStr = row[colMap.urgent]?.toString().trim().toLowerCase() ?? '';
            if (urgentStr === '') {
                taskData.urgente = false;
            } else {
                taskData.urgente = booleanMap.get(urgentStr);
                if (taskData.urgente === undefined) {
                    errors.push(t('taskImportModal.errors.invalidUrgent', { value: urgentStr }));
                }
            }

            const importantStr = row[colMap.important]?.toString().trim().toLowerCase() ?? '';
            if (importantStr === '') {
                taskData.importante = false;
            } else {
                taskData.importante = booleanMap.get(importantStr);
                if (taskData.importante === undefined) {
                    errors.push(t('taskImportModal.errors.invalidImportant', { value: importantStr }));
                }
            }
            
            const hours = Number(row[colMap.estimatedHours]);
            taskData.estimatedHours = isNaN(hours) || hours <= 0 ? 0 : hours;
            if (taskData.estimatedHours <= 0) errors.push(t('taskImportModal.errors.invalidHours'));

            const startDateStr = row[colMap.startDate]?.toString().trim() ?? '';
            if (!startDateStr) {
                errors.push(t('taskImportModal.errors.missingStartDate'));
                taskData.startDate = null;
            } else {
                const startDate = new Date(`${startDateStr}T00:00:00Z`);
                if (isNaN(startDate.getTime())) {
                    errors.push(t('taskImportModal.errors.invalidStartDate', { value: startDateStr }));
                    taskData.startDate = null;
                } else {
                    taskData.startDate = startDate;
                }
            }

            const completionDateStr = row[colMap.completionDate]?.toString().trim() ?? '';
            if (completionDateStr) {
                const completionDate = new Date(`${completionDateStr}T00:00:00Z`);
                if (isNaN(completionDate.getTime())) {
                    errors.push(t('taskImportModal.errors.invalidCompletionDate', { value: completionDateStr }));
                    taskData.completionDate = null;
                } else {
                    taskData.completionDate = completionDate;
                }
            } else {
                taskData.completionDate = null;
            }

            return { data: taskData, isValid: errors.length === 0, errors };
        });

        setValidatedTasks(validated);
        setIsImportModalOpen(true);
    };

    const handleConfirmImport = async (validRawTasks: any[]) => {
        const newTasks = validRawTasks.map(raw => {
            const startDate = raw.startDate;
            return {
                ...raw,
                deadline: calculateDeadline(startDate, raw.estimatedHours),
                completionDate: raw.completionDate || null,
            }
        });
        try {
            await taskService.bulkAddTask(newTasks);
            await fetchTasks();
        } catch (error) {
            console.error("Failed to bulk add tasks:", error);
        } finally {
            handleCloseModals();
        }
    };
    
    const PriorityIndicator = ({ active }: { active: boolean }) => (
        <div className="flex justify-center items-center">
            <div className={`h-3 w-3 rounded-full ${active ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
    );

    if (loading) {
        return <div className="text-center p-8">{t('taskList.loading')}</div>;
    }

    return (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('taskList.title')}</h2>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{t('taskList.subtitle')}</p>
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2 sm:flex-wrap sm:justify-end">
                    <div className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-700 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'table' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                            }`}
                            aria-pressed={viewMode === 'table'}
                        >
                            {t('taskList.view.table')}
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                viewMode === 'timeline' ? 'bg-white dark:bg-slate-600 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                            }`}
                            aria-pressed={viewMode === 'timeline'}
                        >
                            {t('taskList.view.timeline')}
                        </button>
                    </div>
                     <input
                        type="text"
                        placeholder={t('taskList.filterPlaceholder')}
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600"
                    />
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls" className="hidden" />
                    <button onClick={handleImportClick} className="w-full sm:w-auto bg-white dark:bg-dark-card border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary-light dark:hover:bg-primary/20 transition-colors shadow-sm font-medium">
                        {t('taskList.importXLSButton')}
                    </button>
                    <button onClick={handleExportXLS} className="w-full sm:w-auto bg-white dark:bg-dark-card border border-primary text-primary px-4 py-2 rounded-md hover:bg-primary-light dark:hover:bg-primary/20 transition-colors shadow-sm font-medium">
                        {t('taskList.exportXLSButton')}
                    </button>
                    <button onClick={() => handleOpenFormModal()} className="w-full sm:w-auto bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow-sm font-medium">
                        {t('taskList.newTaskButton')}
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                        <thead className="bg-gray-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.id')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.description')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.category')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.status')}</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.urgent')}</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.important')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.deadline')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.completionDate')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.daysLeft')}</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
                            {filteredTasks.map((task) => {
                                const categoryKey = getEnumKeyByValue(TaskCategory, task.categoria);
                                const statusKey = getEnumKeyByValue(TaskStatus, task.status);
                                const isCompleted = !!task.completionDate;
                                return (
                                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400 ${isCompleted ? 'line-through' : ''}`}>{task.taskId}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white ${isCompleted ? 'line-through' : ''}`}>{task.descricao}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${CATEGORY_COLORS[task.categoria]}`}>
                                                {categoryKey ? t(`categories.${categoryKey}`) : task.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[task.status]}`}>
                                                {statusKey ? t(`statuses.${statusKey}`) : task.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap"><PriorityIndicator active={task.urgente} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap"><PriorityIndicator active={task.importante} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(task.deadline)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{task.completionDate ? formatDate(task.completionDate) : '—'}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${task.daysLeft !== undefined && task.daysLeft < 0 ? 'text-red-600' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {task.daysLeft}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button onClick={() => handleOpenFormModal(task)} className="text-primary hover:text-primary-dark mr-3">{ICONS.pencil}</button>
                                            <button onClick={() => handleDeleteRequest(task.id)} className="text-red-600 hover:text-red-900">{ICONS.trash}</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filteredTasks.length === 0 && <p className="text-center py-4 text-gray-500 dark:text-dark-text-secondary">{t('taskList.noTasks')}</p>}
                </div>
            ) : (
                 <BacklogTimeline tasks={filteredTasks} onEdit={handleOpenFormModal} onDelete={handleDeleteRequest} />
            )}


            <TaskFormModal isOpen={isFormModalOpen} onClose={handleCloseModals} onSave={handleSaveTask} taskToEdit={editingTask} />
            <TaskImportModal isOpen={isImportModalOpen} onClose={handleCloseModals} onImport={handleConfirmImport} validatedTasks={validatedTasks} />
            <ConfirmationModal
                isOpen={taskToDeleteId !== null}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title={t('confirmationModal.deleteTitle')}
                confirmButtonText={t('confirmationModal.confirmButton')}
                cancelButtonText={t('confirmationModal.cancelButton')}
            >
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{t('confirmationModal.deleteMessage')}</p>
            </ConfirmationModal>
        </div>
    );
};

export default TaskList;