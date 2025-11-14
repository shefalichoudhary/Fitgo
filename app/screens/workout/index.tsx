import React, { useEffect, useState } from "react"
import { FlatList, ActivityIndicator, Text } from "react-native"
import { Screen } from "@/components/Screen"
import { db } from "@/utils/storage"
import {
  workouts,
  workoutExercises,
  exercises,
  exerciseMuscles,
  muscles,
} from "@/utils/storage/schema"
import { eq } from "drizzle-orm"
import { getWeekRange, getRelativeWeekTitle } from "@/utils/workout/weekUtils"
import { WeekHeader } from "@/components/workout/WeekHeader"
import { WorkoutCard } from "@/components/workout/WorkoutCard"
import { ConfirmModal } from "@/components/ConfirmModal"
import { useNavigation } from "@react-navigation/native"
import { CompositeNavigationProp } from "@react-navigation/native"
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { DemoTabParamList, HomeStackParamList } from "@/navigators/navigationTypes"

type HistoryNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<DemoTabParamList, "History">,
  NativeStackNavigationProp<HomeStackParamList>
>

interface WorkoutItem {
  id: string
  date: string
  volume: number
  sets: number
  title?: string
  duration?: number
  exerciseCount: number
  muscleGroups: string
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<WorkoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const handleDelete = async () => {
    if (!selectedWorkoutId) return

    await db.delete(workoutExercises).where(eq(workoutExercises.workoutId, selectedWorkoutId)).run()
    await db.delete(workouts).where(eq(workouts.id, selectedWorkoutId)).run()

    setHistory((prev) => prev.filter((w) => w.id !== selectedWorkoutId))
    setSelectedWorkoutId(null)
  }

  useEffect(() => {
    const loadHistory = async () => {
      const result = await db.select().from(workouts).all()
      const records: any[] = []

      for (const w of result) {
        const exerciseRows = await db
          .select()
          .from(workoutExercises)
          .where(eq(workoutExercises.workoutId, w.id))
          .all()

        const exerciseCount = exerciseRows.length

        const muscleRows = await db
          .select({ name: muscles.name })
          .from(workoutExercises)
          .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
          .leftJoin(exerciseMuscles, eq(exerciseMuscles.exercise_id, exercises.id))
          .leftJoin(muscles, eq(muscles.id, exerciseMuscles.muscle_id))
          .where(eq(workoutExercises.workoutId, w.id))
          .all()

        const muscleList = [...new Set(muscleRows.map((m) => m.name).filter(Boolean))]
        const muscleGroups =
          muscleList.length > 3
            ? [...muscleList.slice(0, 3), "..."].join(", ")
            : muscleList.join(", ")

        records.push({ ...w, exerciseCount, muscleGroups })
      }

      setHistory(records)
      setLoading(false)
    }

    loadHistory()
  }, [])
  const handlePressWorkout = (id: string) => {
    navigation.getParent()?.navigate("Home", {
      screen: "WorkoutDetails",
      params: { id },
    })
  }

  if (loading) {
    return (
      <Screen preset="fixed" style={{ flex: 1, backgroundColor: "#111111ff", padding: 12 }}>
        <ActivityIndicator size="large" color="#f5f6f8ff" />
      </Screen>
    )
  }

  if (!history.length) {
    return (
      <Screen preset="fixed" style={{ flex: 1, backgroundColor: "#111111ff", padding: 12 }}>
        <Text>No workout history yet</Text>
      </Screen>
    )
  }

  // SORT LATEST
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  const grouped = sorted.reduce((acc: any, item) => {
    const week = getWeekRange(item.date)
    acc[week] = acc[week] || []
    acc[week].push(item)
    return acc
  }, {})

  const latestWeek = Object.keys(grouped)[0]
  const relativeTitle = getRelativeWeekTitle(latestWeek)

  const data = [
    { type: "header", title: relativeTitle },
    ...grouped[latestWeek].map((w: WorkoutItem) => ({ ...w, type: "workout" })),
  ]
  // In HistoryScreen

  return (
    <Screen preset="fixed" style={{ flex: 1, backgroundColor: "#111111ff", padding: 12 }}>
      <FlatList
        data={data}
        keyExtractor={(item, i) => item.type + "-" + i}
        renderItem={({ item }) =>
          item.type === "header" ? (
            <WeekHeader title={item.title} />
          ) : (
            <WorkoutCard
              item={item}
              onPress={() => handlePressWorkout(item.id)}
              onLongPress={() => setSelectedWorkoutId(item.id)}
            />
          )
        }
      />
      <ConfirmModal
        visible={!!selectedWorkoutId}
        title="Delete Workout?"
        message="Are you sure you want to delete this workout?"
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setSelectedWorkoutId(null)}
        onConfirm={handleDelete}
      />
    </Screen>
  )
}
