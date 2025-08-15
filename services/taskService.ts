import { Task, TaskCategory, TaskStatus } from '../types';

let tasks: Task[] = [];

let nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

const calculateDaysLeft = (task: Task): Task => {
    if (task.completionDate) {
        return { ...task, daysLeft: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { ...task, daysLeft: diffDays };
};

export const taskService = {
  getTasks: (): Promise<Task[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(tasks.map(calculateDaysLeft).sort((a,b) => a.id - b.id)), 200);
    });
  },

  addTask: (task: Omit<Task, 'id' | 'daysLeft'>): Promise<Task> => {
    return new Promise((resolve) => {
      const newTask: Task = { ...task, id: nextId++, completionDate: task.completionDate || null };
      tasks.push(newTask);
      setTimeout(() => resolve(calculateDaysLeft(newTask)), 200);
    });
  },

  bulkAddTask: (newTasks: Omit<Task, 'id' | 'daysLeft'>[]): Promise<Task[]> => {
    return new Promise((resolve) => {
        const addedTasks: Task[] = [];
        newTasks.forEach(task => {
            const newTask: Task = { ...task, id: nextId++ };
            tasks.push(newTask);
            addedTasks.push(calculateDaysLeft(newTask));
        });
        setTimeout(() => resolve(addedTasks.sort((a,b) => a.id - b.id)), 200);
    });
  },

  updateTask: (updatedTask: Task): Promise<Task> => {
    return new Promise((resolve, reject) => {
      const index = tasks.findIndex((task) => task.id === updatedTask.id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedTask };
        setTimeout(() => resolve(calculateDaysLeft(tasks[index])), 200);
      } else {
        reject(new Error('Task not found'));
      }
    });
  },

  deleteTask: (id: number): Promise<{}> => {
    return new Promise((resolve, reject) => {
      const index = tasks.findIndex((task) => task.id === id);
      if (index !== -1) {
        tasks.splice(index, 1);
        setTimeout(() => resolve({}), 200);
      } else {
        reject(new Error('Task not found'));
      }
    });
  },
};