import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types.ts';
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from '../constants.tsx';
import Modal from './ui/Modal.tsx';
import Switch from './ui/Switch.tsx';
import { useTranslation } from '../i18n.tsx';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task | Omit<Task, 'id'>) => void;
  taskToEdit: Task | null;
}

const calculateDeadline = (startDate: Date, hours: number): Date => {
    if (!hours || hours <= 0) {
        const invalidDate = new Date(NaN);
        return invalidDate;
    }
    const workingHoursPerDay = 6;
    let workingDays = Math.ceil(hours / workingHoursPerDay);
    let deadline = new Date(startDate);
    let addedDays = 0;

    // If start date is a weekend, move to the next Monday
    if (deadline.getDay() === 6) { // Saturday
        deadline.setDate(deadline.getDate() + 2);
    } else if (deadline.getDay() === 0) { // Sunday
        deadline.setDate(deadline.getDate() + 1);
    }

    while (addedDays < workingDays) {
        deadline.setDate(deadline.getDate() + 1);
        const dayOfWeek = deadline.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }
    return deadline;
};

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const { t } = useTranslation();

  const getInitialState = () => ({
    taskId: '',
    descricao: '',
    categoria: TaskCategory.Ciclo,
    status: TaskStatus.Aguardando,
    urgente: false,
    importante: false,
    estimatedHours: 0,
    startDate: new Date(),
    completionDate: null as Date | null,
  });

  const [formState, setFormState] = useState(getInitialState());
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (taskToEdit) {
      setFormState({
        ...taskToEdit,
        startDate: new Date(taskToEdit.startDate),
        estimatedHours: taskToEdit.estimatedHours || 0,
        completionDate: taskToEdit.completionDate ? new Date(taskToEdit.completionDate) : null,
      });
    } else {
      setFormState(getInitialState());
    }
    setErrors({});
  }, [taskToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
        setFormState(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else if (type === 'date') {
        setFormState(prev => ({ ...prev, [name]: value ? new Date(`${value}T00:00:00Z`) : null }));
    } else {
        setFormState(prev => ({ ...prev, [name]: value as any }));
    }
  };

  const handleSwitchChange = (name: 'urgente' | 'importante', checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
  };
  
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formState.taskId.trim()) newErrors.taskId = t('taskForm.taskIdError');
    if (!formState.descricao.trim()) newErrors.descricao = t('taskForm.descriptionError');
    if (!formState.estimatedHours || formState.estimatedHours <= 0) newErrors.estimatedHours = t('taskForm.hoursError');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const deadline = calculateDeadline(formState.startDate, formState.estimatedHours);
      const taskData = {
        ...formState,
        deadline,
      };
      if (taskToEdit) {
        onSave({ ...taskData, id: taskToEdit.id });
      } else {
        // @ts-ignore
        const { id, ...newTaskData } = taskData;
        onSave(newTaskData);
      }
      onClose();
    }
  };
  
  const calculatedDeadline = useMemo(() => {
    const date = calculateDeadline(formState.startDate, formState.estimatedHours);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(t('language') === 'en' ? 'en-US' : 'pt-BR', { timeZone: 'UTC' });
  }, [formState.startDate, formState.estimatedHours, t]);

  const getEnumKeyByValue = <T extends object>(enumObj: T, value: string): keyof T | undefined => {
    return (Object.keys(enumObj) as Array<keyof T>).find(key => enumObj[key] === value);
  }
  
  const modalTitle = taskToEdit ? t('taskForm.editTitle') : t('taskForm.newTitle');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
           <div>
            <label htmlFor="taskId" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.taskIdLabel')}</label>
            <input type="text" id="taskId" name="taskId" value={formState.taskId} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border ${errors.taskId ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'} rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600 sm:text-sm`} />
            {errors.taskId && <p className="text-xs text-red-600 mt-1">{errors.taskId}</p>}
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.descriptionLabel')}</label>
            <input type="text" id="descricao" name="descricao" value={formState.descricao} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border ${errors.descricao ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'} rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600 sm:text-sm`} />
            {errors.descricao && <p className="text-xs text-red-600 mt-1">{errors.descricao}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.categoryLabel')}</label>
              <select id="categoria" name="categoria" value={formState.categoria} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600 sm:text-sm rounded-md">
                {CATEGORY_OPTIONS.map(opt => {
                  const key = getEnumKeyByValue(TaskCategory, opt);
                  return <option key={opt} value={opt}>{key ? t(`categories.${key}`) : opt}</option>
                })}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.statusLabel')}</label>
              <select id="status" name="status" value={formState.status} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600 sm:text-sm rounded-md">
                {STATUS_OPTIONS.map(opt => {
                  const key = getEnumKeyByValue(TaskStatus, opt);
                  return <option key={opt} value={opt}>{key ? t(`statuses.${key}`) : opt}</option>
                })}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                  <label htmlFor="urgente" className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.urgentLabel')}</label>
                  <Switch checked={formState.urgente} onChange={(checked) => handleSwitchChange('urgente', checked)} />
              </div>
              <div className="flex items-center space-x-3">
                  <label htmlFor="importante" className="text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.importantLabel')}</label>
                  <Switch checked={formState.importante} onChange={(checked) => handleSwitchChange('importante', checked)} />
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.startDateLabel')}</label>
                <input 
                    type="date" 
                    id="startDate" 
                    name="startDate" 
                    value={formState.startDate instanceof Date ? formState.startDate.toISOString().split('T')[0] : ''} 
                    onChange={handleChange} 
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600 sm:text-sm"
                />
             </div>
             <div>
                <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.hoursLabel')}</label>
                <input type="number" id="estimatedHours" name="estimatedHours" value={formState.estimatedHours} onChange={handleChange} className={`mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border ${errors.estimatedHours ? 'border-red-500' : 'border-gray-200 dark:border-slate-600'} rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600 sm:text-sm`} />
                {errors.estimatedHours && <p className="text-xs text-red-600 mt-1">{errors.estimatedHours}</p>}
             </div>
          </div>
          {calculatedDeadline && <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">{t('taskForm.calculatedDeadline')}: <span className="font-semibold text-gray-700 dark:text-gray-300">{calculatedDeadline}</span></p>}
          
          {taskToEdit && (
            <div>
              <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">{t('taskForm.completionDateLabel')}</label>
              <input 
                type="date" 
                id="completionDate" 
                name="completionDate" 
                value={formState.completionDate instanceof Date ? formState.completionDate.toISOString().split('T')[0] : ''} 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-600 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:bg-white dark:focus:bg-slate-600 sm:text-sm"
              />
            </div>
          )}
        </div>
        <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
            {t('taskForm.saveButton')}
          </button>
          <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            {t('taskForm.cancelButton')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
