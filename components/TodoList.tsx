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
const ORANGE_DARK = "#B86519";   // borders / headings
const BUTTER      = "#FFE086";   // panel fill
const BUTTER_DEEP = "#FFD871";   // button fill
const INPUT_FILL  = "#FFF0BF";   // input fill
const INPUT_BORDER= "#D28B2F";   // input border

const styles = StyleSheet.create({
  /* Panel: compact, fixed, top-left */
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 300,                 // compact width
    backgroundColor: BUTTER,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 12,
    padding: 10,                // inset so inner borders never touch outer
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  /* Header */
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: ORANGE_DARK,
  },
  toggle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: ORANGE_DARK,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BUTTER_DEEP,
  },
  toggleClosed: { opacity: 0.9 },
  toggleText: {
    fontSize: 16,
    fontWeight: "900",
    color: ORANGE_DARK,
    lineHeight: 16,
  },

  /* Inner section (adds another inset so borders don’t “kiss”) */
  section: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFE6A5",
    borderWidth: 2,
    borderColor: ORANGE_DARK,
    gap: 10,
  },

  /* Input row */
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,                    // clear spacing between field and button
  },
  input: {
    flex: 1,
    height: 38,                 // compact field height
    backgroundColor: INPUT_FILL,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    borderRadius: 9,
    paddingHorizontal: 10,
    color: "#7C4710",
  },

  /* Add button (compact pill) */
  addButton: {
    minWidth: 76,
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: BUTTER_DEEP,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  addButtonText: {
    fontWeight: "800",
    color: ORANGE_DARK,
    fontSize: 15,
  },

  /* Big CTA (fits neatly within inset section) */
  completedButton: {
    alignSelf: "stretch",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: BUTTER_DEEP,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  completedButtonText: {
    textAlign: "center",
    fontWeight: "900",
    color: ORANGE_DARK,
    fontSize: 17,
  },

  /* Kept for compatibility if referenced elsewhere */
  inputRowSpacer: { height: 4 },
  todoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  taskText: { flex: 1, color: "#7C4710", fontSize: 16 },
  checkButton: { marginHorizontal: 5 },

  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
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

  editRow: {
    flexDirection: 'column',
  },

  editInput: {
    marginBottom: 6,
    backgroundColor: INPUT_FILL,
  },

  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
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
});


export default TodoList;