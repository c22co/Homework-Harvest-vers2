import React from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
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
      <Button title="Back to Todo List" onPress={onBack} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
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
  row: {
    marginBottom: 5,
  },
  taskText: {
    fontSize: 16,
  },
  deadlineText: {
    color: 'gray',
    fontSize: 12,
  },
});

export default CompletedTasks;