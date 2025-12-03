import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ExerciseItem } from "@/components/Routines/ExerciseItem";
import { colors } from "@/theme/colors";
import { useNavigation, useFocusEffect, RouteProp, useRoute } from "@react-navigation/native";
import { db } from "@/utils/storage";
import { exercises as exercisesTable } from "@/utils/storage/schema";
import { SearchBar } from "@/components/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import type { DemoTabScreenProps, HomeStackParamList } from "@/navigators/navigationTypes";

type Exercise = {
  id: string;
  exercise_name: string;
  muscleGroup?: string;
};

export default function ExercisesScreen() {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseData, setExerciseData] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedExerciseIds, setAddedExerciseIds] = useState<string[]>([]);
  const navigation = useNavigation<DemoTabScreenProps<"Exercises">["navigation"]>();
  const route = useRoute<RouteProp<HomeStackParamList, "Exercises">>();

  // Fetch exercises from DB
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const result = await db.select().from(exercisesTable).all();
        const formatted = result.map((item) => ({
          id: item.id,
          exercise_name: item.exercise_name,
          muscleGroup: item.type,
        }));
        setExerciseData(formatted);
        setFilteredExercises(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch exercises:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  // Handle already added exercises from params
  useEffect(() => {
    if (route.params?.alreadyAdded) {
      setAddedExerciseIds(route.params.alreadyAdded);
    }
  }, [route.params?.alreadyAdded]);

  // Clear selection every time screen is focused
  useFocusEffect(
    useCallback(() => {
      setSelectedExercises([]);
    }, [])
  );

  const toggleSelect = (id: string) => {
    if (addedExerciseIds.includes(id)) return; // disable already added
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddExercises = () => {
    const selected = selectedExercises
      .map((id) => exerciseData.find((ex) => ex.id === id))
      .filter((ex): ex is NonNullable<typeof ex> => ex !== undefined)
      .map((ex) => ({
        id: ex.id,
        name: ex.exercise_name,
        muscleGroup: ex.muscleGroup || "Unknown",
        sets: [],
      }));

    navigation.navigate("Home", {
      screen: "CreateRoutine",
      params: { selectedExercises: selected },
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
      <SearchBar
        data={exerciseData}
        filterKey="exercise_name"
        onFilteredData={setFilteredExercises}
        placeholder="Search exercises..."
      />
      <Text style={styles.exerciseCount}>
        {filteredExercises.length} {filteredExercises.length === 1 ? "exercise" : "exercises"} on
        search results{" "}
      </Text>
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseItem
            name={item.exercise_name}
            muscleGroup={item.muscleGroup || ""}
            onPress={() => toggleSelect(item.id)}
            isSelected={selectedExercises.includes(item.id)}
            disabled={addedExerciseIds.includes(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#777" />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or check back later.</Text>
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
    paddingHorizontal: 14,
    paddingTop: 8,
    backgroundColor: "#000000ff",
  },
  listContainer: {
    paddingBottom: 3,
  },
  bottomBar: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  exerciseCount: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 14,
  },
  bottomButton: {
    backgroundColor: "#2563EB",
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
    paddingHorizontal: 20,
  },
});
