import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

type Exercise = {
  id: string;
  name: string;
};

const sampleExercises: Exercise[] = [
  { id: "1", name: "Bench Press" },
  { id: "2", name: "Squat" },
  { id: "3", name: "Deadlift" },
];

export default function CreateRoutineScreen() {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const handleAddExercise = () => {
    const remaining = sampleExercises.filter(
      (ex) => !exercises.some((sel) => sel.id === ex.id)
    );
    if (remaining.length === 0) {
      Alert.alert("No more exercises to add");
      return;
    }
    setExercises([...exercises, remaining[0]]);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Please enter a routine title");
      return;
    }
    if (exercises.length === 0) {
      Alert.alert("Please add at least one exercise");
      return;
    }
    Alert.alert("Routine saved!", `Title: ${title}`);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Routine Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor="#A0AEC0"
      />

      <View style={exercises.length === 0 ? styles.emptyList : styles.listContainer}>
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.exerciseItem}>
              <Text style={styles.exerciseText}>{item.name}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No exercises added yet</Text>
          }
          contentContainerStyle={
            exercises.length === 0 && styles.emptyContent
          }
        />
      </View>

      <View style={styles.buttonGroup}>
        <Pressable style={styles.button} onPress={handleAddExercise}>
          <Text style={styles.buttonText}>+ Add Exercise</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Routine</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030303ff",
    padding: 16,
  },
  input: {
    backgroundColor: "#1b1b1bff",
    padding: 14,
    borderRadius: 8,
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
  },
  listContainer: {
    flex: 1,
    marginBottom: 12,
  },
  emptyList: {
    marginBottom: 20, // reduced gap when empty
  },
  emptyContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  exerciseItem: {
    backgroundColor: "#1F2937",
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseText: {
    color: "#fff",
    fontSize: 16,
  },
  buttonGroup: {
    marginTop: 0, // keep buttons close to lists
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#10B981",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
