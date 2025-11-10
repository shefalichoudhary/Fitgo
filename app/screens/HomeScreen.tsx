import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet , ActivityIndicator} from "react-native"
import { Screen } from "@/components/Screen"
import { $styles } from "@/theme/styles"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import type { AppStackParamList, HomeStackParamList } from "@/navigators/navigationTypes"
import { db } from "@/utils/storage"
import { users, routines } from "@/utils/storage/schema"

// Type Definitions
type Exercise = {
  name: string
  sets: number
}

type Workout = {
  id: string
  name: string
  duration: number
  exercises: Exercise[]
}

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const workout: Workout = {
    id: "w1",
    name: "Full Body Workout",
    duration: 900,
    exercises: [
      { name: "Push-ups", sets: 3 },
      { name: "Squats", sets: 3 },
      { name: "Plank", sets: 2 },
    ],
  }

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Example: get the first user from DB
        const userData = await db.select().from(users).limit(1).all()
        setUser(userData[0] || null)
      } catch (err) {
        console.error("❌ Failed to fetch user:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

   if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={styles.loadingContainer}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: "white", marginTop: 10 }}>Loading...</Text>
      </Screen>
    )
  }

  return (
   <Screen preset="scroll" contentContainerStyle={styles.screenContent}>
   <Text style={styles.screenTitle}>
        Welcome Back{user ? `, ${user.name || "Athlete"}` : ""}
      </Text>

  <WorkoutCard workout={workout} />

<View style={styles.optionsContainer}>
  <TouchableOpacity
    style={[styles.optionCard, styles.fullWidthCard]}
    onPress={() => navigation.navigate("Routines")}
    activeOpacity={0.85}
  >
    <Text style={styles.optionMainText}>Routines</Text>
      <Text style={styles.optionSubText}>View and manage your routines</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.optionCard, styles.fullWidthCard]}
    onPress={() => navigation.navigate("PreMadeRoutines")}
    activeOpacity={0.85}
  >
    <Text style={styles.optionMainText}>Explore Routines</Text>
    <Text style={styles.optionSubText}>Use expert-designed Routines</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.optionCard, styles.fullWidthCard]}
    onPress={() => navigation.navigate("Measurements")}
    activeOpacity={0.85}
  >
    <Text style={styles.optionMainText}>Track Measurements</Text>
    <Text style={styles.optionSubText}>Log your fitness progress</Text>
  </TouchableOpacity>
</View>

</Screen>
  )
}

// Reusable Workout Card Component
const WorkoutCard = ({ workout }: { workout: Workout }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{workout.name}</Text>
    <Text style={styles.cardSubTitle}>
      Duration: {Math.floor(workout.duration / 60)} min {workout.duration % 60} sec
    </Text>
    <View style={styles.exercisesContainer}>
      {workout.exercises.map((ex, idx) => (
        <View key={idx} style={styles.exerciseRow}>
          <Text style={styles.exerciseText}>{ex.name}</Text>
          <Text style={styles.exerciseText}>{ex.sets} sets</Text>
        </View>
      ))}
    </View>
  </View>
)


// Styles
const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "#101010",
    flexGrow: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },

  // Workout Card styles
  card: {
    backgroundColor: "#181818",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: { color: "#fff", fontWeight: "700", fontSize: 24, marginBottom: 10 },
  cardSubTitle: { color: "#bbb", fontSize: 14, marginBottom: 16 },

  exercisesContainer: {
    gap: 10,
    marginTop: 10,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exerciseText: { color: "#e5e5e5", fontSize: 15 },

  // Bottom Options
optionsContainer: {
  gap: 16,
},

optionCard: {
  backgroundColor: "#1a1a1a",
  paddingVertical: 24,
  paddingHorizontal: 20,
  borderRadius: 14,
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 8,
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.08)",
},

fullWidthCard: {
  width: "100%",
},

optionMainText: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "700",
  marginBottom: 4,
},

optionSubText: {
  color: "#cccccc",
  fontSize: 14,
},optionText: { color: "#fff", fontWeight: "600", fontSize: 17 },
loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#101010",
},
})
