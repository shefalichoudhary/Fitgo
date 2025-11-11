import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, ScrollView, useColorScheme } from "react-native"
import { db } from "../utils/storage"
import { measurements } from "../utils/storage/schema"
import { desc } from "drizzle-orm"

type Measurement = {
  id: string
  userId?: string
  date: string | null
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null
  waist: number | null
  chest: number | null
  shoulders?: number | null
  neck?: number | null
  hips?: number | null
  leftArm?: number | null
  rightArm?: number | null
  leftThigh?: number | null
  rightThigh?: number | null
  leftCalf?: number | null
  rightCalf?: number | null
}

export default function MeasurementScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = getStyles(isDark)

  const [data, setData] = useState<Measurement[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await db.select().from(measurements).orderBy(desc(measurements.date))
        setData(result)
      } catch (error) {
        console.error("Error fetching measurements:", error)
      }
    }
    fetchData()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No date available"
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {data.length === 0 ? (
        <Text style={styles.empty}>No measurements yet</Text>
      ) : (
        data.map((m) => (
          <View key={m.id} style={styles.entry}>
            {/* Date outside the card */}
            <Text style={styles.date}>{formatDate(m.date)}</Text>

            {/* Measurement details card */}
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Weight:</Text>
                <Text style={styles.value}>{m.weight ? `${m.weight} kg` : "-"}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Body Fat:</Text>
                <Text style={styles.value}>{m.bodyFat ? `${m.bodyFat}%` : "-"}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Muscle Mass:</Text>
                <Text style={styles.value}>{m.muscleMass ? `${m.muscleMass} kg` : "-"}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Waist:</Text>
                <Text style={styles.value}>{m.waist ? `${m.waist} cm` : "-"}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Chest:</Text>
                <Text style={styles.value}>{m.chest ? `${m.chest} cm` : "-"}</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: isDark ? "#121212" : "#f9f9f9",
    },
  
    empty: {
      textAlign: "center",
      color: isDark ? "#aaa" : "#666",
      fontSize: 16,
      marginTop: 32,
    },
    entry: {
      marginBottom: 20,
    },
    date: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#90caf9" : "#007aff",
      marginBottom: 6,
      marginLeft: 4,
    },
    card: {
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    label: {
      color: isDark ? "#ccc" : "#444",
      fontSize: 15,
    },
    value: {
      color: isDark ? "#fff" : "#000",
      fontWeight: "600",
    },
  })
