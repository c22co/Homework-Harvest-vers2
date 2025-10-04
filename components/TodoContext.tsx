import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Todo = {
  id: string;
  text: string;
  deadline?: string;
  completed: boolean;
};

type TodoContextType = {
  todos: Todo[];
  addTodo: (text: string, deadline?: string) => void;
  editTodo: (id: string, newText: string, newDeadline?: string) => void;
  completeTodo: (id: string) => void;
  deleteTodo: (id: string) => void; // ✅ NEW
// + ADD in type TodoContextType
timerTaskName: string | null;
setTimerTaskName: (name: string | null) => void;


};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string, deadline?: string) => {
    setTodos(prev => [
      { id: Date.now().toString(), text, deadline, completed: false },
      ...prev,
    ]);
  };

  const editTodo = (id: string, newText: string, newDeadline?: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: newText, deadline: newDeadline } : todo
      )
    );
  };

  const completeTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo => (todo.id === id ? { ...todo, completed: true } : todo))
    );
  };

  const deleteTodo = (id: string) => {             // ✅ NEW
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  // + ADD inside TodoProvider
const [timerTaskName, setTimerTaskName] = useState<string | null>(null);


  return (
    <TodoContext.Provider
      value={{ todos, addTodo, editTodo, completeTodo, deleteTodo, timerTaskName, setTimerTaskName }} // ✅ expose it
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error('useTodo must be used within a TodoProvider');
  return ctx;
};
