
import React, { useState, useEffect } from 'react';
import { Task } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  existingTask: Task | null;
  existingTaskIds: string[];
  categories: string[];
  statuses: string[];
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, existingTask, existingTaskIds, categories, statuses }) => {
  const initialFormState: Task = {
    id: '',
    description: '',
    category: categories[0] || '',
    status: statuses[0] || '',
    isUrgent: false,
    isImportant: false,
    deadlineHours: 6,
    startDate: new Date().toISOString().split('T')[0],
    completionDate: null,
  };

  const [task, setTask] = useState<Task>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingTask) {
      setTask(existingTask);
    } else {
      setTask({
          ...initialFormState,
          category: categories[0] || '',
          status: statuses[0] || '',
      });
    }
  }, [existingTask, isOpen, categories, statuses]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!task.id.trim()) newErrors.id = 'O ID da tarefa é obrigatório.';
    else if (!existingTask && existingTaskIds.includes(task.id.trim())) {
      newErrors.id = 'O ID da tarefa deve ser único.';
    }
    if (!task.description.trim()) newErrors.description = 'A descrição é obrigatória.';
    if (task.deadlineHours <= 0) newErrors.deadlineHours = 'O prazo deve ser maior que 0.';
    if (!task.startDate) newErrors.startDate = 'A data de início é obrigatória.';
    if (!task.category) newErrors.category = 'A categoria é obrigatória.';
    if (!task.status) newErrors.status = 'O status é obrigatório.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(task);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setTask(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{existingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">ID da Tarefa</label>
                <input type="text" id="id" name="id" value={task.id} onChange={handleChange} disabled={!!existingTask}
                  className={`mt-1 block w-full px-3 py-2 bg-white text-gray-900 border ${errors.id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100`}
                />
                {errors.id && <p className="text-xs text-red-600 mt-1">{errors.id}</p>}
              </div>

              <div>
                <label htmlFor="deadlineHours" className="block text-sm font-medium text-gray-700">Prazo (Horas)</label>
                <input type="number" id="deadlineHours" name="deadlineHours" value={task.deadlineHours} onChange={handleChange} min="1"
                  className={`mt-1 block w-full px-3 py-2 bg-white text-gray-900 border ${errors.deadlineHours ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                {errors.deadlineHours && <p className="text-xs text-red-600 mt-1">{errors.deadlineHours}</p>}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea id="description" name="description" value={task.description} onChange={handleChange} rows={3}
                  className={`mt-1 block w-full px-3 py-2 bg-white text-gray-900 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                ></textarea>
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                <select id="category" name="category" value={task.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select id="status" name="status" value={task.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                   {statuses.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                <input type="date" id="startDate" name="startDate" value={task.startDate} onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 bg-white text-gray-900 border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
                 {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
              </div>
              
              {existingTask && (
                <div>
                  <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">Data de Conclusão</label>
                  <input type="date" id="completionDate" name="completionDate" value={task.completionDate || ''} onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="md:col-span-2 flex items-center space-x-6 mt-2">
                  <div className="flex items-center">
                    <input id="isUrgent" name="isUrgent" type="checkbox" checked={task.isUrgent} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                    <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-900">Urgente</label>
                  </div>
                  <div className="flex items-center">
                    <input id="isImportant" name="isImportant" type="checkbox" checked={task.isImportant} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                    <label htmlFor="isImportant" className="ml-2 block text-sm text-gray-900">Importante</label>
                  </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none">
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
