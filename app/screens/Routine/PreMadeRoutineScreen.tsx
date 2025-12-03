import React, { useEffect, useState } from "react"
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native"
import { db } from "@/utils/storage"
import { routines } from "@/utils/storage/schema"
import { eq } from "drizzle-orm"
import { seedPreMadeRoutines } from "@/utils/storage/SeedPreMadeRoutines"
import { Screen } from "@/components/Screen"
import LoadingOverlay from "@/components/LoadingOverlay"

export default function PremadeRoutineScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [routineList, setRoutineList] = useState<any[]>([])

  useEffect(() => {
    const fetchPreMadeRoutines = async () => {
      try {
        await seedPreMadeRoutines()
        const result = await db.select().from(routines).where(eq(routines.isPreMade, 1))
        setRoutineList(result)
      } catch (error) {
        console.error("Error fetching pre-made routines:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreMadeRoutines()
  }, [])

  const renderRoutineCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("RoutineDetails", { id: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => {
            // Navigate to workout screen or start workout logic
            navigation.navigate("Log Workout" as any, { routineId: item.id })
          }}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.cardDescription} numberOfLines={2}>
        {item.description || "No description available."}
      </Text>

      <View style={styles.tagsContainer}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>💪 {item.targetMuscle || "Full Body"}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>🔥 {item.difficulty || "Intermediate"}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>⏱ {item.duration || "30 min"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <Screen style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
            <LoadingOverlay visible={loading} message="Loading pre-made routines..." />
      </Screen>
    )
  }

  return (
    <Screen style={styles.container}>
      {routineList.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💪</Text>
          <Text style={styles.emptyTitle}>No Pre-Made Routines Found</Text>
          <Text style={styles.emptySubtitle}>
            Explore and add new pre-made workouts to jumpstart your fitness journey.
          </Text>
        </View>
      ) : (
        <FlatList
          data={routineList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRoutineCard}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#000000ff",
  },
  card: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
