import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useTodo } from './TodoContext';

const TodoList = ({
  onShowCompleted,
  onTaskCompleted,
}: {
  onShowCompleted: () => void;
  onTaskCompleted: () => void;
}) => {
  const { todos, addTodo, editTodo, completeTodo } = useTodo();
  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const activeTodos = todos.filter(t => !t.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Task"
          value={newTask}
          onChangeText={setNewTask}
        />
        <Button
          title="Add"
          onPress={() => {
            if (newTask.trim()) {
              addTodo(newTask);
              setNewTask('');
            }
          }}
        />
      </View>
      <FlatList
        data={activeTodos}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.todoRow}>
            {editingId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editingText}
                  onChangeText={setEditingText}
                />
                <Button
                  title="Save"
                  onPress={() => {
                    editTodo(item.id, editingText);
                    setEditingId(null);
                  }}
                />
                <Button title="Cancel" onPress={() => setEditingId(null)} />
              </>
            ) : (
              <>
                <Text style={styles.taskText}>{item.text}</Text>
                <TouchableOpacity
                  style={styles.checkButton}
                  onPress={() => {
                    completeTodo(item.id);
                    onTaskCompleted();
                  }}
                >
                  <Text>✔️</Text>
                </TouchableOpacity>
                <Button
                  title="Edit"
                  onPress={() => {
                    setEditingId(item.id);
                    setEditingText(item.text);
                  }}
                />
              </>
            )}
          </View>
        )}
      />
      <Button title="Completed Tasks" onPress={onShowCompleted} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 250,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 4,
    flex: 1,
    marginRight: 5,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  taskText: {
    flex: 1,
  },
  checkButton: {
    marginHorizontal: 5,
  },
});

export default TodoList;