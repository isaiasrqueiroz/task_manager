import React from 'react';
import Modal from './ui/Modal.tsx';
import { useTranslation } from '../i18n.tsx';

export interface ValidatedTask {
  data: any;
  isValid: boolean;
  errors: string[];
}

interface TaskImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (validTasks: any[]) => void;
  validatedTasks: ValidatedTask[];
}

const TaskImportModal: React.FC<TaskImportModalProps> = ({ isOpen, onClose, onImport, validatedTasks }) => {
  const { t } = useTranslation();
  const validTasks = validatedTasks.filter(task => task.isValid);
  const invalidTaskCount = validatedTasks.length - validTasks.length;

  const handleImport = () => {
    onImport(validTasks.map(vt => vt.data));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('taskImportModal.title')}>
      <div className="p-6">
        <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4">{t('taskImportModal.subtitle', { count: validatedTasks.length })}</p>
        
        <div className="max-h-80 overflow-y-auto border dark:border-dark-border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-slate-700/50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskImportModal.tableHeaders.status')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.id')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskList.headers.description')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">{t('taskImportModal.tableHeaders.errors')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-dark-border">
              {validatedTasks.map((task, index) => (
                <tr key={index} className={task.isValid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm">
                    {task.isValid ? (
                      <span className="text-green-600 dark:text-green-400 font-semibold">{t('taskImportModal.valid')}</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400 font-semibold">{t('taskImportModal.invalid')}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-dark-text">{task.data.taskId || '—'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-dark-text">{task.data.descricao || '—'}</td>
                  <td className="px-4 py-2 text-sm text-red-700 dark:text-red-400">{task.errors.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-sm">
            {validTasks.length > 0 && <p className="text-green-600 dark:text-green-400">{t('taskImportModal.validCount', { count: validTasks.length })}</p>}
            {invalidTaskCount > 0 && <p className="text-red-600 dark:text-red-400">{t('taskImportModal.invalidCount', { count: invalidTaskCount })}</p>}
        </div>

      </div>
      <div className="bg-gray-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          onClick={handleImport}
          disabled={validTasks.length === 0}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {t('taskImportModal.importButton', { count: validTasks.length })}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {t('taskForm.cancelButton')}
        </button>
      </div>
    </Modal>
  );
};

export default TaskImportModal;
