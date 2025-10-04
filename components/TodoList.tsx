import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
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

  const renderItem = ({ item }: { item: { id: string; text: string } }) => {
    const isEditing = editingId === item.id;

    return (
      <View style={styles.taskCard}>
        {isEditing ? (
          <View style={styles.editRow}>
            <TextInput
              style={[styles.input, styles.editInput]}
              value={editingText}
              onChangeText={setEditingText}
              placeholder="Edit task"
            />
            <View style={styles.editButtons}>
              <Button
                title="Save"
                onPress={() => {
                  editTodo(item.id, editingText);
                  setEditingId(null);
                }}
              />
              <Button title="Cancel" onPress={() => setEditingId(null)} />
            </View>
          </View>
        ) : (
          <View style={styles.taskRow}>
            <View style={styles.taskTextWrap}>
              <Text numberOfLines={2} style={styles.taskText}>
                {item.text}
              </Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconPressed,
                ]}
                onPress={() => {
                  completeTodo(item.id);
                  onTaskCompleted();
                }}
              >
                <Text style={styles.iconText}>✔️</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconPressed,
                ]}
                onPress={() => {
                  setEditingId(item.id);
                  setEditingText(item.text);
                }}
              >
                <Text style={styles.iconText}>✏️</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-do</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, styles.addInput]}
          placeholder="Add a task..."
          value={newTask}
          onChangeText={setNewTask}
          returnKeyType="done"
          onSubmitEditing={() => {
            if (newTask.trim()) {
              addTodo(newTask.trim());
              setNewTask('');
            }
          }}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (newTask.trim()) {
              addTodo(newTask.trim());
              setNewTask('');
            }
          }}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTodos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <TouchableOpacity style={styles.completedButton} onPress={onShowCompleted}>
        <Text style={styles.completedButtonText}>View Completed</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 300,
    maxHeight: '70%',
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 14,
    // soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    backdropFilter: 'blur(6px)', // web-only; ignored on native
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 10,
    color: '#111',
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(16,24,32,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.6)',
    color: '#111',
  },
  addInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  list: {
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 6,
  },
  taskCard: {
    backgroundColor: 'rgba(250,250,250,0.8)',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  taskText: {
    fontSize: 14,
    color: '#111',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  iconText: {
    fontSize: 16,
  },
  editRow: {
    flexDirection: 'column',
  },
  editInput: {
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  completedButton: {
    marginTop: 6,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderRadius: 8,
  },
  completedButtonText: {
    textAlign: 'center',
    color: '#374151',
    fontWeight: '600',
  },
});

export default TodoList;