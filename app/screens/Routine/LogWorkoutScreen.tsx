import React, { useEffect, useState } from "react"
import { FlatList, StyleSheet, Text, Alert, View } from "react-native"
import { Screen } from "@/components/Screen"
import { useRoute, useNavigation } from "@react-navigation/native"
import { useWorkoutData } from "../../../hooks/useWorkoutData"
import { WorkoutSummary } from "@/components/logWorkout/WorkoutSummary"
import { ExerciseCard } from "@/components/logWorkout/ExerciseCard"
import { saveWorkoutSession } from "@/utils/workout"
import { Header } from "@/components/Header"
import { getCurrentUser } from "@/utils/user"
import { AppAlert } from "@/components/AppAlert";

export default function LogWorkoutScreen() {
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [navigateAfterAlert, setNavigateAfterAlert] = useState(false)
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
      setAlertMessage("User not found. Please log in first.")
      setAlertVisible(true)
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

      setAlertMessage("Workout Saved! Your workout has been added to History.")
    setNavigateAfterAlert(true)
    setAlertVisible(true)
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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{routineTitle}</Text>
      </View>

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
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
            <AppAlert
        visible={alertVisible}
        message={alertMessage}
        onHide={() => {
          setAlertVisible(false)
          if (navigateAfterAlert) {
            navigation.navigate("History")
            setNavigateAfterAlert(false)
          }
        }}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: "#000000ff", },
  titleContainer: { marginBottom: 16 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
})
