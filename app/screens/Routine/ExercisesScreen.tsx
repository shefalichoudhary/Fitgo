import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ExerciseItem } from "@/components/Routines/ExerciseItem";
import { colors } from "@/theme/colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigators/navigationTypes";
import { db } from "@/utils/storage";
import { exercises as exercisesTable } from "@/utils/storage/schema";
import { SearchBar } from "@/components/SearchBar";
import { Ionicons } from "@expo/vector-icons";
type Exercise = {
  id: string;
  exercise_name: string;
  muscleGroup?: string;
};

export default function ExercisesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseData, setExerciseData] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation =
    useNavigation<NativeStackNavigationProp<HomeStackParamList, "Exercises">>();

  // Fetch exercises from DB
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const result = await db.select().from(exercisesTable).all();
        setExerciseData(
          result.map((item) => ({
            id: item.id,
            exercise_name: item.exercise_name,
            muscleGroup: item.type, // you can adjust based on your schema
          }))
        );
      } catch (err) {
        console.error("❌ Failed to fetch exercises:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const filteredExercises = exerciseData.filter((exercise) =>
    exercise.exercise_name.toLowerCase().includes(searchQuery.toLowerCase())
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
  .map((id) => exerciseData.find((exercise) => exercise.id === id))
  .filter(
    (exercise): exercise is NonNullable<typeof exercise> =>
      exercise !== undefined
  )
  .map((exercise) => ({
    id: exercise.id,
    name: exercise.exercise_name,  // map exercise_name → name
    muscleGroup: exercise.muscleGroup || "Unknown", // ensure non-optional
    sets: [], // initialize sets
  }));

    navigation.navigate("CreateRoutine", {
      selectedExercises: selectedExerciseObjects,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ color: colors.text, marginTop: 10 }}>Loading exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}> Select Exercises</Text>

     <SearchBar
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search exercises..."
/>
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseItem
            name={item.exercise_name}
            muscleGroup={item.muscleGroup || ""}
            onPress={() => toggleSelect(item.id)}
            isSelected={selectedExercises.includes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#777" />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or check back later.
            </Text>
          </View>
        )}
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
    backgroundColor: "#121212", // dark background
  },
  header: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fff", // bright header
    marginBottom: 12,
  },
  searchBar: {
    padding: 12,
    backgroundColor: "#1F1F1F", // darker input background
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333", // subtle border
    marginBottom: 16,
    fontSize: 16,
    color: "#fff", // white text
  },
  listContainer: {
    paddingBottom: 100,
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomButton: {
    backgroundColor: "#2563EB", // blue accent
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  bottomButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
 emptyContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  marginTop: 50,
},
emptyTitle: {
  color: "#fff",
  fontSize: 20,
  fontWeight: "600",
  marginTop: 12,
},
emptySubtitle: {
  color: "#aaa",
  fontSize: 14,
  marginTop: 4,
  textAlign: "center",
  paddingHorizontal: 20,}
});