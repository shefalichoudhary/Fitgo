import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ExerciseItem } from "@/components/Routines/ExerciseItem";
import { colors } from "@/theme/colors"; // Make sure this path is correct
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigators/navigationTypes";

const exerciseData = [
  { id: "1", name: "Push Up", muscleGroup: "Chest" },
  { id: "2", name: "Squat", muscleGroup: "Legs" },
  { id: "3", name: "Deadlift", muscleGroup: "Back" },
  { id: "4", name: "Bench Press", muscleGroup: "Chest" },
  { id: "5", name: "Pull Up", muscleGroup: "Back" },
  { id: "6", name: "Push Up", muscleGroup: "Back" },
  { id: "7", name: "Pull Up", muscleGroup: "Back" },
  { id: "8", name: "Pull Up", muscleGroup: "Back" },
  { id: "9", name: "Pull Up", muscleGroup: "Back" },
  { id: "10", name: "Pull Up", muscleGroup: "Back" },

];

export default function ExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
const navigation =
  useNavigation<NativeStackNavigationProp<HomeStackParamList, "Exercises">>();

  const filteredExercises = exerciseData.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedExercises((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };
const handleAddExercises = () => {
  const selectedExerciseObjects = selectedExercises
    .map((id) =>
      exerciseData.find((exercise) => exercise.id === id)
    )
    .filter(
      (exercise): exercise is NonNullable<typeof exercise> =>
        exercise !== undefined
    )
    .map((exercise) => ({
      ...exercise,
      sets: [], // ✅ Add sets here
    }));

  navigation.navigate("CreateRoutine", {
    selectedExercises: selectedExerciseObjects,
  });
};


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Exercises</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Search exercises..."
        placeholderTextColor={colors.textDim}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseItem
            name={item.name}
            muscleGroup={item.muscleGroup}
            onPress={() => toggleSelect(item.id)}
            isSelected={selectedExercises.includes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />

      {selectedExercises.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomButton} onPress={handleAddExercises}>
            <Text style={styles.bottomButtonText}>
              Add {selectedExercises.length}{" "}
              {selectedExercises.length === 1 ? "exercise" : "exercises"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  searchBar: {
    padding: 12,
    backgroundColor: colors.palette.neutral800,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text,
  },
  listContainer: {
    paddingBottom: 80, // leave space for bottom bar
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomButton: {
    backgroundColor: colors.tint,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
});
