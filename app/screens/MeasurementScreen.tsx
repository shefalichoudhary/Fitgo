import React, { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
} from "react-native"
import { db } from "../utils/storage"
import { desc } from "drizzle-orm"
import { measurements } from "../utils/storage/schema"
import { sql } from "drizzle-orm"
import { ConfirmModal } from "../components/ConfirmModal"
type Measurement = {
  id: string
  date: string | null
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null
  waist: number | null
  chest: number | null
}

export default function MeasurementScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = getStyles(isDark)
  const [data, setData] = useState<Measurement[]>([])
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const fetchMeasurements = async () => {
    try {
      const result = await db.select().from(measurements).orderBy(desc(measurements.date))
      setData(result)
    } catch (error) {
      console.error("Error fetching measurements:", error)
    }
  }

  const handleLongPress = (m: Measurement) => {
    setSelectedMeasurement(m)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  const closePopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setSelectedMeasurement(null))
  }
  const handleDelete = async (id: string) => {
    try {
      await db.delete(measurements).where(sql`${measurements.id} = ${id}`)
      setData((prev) => prev.filter((m) => m.id !== id))
      closePopup()
    } catch (error) {
      console.error("Failed to delete measurement:", error)
    }
  }
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
          <TouchableOpacity key={m.id} onLongPress={() => handleLongPress(m)}>
            <View style={styles.entry}>
              <Text style={styles.date}>{formatDate(m.date)}</Text>
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
          </TouchableOpacity>
        ))
      )}

      {/* Delete Confirmation Modal */}
        <ConfirmModal
  visible={!!selectedMeasurement}
  title="Delete Measurement?"
  message="Are you sure you want to delete this measurement?"
  onCancel={closePopup}
  onConfirm={() => selectedMeasurement && handleDelete(selectedMeasurement.id)}
/>
    </ScrollView>
  )
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { padding: 16, backgroundColor: isDark ? "#121212" : "#f9f9f9" },
    empty: { textAlign: "center", color: isDark ? "#aaa" : "#666", fontSize: 16, marginTop: 32 },
    entry: { marginBottom: 20 },
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
    row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { color: isDark ? "#ccc" : "#444", fontSize: 15 },
    value: { color: isDark ? "#fff" : "#000", fontWeight: "600" },
   
    
  })
