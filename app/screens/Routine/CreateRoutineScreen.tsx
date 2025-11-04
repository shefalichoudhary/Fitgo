import { navigate } from "@/navigators/navigationUtilities";
import React, { useState } from "react";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import type { HomeStackParamList } from "@/navigators/navigationTypes";
import { useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

type SetItem = {
  id: string;
  reps: string;
  weight: string;
};

type Exercise = {
  id: string;
  name: string;
  sets: SetItem[];
};

type RouteParams = {
  selectedExercises?: Exercise[];
};

export default function CreateRoutineScreen() {
  const [title, setTitle] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const route = useRoute<RouteProp<HomeStackParamList, "CreateRoutine">>();

useFocusEffect(
  useCallback(() => {
    if (route.params?.selectedExercises) {
      const withSets = route.params.selectedExercises.map((ex) => ({
        ...ex,
        sets: ex.sets
          ? ex.sets.map((set, index) => ({
              id: `${Date.now()}-${index}`, // Generate a unique set id
              reps: String(set.reps ?? ""), // Ensure reps is a string
              weight: String(set.weight ?? ""), // Ensure weight is a string
            }))
          : [], // Default empty sets
      }));
      setExercises(withSets);
    }
  }, [route.params])
);

  const addSet = (exerciseId: string) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                { id: Date.now().toString(), reps: "", weight: "" },
              ],
            }
          : ex
      )
    );
  };

  const updateSetField = (
    exerciseId: string,
    setId: string,
    field: "reps" | "weight",
    value: string
  ) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : ex
      )
    );
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
    console.log(exercises); // Log for development
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

      <View
        style={exercises.length === 0 ? styles.emptyList : styles.listContainer}
      >
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.exerciseItem}>
              <Text style={styles.exerciseText}>{item.name}</Text>

              {item.sets.map((set) => (
                <View key={set.id} style={styles.setRow}>
                  <TextInput
                    style={styles.setInput}
                    placeholder="Reps"
                    keyboardType="numeric"
                    placeholderTextColor="#A0AEC0"
                    value={set.reps}
                    onChangeText={(text) =>
                      updateSetField(item.id, set.id, "reps", text)
                    }
                  />
                  <TextInput
                    style={styles.setInput}
                    placeholder="Weight"
                    keyboardType="numeric"
                    placeholderTextColor="#A0AEC0"
                    value={set.weight}
                    onChangeText={(text) =>
                      updateSetField(item.id, set.id, "weight", text)
                    }
                  />
                </View>
              ))}

              <Pressable
                onPress={() => addSet(item.id)}
                  style={styles.button}

              >
       <Text style={styles.buttonText}>+ Add Set</Text>
              </Pressable>
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
        <Pressable
          style={styles.button}
          onPress={() => navigate("Exercises")}
        >
          <Text style={styles.buttonText}>Add Exercise</Text>
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            (!title.trim() || exercises.some(ex => ex.sets.length === 0)) &&
              styles.disabled,
          ]}
          onPress={handleSave}
          disabled={!title.trim() || exercises.some(ex => ex.sets.length === 0)}
        >
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
    marginBottom: 20,
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
 // Replace your existing addSetButton and setRow styles
setRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 12,
  paddingVertical: 8,
  paddingHorizontal: 6,
  backgroundColor: "#111827", // Darker gray for row
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#1F2937", // Slight border for contrast
},

setInput: {
  flex: 1,
  backgroundColor: "#1F2937", // Dark gray input background
  padding: 12,
  marginHorizontal: 4,
  borderRadius: 8,
  color: "#F9FAFB", // Light text
  fontSize: 14,
  borderWidth: 1,
  borderColor: "#374151", // Subtle border for separation
},

addSetButton: {
  marginTop: 12,
  paddingVertical: 10,
  backgroundColor: "#2563EB", // Tailwind blue-600
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#1D4ED8", // Slightly darker border
  alignItems: "center",
  justifyContent: "center",
},
addSetText: {
  color: "#F9FAFB",
  fontSize: 14,
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: 0.5,
},


  buttonGroup: {
    marginTop: 0,
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
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
