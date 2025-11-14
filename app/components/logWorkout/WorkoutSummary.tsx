import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { formatDuration } from "@/utils/formatDuration"

export const WorkoutSummary = ({
  completedSets,
  totalSets,
  totalVolume,
  duration,
}: {
  completedSets: number
  totalSets: number
  totalVolume: number
  duration: number
}) => (
  <View style={styles.summaryCard}>
    <View style={styles.row}>
      <View style={styles.column}>
        <Text style={styles.label}>Sets</Text>
        <Text style={styles.value}>
          {completedSets}/{totalSets}
        </Text>
      </View>
      <View style={styles.column}>
        <Text style={styles.label}>Volume</Text>
        <Text style={styles.value}>{totalVolume} kg</Text>
      </View>
      <View style={styles.column}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{formatDuration(duration)}</Text>
      </View>
    </View>
  </View>
)

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  column: { alignItems: "center", flex: 1 },
  label: { color: "#aaa", fontSize: 13, fontWeight: "600", marginBottom: 4 },
  value: { color: "#fff", fontSize: 14, fontWeight: "700" },
})
