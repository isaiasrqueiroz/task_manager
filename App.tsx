
import React, { useState, useCallback, useMemo } from 'react';
import { Task } from './types.ts';
import { useLocalStorage } from './hooks/useLocalStorage.ts';
import Header from './components/Header.tsx';
import TaskList from './components/TaskList.tsx';
import TaskFormModal from './components/TaskFormModal.tsx';
import ConfirmationDialog from './components/ConfirmationDialog.tsx';
import SettingsPage from './components/SettingsPage.tsx';

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [categories, setCategories] = useLocalStorage<string[]>('task_categories', []);
  const [statuses, setStatuses] = useLocalStorage<string[]>('task_statuses', []);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [view, setView] = useState<'main' | 'settings'>('main');

  // --- Category Management ---
  const handleAddCategory = (category: string) => {
    if (category && !categories.map(c => c.toLowerCase()).includes(category.toLowerCase())) {
      setCategories([...categories, category]);
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const isCategoryInUse = tasks.some(task => task.category === categoryToDelete);
    if (isCategoryInUse) {
      alert(`Não é possível excluir "${categoryToDelete}" porque está atribuída a uma ou mais tarefas.`);
      return;
    }
    setCategories(categories.filter(c => c !== categoryToDelete));
  };
  
  // --- Status Management ---
  const handleAddStatus = (status: string) => {
    if (status && !statuses.map(s => s.toLowerCase()).includes(status.toLowerCase())) {
        setStatuses([...statuses, status]);
    }
  };

  const handleDeleteStatus = (statusToDelete: string) => {
      const isStatusInUse = tasks.some(task => task.status === statusToDelete);
      if (isStatusInUse) {
          alert(`Não é possível excluir "${statusToDelete}" porque está atribuído a uma ou mais tarefas.`);
          return;
      }
      setStatuses(statuses.filter(s => s !== statusToDelete));
  };

  const openFormForNew = useCallback(() => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  }, []);

  const openFormForEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  }, []);
  
  const closeModal = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleSaveTask = (task: Task) => {
    const isEditing = tasks.some(t => t.id === task.id);
    if (isEditing) {
      setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    } else {
      const taskToSave = {
          ...task,
          category: task.category || categories[0] || '',
          status: task.status || statuses[0] || '',
      };
      setTasks([...tasks, taskToSave]);
    }
    closeModal();
  };

  const openDeleteConfirmation = useCallback((task: Task) => {
    setTaskToDelete(task);
  }, []);

  const closeDeleteConfirmation = useCallback(() => {
    setTaskToDelete(null);
  }, []);

  const handleDeleteTask = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      closeDeleteConfirmation();
    }
  };

  const isAddTaskDisabled = useMemo(() => categories.length === 0 || statuses.length === 0, [categories, statuses]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header 
        onAddTask={openFormForNew} 
        isAddTaskDisabled={isAddTaskDisabled}
        currentView={view}
        onNavigateToSettings={() => setView('settings')}
        onNavigateToMain={() => setView('main')}
      />
      <main className="container mx-auto p-4 md:p-8">
        {view === 'main' ? (
           <TaskList tasks={tasks} onEdit={openFormForEdit} onDelete={openDeleteConfirmation} />
        ) : (
          <SettingsPage
            categories={categories}
            statuses={statuses}
            tasks={tasks}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onAddStatus={handleAddStatus}
            onDeleteStatus={handleDeleteStatus}
          />
        )}
      </main>

      {isFormModalOpen && (
        <TaskFormModal
          isOpen={isFormModalOpen}
          onClose={closeModal}
          onSave={handleSaveTask}
          existingTask={editingTask}
          existingTaskIds={tasks.map(t => t.id)}
          categories={categories}
          statuses={statuses}
        />
      )}

      {taskToDelete && (
        <ConfirmationDialog
          isOpen={!!taskToDelete}
          onClose={closeDeleteConfirmation}
          onConfirm={handleDeleteTask}
          title="Excluir Tarefa"
          message={`Você tem certeza que deseja excluir a tarefa "${taskToDelete.description}"? Esta ação não pode ser desfeita.`}
        />
      )}
    </div>
  );
};

export default App;