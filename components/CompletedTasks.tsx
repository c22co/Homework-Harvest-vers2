import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTodo } from './TodoContext';

const CompletedTasks = ({ onBack }: { onBack: () => void }) => {
  const { todos } = useTodo();
  const completed = todos.filter(t => t.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Tasks</Text>
      <FlatList
        data={completed}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.taskText}>{item.text}</Text>
            {item.deadline ? (
              <Text style={styles.deadlineText}>Due: {item.deadline}</Text>
            ) : null}
          </View>
        )}
      />
       <TouchableOpacity style={styles.backButton} onPress={onBack} hitSlop={8}>
  <Text style={styles.backButtonText}>BACK TO TO-DO LIST</Text>
</TouchableOpacity>
    </View>
  );
};
const ORANGE_DARK = '#B86519';   // borders / headings / dark CTA fill
const BUTTER      = '#FFE086';   // panel fill
const BUTTER_DEEP = '#FFD871';   // pill fill (light)
const PANEL_INNER = '#FFE6A5';   // inner section fill
const INPUT_BORDER= '#D28B2F';
const PANEL_WIDTH = 360

const styles = StyleSheet.create({
  /* Panel: compact, top-right, comfy padding so inner borders don’t touch */
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 300,                 // compact & consistent with To-do panel
    backgroundColor: BUTTER,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 10,
  },

  titlePill: {
  alignSelf: 'stretch',
  backgroundColor: BUTTER_DEEP, // same as To-Do pill
  borderWidth: 3,
  borderColor: ORANGE_DARK,
  borderRadius: 999,
  paddingVertical: 10,
  paddingHorizontal: 16,
  justifyContent: 'center',
  // remove margins here if you want tighter stacking with the list
},

title: {
  fontSize: 20,
  fontWeight: '900',
  color: ORANGE_DARK,
  textAlign: 'center', // or 'left' — set to whatever your To-Do uses
},
  titleText: {
    color: ORANGE_DARK,
    fontSize: 20,
    fontWeight: '900',
  },

  /* Inset section for the list (prevents “kissing” borders) */
  section: {
    backgroundColor: PANEL_INNER,
    borderWidth: 2,
    borderColor: ORANGE_DARK,
    borderRadius: 12,
    padding: 10,
  },
  listContent: {
    gap: 8,
    paddingBottom: 2,
  },

  /* Rows */
  row: {
    backgroundColor: '#FFF0BF',
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  taskText: {
    color: '#7C4710',
    fontSize: 16,
    fontWeight: '600',
  },
  deadlineText: {
    color: '#A96E22',
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#A96E22',
    opacity: 0.9,
    paddingVertical: 6,
  },

   backButton: {
   marginTop: 10,
   alignSelf: 'stretch',
  paddingVertical: 12,
      borderRadius: 999,
 borderWidth: 3,
   borderColor: ORANGE_DARK,
   backgroundColor: ORANGE_DARK, // <-- your desired pill color
   alignItems: 'center',
   justifyContent: 'center',
 },
 backButtonText: {
    fontSize: 16,
    fontWeight: '900',
   color: BUTTER,               // high contrast on dark pill
   letterSpacing: 0.5,
  },
 });

export default CompletedTasks;