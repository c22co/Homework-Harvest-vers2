import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

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
  abortTask: (id: string) => void; // ✅ NEW
// + ADD in type TodoContextType
timerTaskName: string | null;
setTimerTaskName: (name: string | null) => void;
killTreeCallback?: (() => void) | null;
setKillTreeCallback?: (callback: (() => void) | null) => void;


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

  const abortTask = (id: string) => {               // ✅ NEW
    console.log('Abort task called for:', id); // Debug log
    console.log('Kill tree callback exists:', !!killTreeCallbackRef.current); // Debug log
    setTodos(prev => prev.filter(todo => todo.id !== id));
    if (killTreeCallbackRef.current) {
      console.log('Calling kill tree callback'); // Debug log
      killTreeCallbackRef.current();
    } else {
      console.log('No kill tree callback available'); // Debug log
    }
  };

  // + ADD inside TodoProvider
const [timerTaskName, setTimerTaskName] = useState<string | null>(null);
const killTreeCallbackRef = useRef<(() => void) | null>(null);

const setKillTreeCallback = (callback: (() => void) | null) => {
  console.log('Setting kill tree callback in context:', !!callback);
  killTreeCallbackRef.current = callback;
};


  return (
    <TodoContext.Provider
      value={{ todos, addTodo, editTodo, completeTodo, deleteTodo, abortTask, timerTaskName, setTimerTaskName, killTreeCallback: killTreeCallbackRef.current, setKillTreeCallback }} // ✅ expose it
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
