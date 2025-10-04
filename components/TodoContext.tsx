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
};

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string, deadline?: string) => {
    setTodos(prev => [
      ...prev,
      { id: Date.now().toString(), text, deadline, completed: false },
    ]);
  };

  const editTodo = (id: string, newText: string, newDeadline?: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, text: newText, deadline: newDeadline }
          : todo
      )
    );
  };

  const completeTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: true } : todo
      )
    );
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, editTodo, completeTodo }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (!context) throw new Error('useTodo must be used within a TodoProvider');
  return context;
};