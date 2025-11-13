import React, { useEffect, useState } from "react"
import { FlatList, StyleSheet, Text, Alert } from "react-native"
import { Screen } from "@/components/Screen"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useWorkoutData } from "../../../hooks/useWorkoutData"
import { WorkoutSummary } from "@/components/logWorkout/WorkoutSummary"
import { ExerciseCard } from "@/components/logWorkout/ExerciseCard"
import { saveWorkoutSession } from "@/utils/workout"
import { Header } from "@/components/Header"
import { getCurrentUser } from "@/utils/user"

export default function LogWorkoutScreen() {
  const route = useRoute<any>()
  const navigation = useNavigation<any>()
  const { routineId } = route.params
  const { routineTitle, exercisesData, duration, toggleSetCompletion } = useWorkoutData(routineId)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    ;(async () => {
      const fetchedUser = await getCurrentUser()
      setUser(fetchedUser)
    })()
  }, [])

  const totalSets = exercisesData.reduce((a, e) => a + e.sets.length, 0)
  const completedSets = exercisesData.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)
  const totalVolume = exercisesData.reduce(
    (a, e) => a + e.sets.reduce((v, s) => v + (s.completed ? s.reps * s.weight : 0), 0),
    0,
  )

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "User not found. Please log in first.")
      return
    }

    const workoutId = await saveWorkoutSession({
      userId: user.id,
      routineId,
      routineName: routineTitle,
      totalSets,
      completedSets,
      totalVolume,
      duration,
      exercises: exercisesData,
    })

    Alert.alert("Workout Saved!", "Your workout has been added to History.", [
      {
        text: "OK",
        onPress: () => navigation.navigate("History"),
      },
    ])
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <Header
          title="Log Workout"
          leftIcon="back"
          onLeftPress={() => navigation.goBack()}
          rightText="Save"
          onRightPress={handleSave}
        />
      ),
    })
  }, [navigation, routineTitle, duration, totalSets, completedSets, totalVolume, user])

  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.title}>{routineTitle}</Text>
      <WorkoutSummary
        completedSets={completedSets}
        totalSets={totalSets}
        totalVolume={totalVolume}
        duration={duration}
      />
      <FlatList
        data={exercisesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseCard exercise={item} onToggleSet={(setId) => toggleSetCompletion(item.id, setId)} />
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#121212" },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 16, marginLeft: 10 },
})
