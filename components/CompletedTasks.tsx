import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useTodo } from '@/components/TodoContext';

export function CompletedTasks({ onBack }: { onBack: () => void }) {
  const { todos } = useTodo();
  const completed = todos.filter(t => t.completed);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completed Tasks</Text>

      <FlatList
        data={completed}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No completed tasks</Text>}
      />

      <TouchableOpacity onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 300, padding: 10, backgroundColor: '#FFE086', borderRadius: 10 },
  title: { fontWeight: '900', fontSize: 18, marginBottom: 8, color: '#B86519' },
  row: { paddingVertical: 6 },
  text: { color: '#7C4710' },
  empty: { color: '#A96E22', textAlign: 'center', paddingVertical: 8 },
  back: { marginTop: 8, padding: 8, backgroundColor: '#B86519', borderRadius: 8 },
  backText: { color: '#FFE086', textAlign: 'center', fontWeight: '900' },
});