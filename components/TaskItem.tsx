import React, { useMemo } from 'react';
import { Task } from '../types';
import { calculateEndDate, calculateRemainingWorkdays } from '../utils/dateUtils';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete }) => {

  const endDate = useMemo(() => calculateEndDate(task.startDate, task.deadlineHours), [task.startDate, task.deadlineHours]);
  const remainingDays = useMemo(() => calculateRemainingWorkdays(endDate), [endDate]);

  const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');

  const statusDisplay: Record<string, string> = {
      'To Do': 'A Fazer',
      'In Progress': 'Em Andamento',
      'Completed': 'Concluída'
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.id}</td>
      <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 max-w-xs">{task.description}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.category}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            task.status === 'Completed' || task.status === 'Concluída' ? 'bg-green-100 text-green-800' : 
            task.status === 'In Progress' || task.status === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {statusDisplay[task.status] || task.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center">
            <span
                className={`h-4 w-4 rounded-full ${task.isUrgent ? 'bg-green-500' : 'bg-red-500'}`}
                title={`Urgente: ${task.isUrgent ? 'Sim' : 'Não'}`}
            ></span>
        </div>
      </td>
       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center">
            <span
                className={`h-4 w-4 rounded-full ${task.isImportant ? 'bg-green-500' : 'bg-red-500'}`}
                title={`Importante: ${task.isImportant ? 'Sim' : 'Não'}`}
            ></span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(endDate)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{remainingDays}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-4">
          <button onClick={() => onEdit(task)} className="text-indigo-600 hover:text-indigo-900" title="Editar Tarefa">
            <PencilIcon />
          </button>
          <button onClick={() => onDelete(task)} className="text-red-600 hover:text-red-900" title="Excluir Tarefa">
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TaskItem;