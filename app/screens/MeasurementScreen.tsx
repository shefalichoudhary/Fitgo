import React, { useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native"
import { db } from "../utils/storage"
import { desc, sql } from "drizzle-orm"
import { measurements } from "../utils/storage/schema"
import { ConfirmModal } from "../components/ConfirmModal"
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { Measurement } from "../../types/Measurement"

export default function MeasurementScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = getStyles(isDark)

  const [data, setData] = useState<Measurement[]>([])
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<Measurement | null>(null)

  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const fetchMeasurements = async () => {
    try {
      const result = await db
        .select()
        .from(measurements)
        .orderBy(desc(measurements.date))
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
    if (!dateString) return "No date"
    const date = new Date(dateString)
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

const metrics = [
  {
    key: "weight",
    label: "Weight",
    icon: "weight-kilogram",
    rightIcon: "scale-bathroom",
    unit: "kg",
  },
  {
    key: "bodyFat",
    label: "Body Fat",
    icon: "percent",
    rightIcon: "water-percent",
    unit: "%",
  },
  {
    key: "muscleMass",
    label: "Muscle Mass",
    icon: "dumbbell",
    rightIcon: "arm-flex",
    unit: "kg",
  },
 {
  key: "waist",
  label: "Waist",
  icon: "human-male-height",
  rightIcon: "ruler",
  unit: "cm",
},
{
  key: "chest",
  label: "Chest",
  icon: "human-male-height-variant",
  rightIcon: "ruler-square",
  unit: "cm",
},
]


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* EMPTY STATE */}
      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="barbell-outline"
            size={80}
            color={isDark ? "#6CA0DC" : "#3B82F6"}
            style={{ marginBottom: 20 }}
          />
          <Text style={styles.emptyTitle}>No Measurements Yet</Text>
          <Text style={styles.emptyText}>
            Track your body stats to monitor progress.
            Add your first measurement to get started!
          </Text>
        </View>
      ) : (
        data.map((m) => (
          <TouchableOpacity
            key={m.id}
            activeOpacity={0.9}
            onLongPress={() => handleLongPress(m)}
          >
            <Animated.View
              style={[
                styles.card,
                {
                  transform: [
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.02],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* DATE HEADER */}
              <View style={styles.cardHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color="#60A5FA"
                />
                <Text style={styles.date}>{formatDate(m.date)}</Text>
              </View>

              {/* METRICS */}
            {metrics
  .filter(
    (metric) =>
      m[metric.key as keyof Measurement] !== null &&
      m[metric.key as keyof Measurement] !== undefined
  )
  .map((metric) => (
    <View key={metric.key} style={styles.metricRow}>
      <View style={styles.metricLeft}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons
            name={metric.icon as any}
            size={18}
            color="white"
          />
        </View>
        <Text style={styles.label}>{metric.label}</Text>
      </View>

      <Text style={styles.value}>
        {m[metric.key as keyof Measurement]} {metric.unit}
      </Text>
    </View>
  ))}
{m.notes ? (
  <View style={styles.notesBox}>
    <Ionicons name="chatbubble-ellipses-outline" size={14} color="#93C5FD" />
    <Text style={styles.notesText}>{m.notes}</Text>
  </View>
) : null}
            </Animated.View>
          </TouchableOpacity>
        ))
      )}

      {/* CONFIRM DELETE */}
      <ConfirmModal
        visible={!!selectedMeasurement}
        title="Delete Measurement?"
        message="Are you sure you want to delete this measurement?"
        onCancel={closePopup}
        onConfirm={() =>
          selectedMeasurement && handleDelete(selectedMeasurement.id)
        }
      />
    </ScrollView>
  )
}

/* ───────── STYLES ───────── */

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      padding: 16,
      paddingBottom: 40,
      backgroundColor: "#000000",
    },

    /* EMPTY */
    emptyContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 90,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: "#FFFFFF",
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 15,
      color: "#9CA3AF",
      textAlign: "center",
      lineHeight: 22,
    },

    /* CARD */
    card: {
      backgroundColor: "rgba(28, 28, 29, 1)",
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.08)",
      shadowColor: "#000",
      shadowOpacity: 0.35,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 14,
      elevation: 10,
    },

    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 8,
    },

    date: {
      fontSize: 13,
      fontWeight: "600",
      color: "#93C5FD",
    },

    /* METRICS */
    metricRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#1E293B",
    },

    metricLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    iconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },

    label: {
      fontSize: 15,
      fontWeight: "500",
      color: "#CBD5E1",
    },

    value: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    notesBox: {
  marginTop: 12,
  backgroundColor: "#1F2937",
  padding: 12,
  borderRadius: 12,
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 8,
},

notesText: {
  color: "#CBD5E1",
  fontSize: 13,
  flex: 1,
  lineHeight: 18,
},
  })
