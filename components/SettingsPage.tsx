
import React from 'react';
import { Task } from '../types.ts';
import SettingsSection from './SettingsSection.tsx';

interface SettingsPageProps {
  categories: string[];
  statuses: string[];
  tasks: Task[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onAddStatus: (status: string) => void;
  onDeleteStatus: (status: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  categories,
  statuses,
  tasks,
  onAddCategory,
  onDeleteCategory,
  onAddStatus,
  onDeleteStatus,
}) => {
  return (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SettingsSection
                title="Gerenciar Categorias"
                items={categories}
                tasks={tasks}
                onAddItem={onAddCategory}
                onDeleteItem={onDeleteCategory}
                itemType="category"
            />
            <SettingsSection
                title="Gerenciar Status"
                items={statuses}
                tasks={tasks}
                onAddItem={onAddStatus}
                onDeleteItem={onDeleteStatus}
                itemType="status"
            />
        </div>
    </div>
  );
};

export default SettingsPage;