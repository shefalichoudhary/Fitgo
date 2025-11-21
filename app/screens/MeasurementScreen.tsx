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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeStackParamList } from "../navigators/navigationTypes"
import { RouteProp,useRoute } from "@react-navigation/native"
import { Measurement } from "../../types/Measurement"


export default function MeasurementScreen() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = getStyles(isDark)
  const [data, setData] = useState<Measurement[]>([])
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current
const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
const route = useRoute<RouteProp<HomeStackParamList, "AddMeasurement">>();
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
  const metrics = [
    { key: "weight", label: "Weight", icon: "weight-kilogram", unit: "kg" },
    { key: "bodyFat", label: "Body Fat", icon: "percent", unit: "%" },
    { key: "muscleMass", label: "Muscle Mass", icon: "dumbbell", unit: "kg" },
    { key: "waist", label: "Waist", icon: "human-male-height", unit: "cm" },
    { key: "chest", label: "Chest", icon: "human-male-height-variant", unit: "cm" },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            Track your body stats to monitor progress. Add your first measurement to get started!
          </Text>
         
        </View>
      ) : (
        data.map((m) => (
          <TouchableOpacity key={m.id} onLongPress={() => handleLongPress(m)} activeOpacity={0.8}>
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
                 <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={styles.date}>{formatDate(m.date)}</Text>

            {/* EDIT ICON */}
            {/* <TouchableOpacity
              onPress={() => navigation.navigate("AddMeasurement", { editData: m })
}
            >
              <Ionicons name="create-outline" size={22} color="#3B82F6" />
            </TouchableOpacity> */}
          </View>
              {metrics.map((metric) => (
                <View key={metric.key} style={styles.row}>
                  <View style={styles.rowLabel}>
                    <MaterialCommunityIcons
                      name={metric.icon as any}
                      size={20}
                      color="#3B82F6"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.label}>{metric.label}:</Text>
                  </View>
                  <Text style={styles.value}>
                    {m[metric.key as keyof Measurement] !== null
                      ? `${m[metric.key as keyof Measurement]} ${metric.unit}`
                      : "-"}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </TouchableOpacity>
        ))
      )}

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
    container: {
      padding: 16,
      paddingBottom: 32,
        backgroundColor: "#000000ff",
    },
    emptyContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 80,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: isDark ? "#FFFFFF" : "#111827",
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? "#CCCCCC" : "#6B7280",
      textAlign: "center",
      marginBottom: 20,
    },
    addButton: {
      backgroundColor: "#3B82F6",
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 30,
    },
    addButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    card: {
      backgroundColor: "#1f1f1f",
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 10,
      elevation: 6,
    },
    date: {
      fontSize: 14,
      fontWeight: "600",
      color: isDark ? "#80CFFF" : "#1E40AF",
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      alignItems: "center",
    },
    rowLabel: {
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      fontSize: 15,
      fontWeight: "500",
      color: isDark ? "#CCCCCC" : "#4B5563",
    },
    value: {
      fontSize: 15,
      fontWeight: "600",
      color: isDark ? "#FFFFFF" : "#111827",
    },
  })
