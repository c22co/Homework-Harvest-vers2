import { useTodo } from '@/components/TodoContext';
import React, { useState } from 'react';
import {
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

// removed top-level hook call that was here (calling useTodo at module scope was causing the error)

const TodoList = ({
  onShowCompleted,   // kept for compatibility (not used anymore)
  onTaskCompleted,
}: {
  onShowCompleted: () => void;
  onTaskCompleted: () => void;
}) => {
  // Grab everything from context, but treat deleteTodo as optional
  const todoApi = useTodo();
  const { todos, addTodo, editTodo, completeTodo, setTimerTaskName } = todoApi;
  const deleteTodo =
    (todoApi as any).deleteTodo as undefined | ((id: string) => void);

  const [newTask, setNewTask] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  // responsive panel width (works on all phone sizes)
  const EDGE = 16; // margin from the screen edge
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(PANEL_WIDTH, screenWidth - EDGE * 2);

  // Show both completed and active; keep actives first
  const sortedTodos = [...todos].sort(
    (a: any, b: any) => Number(a.completed) - Number(b.completed)
  );

  const renderItem = ({
    item,
  }: {
    item: { id: string; text: string; completed?: boolean };
  }) => {
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
              <Text
                numberOfLines={2}
                style={[styles.taskText, item.completed && styles.taskTextDone]}
              >
                {item.text}
              </Text>
            </View>

            <View style={styles.actions}>
              {/* Complete (only does something if not already completed) */}
              {/* Link this task to the timer */}
<Pressable
  style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed]}
  onPress={() => setTimerTaskName(item.text)}
  accessibilityLabel="Link to timer"
>
  <Text style={styles.iconText}>⏱</Text>
</Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconPressed,
                ]}
                onPress={() => {
                  if (!item.completed) {
                    completeTodo(item.id);
                    onTaskCompleted();
                  }
                }}
                accessibilityLabel={
                  item.completed ? 'Completed' : 'Mark as completed'
                }
              >
                <Text style={styles.iconText}>✔️</Text>
              </Pressable>

              {/* Edit (hide if already completed) */}
              {!item.completed && (
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.iconPressed,
                  ]}
                  onPress={() => {
                    setEditingId(item.id);
                    setEditingText(item.text);
                  }}
                  accessibilityLabel="Edit task"
                >
                  <Text style={styles.iconText}>✏️</Text>
                </Pressable>
              )}

              {/* Delete (only after completed, and only if context provides deleteTodo) */}
              {item.completed && deleteTodo && (
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    pressed && styles.iconPressed,
                  ]}
                  onPress={() => deleteTodo(item.id)}
                  accessibilityLabel="Delete task"
                >
                  <Text style={styles.iconText}>🗑️</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { width: panelWidth, left: EDGE }]}>
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

      {/* Show all tasks; completed ones are crossed out and can be deleted */}
      <FlatList
        data={sortedTodos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      {/* Removed the "View Completed" button per your request */}
    </View>
  );
};

/* ==== Theme tokens ==== */
const ORANGE_DARK = '#B86519';   // borders / headings
const BUTTER      = '#FFE086';   // panel fill
const BUTTER_DEEP = '#FFD871';   // button fill
const INPUT_FILL  = '#FFF0BF';   // input & card fill (opaque now)
const INPUT_BORDER= '#D28B2F';   // input/card border
const PANEL_WIDTH = 240; 
const PANEL_HEIGHT = 240;        // target height for both panels

const styles = StyleSheet.create({
  /* Panel: compact, fixed, top-left */
  container: {
    position: "absolute",
    top: 20,
    left: 20,
    width: PANEL_WIDTH,          // overridden responsively at render
    backgroundColor: BUTTER,     // opaque panel background
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 12,
    padding: 10,                 // inset so inner borders never touch outer
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    minHeight: PANEL_HEIGHT,
  },

  list: { flex: 1 },
  listContent: { paddingBottom: 8 },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: ORANGE_DARK,
  },

  /* Inner section (kept for parity; unused here) */
  section: {
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFE6A5',
    borderWidth: 2,
    borderColor: ORANGE_DARK,
    gap: 10,
  },

  /* Input row */
  inputRow: {
    flexDirection: "row",
   alignItems: "center",
    paddingRight: 6,            // keep contents inside the right border
  },
  input: {
    flex: 1,
   minWidth: 0,                // allow flex item to shrink on Web
   flexShrink: 1,              // prevent overflow when row is tight
   marginRight: 8,             // replaces the removed `gap`
    height: 38, // compact field height
    backgroundColor: INPUT_FILL,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    borderRadius: 9,
    paddingHorizontal: 10,
    color: '#7C4710',
  },

  /* Add button (compact pill) */
  addButton: {
    minWidth: 64,               // slightly narrower pill
   paddingVertical: 7,
   paddingHorizontal: 12,      // trims width a touch
    backgroundColor: BUTTER_DEEP,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  addButtonText: {
    fontWeight: '800',
    color: ORANGE_DARK,
    fontSize: 15,
  },

  /* List spacing */
  list: {},
  listContent: {
    paddingTop: 4,
    paddingBottom: 6,
    gap: 6,
  },

  /* Task cards — now OPAQUE */
  taskCard: {
    backgroundColor: INPUT_FILL,   // was semi-transparent; now solid
    borderRadius: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
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
    fontSize: 16,
    color: '#7C4710',
    fontWeight: '700',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    opacity: 0.65,
  },

  /* Editing */
  editRow: {
    flexDirection: 'column',
    gap: 6,
  },
  editInput: {
    backgroundColor: INPUT_FILL,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },

  /* Row actions */
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
    backgroundColor: 'transparent',
  },
  iconPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 9,
  },
  iconText: {
    fontSize: 16,
  },
});

export default TodoList;
