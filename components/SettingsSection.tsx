
import React, { useState } from 'react';
import { Task } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';

interface SettingsSectionProps {
  title: string;
  items: string[];
  tasks: Task[];
  onAddItem: (item: string) => void;
  onDeleteItem: (item: string) => void;
  itemType: 'category' | 'status';
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, items, tasks, onAddItem, onDeleteItem, itemType }) => {
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState('');
  
  const itemTypePortuguese = itemType === 'category' ? 'categoria' : 'status';
  const itemTypePortuguesePlural = itemType === 'category' ? 'categorias' : 'status';

  const handleAddItem = () => {
    if (!newItem.trim()) {
      setError(`O nome d${itemType === 'category' ? 'a' : 'o'} ${itemTypePortuguese} não pode ser vazio.`);
      return;
    }
    if (items.map(i => i.toLowerCase()).includes(newItem.trim().toLowerCase())) {
        setError(`Est${itemType === 'category' ? 'a' : 'e'} ${itemTypePortuguese} já existe.`);
        return;
    }
    onAddItem(newItem.trim());
    setNewItem('');
    setError('');
  };

  const isItemInUse = (item: string): boolean => {
    return tasks.some(task => (itemType === 'category' ? task.category === item : task.status === item));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => {
            setNewItem(e.target.value);
            if (error) setError('');
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
          placeholder={`Adicionar nov${itemType === 'category' ? 'a' : 'o'} ${itemTypePortuguese}...`}
          className="flex-grow px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
        />
        <button
          onClick={handleAddItem}
          className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center p-2 rounded-md shadow-sm transition-colors"
          aria-label={`Adicionar nov${itemType === 'category' ? 'a' : 'o'} ${itemTypePortuguese}`}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? items.map(item => {
          const inUse = isItemInUse(item);
          return (
            <div key={item} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700">
              <span>{item}</span>
              <button
                onClick={() => onDeleteItem(item)}
                disabled={inUse}
                className="ml-2 text-gray-400 hover:text-red-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                title={inUse ? `Não é possível excluir: ${itemTypePortuguese} em uso.` : `Excluir ${itemTypePortuguese}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          );
        }) : <p className="text-sm text-gray-500">Nenhum{itemType === 'category' ? 'a' : ''} {itemTypePortuguese} adicionad{itemType === 'category' ? 'a' : 'o'} ainda.</p>}
      </div>
    </div>
  );
};

export default SettingsSection;
