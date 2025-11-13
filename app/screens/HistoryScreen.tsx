import React, { useEffect, useState } from "react"
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native"
import { startOfWeek, endOfWeek, format } from "date-fns"
import { Screen } from "@/components/Screen"
import { db } from "@/utils/storage" // assuming drizzle instance
import { workouts } from "@/utils/storage/schema" // your workout table
import { eq } from "drizzle-orm"

interface Workout {
  id: string
  date: string
  totalVolume: number
  totalSets: number
  title?: string
  duration?: number
}

type ListItem = { type: "header"; title: string } | (Workout & { type: "workout" })

const getWeekRange = (date: string) => {
  const current = new Date(date)
  const weekStart = startOfWeek(current, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(current, { weekStartsOn: 1 })
  return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await db.select().from(workouts).all()

        // 🧠 Map DB result to expected shape
        const formatted = result.map((w) => ({
          id: String(w.id), // ensure numeric ID
          date: w.date,
          totalVolume: w.volume,
          totalSets: w.sets,
          title: w.title,
          duration: w.duration,
        }))

        setHistory(formatted)
      } catch (error) {
        console.error("Error fetching workout history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`
    return `${Math.floor(seconds / 3600)} hr ${Math.floor((seconds % 3600) / 60)} min`
  }

  if (loading) {
    return (
      <Screen preset="fixed">
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3d84f7" />
          <Text style={styles.loadingText}>Loading workout history...</Text>
        </View>
      </Screen>
    )
  }

  if (!history.length) {
    return (
      <Screen preset="fixed">
        <View style={styles.center}>
          <Text style={styles.emptyText}>No workout history yet 💪</Text>
          <Text style={styles.subText}>Start your first workout to see progress here.</Text>
        </View>
      </Screen>
    )
  }

  // Group workouts by week
  const groupedData = history.reduce((groups: any, workout) => {
    const week = getWeekRange(workout.date)
    if (!groups[week]) groups[week] = []
    groups[week].push(workout)
    return groups
  }, {})

  const flatData: ListItem[] = []
  Object.keys(groupedData).forEach((week) => {
    flatData.push({ type: "header", title: week })
    groupedData[week].forEach((workout: Workout) => flatData.push({ ...workout, type: "workout" }))
  })

  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      <FlatList
        data={flatData}
        keyExtractor={(item, index) =>
          item.type === "header" ? `header-${index}` : `workout-${item.id || index}`
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return <Text style={styles.sectionHeader}>{item.title}</Text> // ✅ correct
          }

          return (
            <View style={styles.card}>
              <Text style={styles.dateText}>{format(new Date(item.date), "MMM d, yyyy")}</Text>
              {item.title && <Text style={styles.titleText}>{item.title}</Text>}
              <View style={styles.row}>
                <Text style={styles.stat}>💪 Volume: {item.totalVolume} kg</Text>
                <Text style={styles.stat}>📝 Sets: {item.totalSets}</Text>
              </View>
              {item.duration ? (
                <Text style={styles.duration}>⏱ Duration: {formatDuration(item.duration)}</Text>
              ) : null}
            </View>
          )
        }}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: "#3d84f7",
    color: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
  },
  titleText: {
    fontSize: 15,
    color: "#fff",
    marginBottom: 4,
  },
  duration: {
    fontSize: 13,
    color: "#aaa",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#262626",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    fontSize: 14,
    color: "#ccc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#ccc",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  subText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
  },
})
