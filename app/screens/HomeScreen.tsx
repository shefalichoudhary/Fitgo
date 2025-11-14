import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native"
import { Screen } from "@/components/Screen"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { db } from "@/utils/storage"
import {  routines } from "@/utils/storage/schema" // add premade routines table
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons"
import { eq } from "drizzle-orm"


export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [routine, setRoutine] = useState<any>(null)

  useEffect(() => {
    const fetchPreMadeRoutine = async () => {
      try {
        const result = await db
          .select()
          .from(routines)
          .where(eq(routines.isPreMade, 1))
          .limit(1)
          .all()
        if (result.length > 0) {
          setRoutine(result[0])
        }
      } catch (error) {
        console.error("Error fetching pre-made routine:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreMadeRoutine()
  }, [])

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" contentContainerStyle={styles.screenContent}>
      <Text style={styles.screenTitle}>
        Welcome Back{user ? `, ${user.name || "Athlete"}` : ""}
      </Text>

      {/* Start Workout Card */}
      {routine && (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate("RoutineDetails", { id: routine.id })}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{routine.name}</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate("Log Workout" as any, { routineId: routine.id })}
            >
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardDescription} numberOfLines={2}>
            {routine.description || "No description available."}
          </Text>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>💪 {routine.targetMuscle || "Full Body"}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>🔥 {routine.difficulty || "Intermediate"}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagText}>⏱ {routine.duration || "30 min"}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      {/* Options */}
      <View style={styles.optionsContainer}>
        <OptionCard
          icon={<MaterialIcons name="fitness-center" size={28} color="#fff" />}
          title="Routines"
          subtitle="View and manage your routines"
          onPress={() => navigation.navigate("Routines")}
        />
        <OptionCard
          icon={<FontAwesome5 name="running" size={28} color="#fff" />}
          title="Explore Routines"
          subtitle="Use expert-designed routines"
          onPress={() => navigation.navigate("PreMadeRoutines")}
        />
        <OptionCard
          icon={<Ionicons name="analytics" size={28} color="#fff" />}
          title="Track Measurements"
          subtitle="Log your fitness progress"
          onPress={() => navigation.navigate("Measurements")}
        />
      </View>
      {/* Motivational Tip */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 Daily Tip</Text>
        <Text style={styles.cardDescription}>
          Remember to stay hydrated and maintain proper form during your workouts for maximum
          results!
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Your Stats</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🏋️‍♂️ Workouts: 12</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>🔥 Calories: 3,200</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>⏱ Avg Duration: 40 min</Text>
          </View>
        </View>
      </View>
    </Screen>
  )
}

// Option Card
const OptionCard = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  onPress: () => void
}) => (
  <TouchableOpacity style={styles.optionCard} activeOpacity={0.85} onPress={onPress}>
    <View style={styles.optionIcon}>{icon}</View>
    <View style={styles.optionTextContainer}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
)

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: "#0a0a0aff",
    flexGrow: 1,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f2f4f7ff",
    marginBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111ff",
  },
  optionsContainer: { gap: 14, marginBottom: 14 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(28, 28, 29, 1)",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#3B82F6",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  optionIcon: {
    width: 48,
    height: 48,
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTextContainer: { flex: 1 },
  optionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 4 },
  optionSubtitle: { color: "#ccccccff", fontSize: 13 },
  startWorkoutBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  startWorkoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "rgba(28, 28, 29, 1)",

    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F1F1F",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    flexShrink: 1,
  },
  startButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  cardDescription: {
    color: "#A1A1A1",
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    color: "#CBD5E1",
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#A1A1A1",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  exploreText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
})
