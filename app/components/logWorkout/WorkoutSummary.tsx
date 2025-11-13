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
  <View style={styles.summary}>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Sets</Text>
      <Text style={styles.summaryLabel}>Volume</Text>
      <Text style={styles.summaryLabel}>Duration</Text>
    </View>

    <View style={styles.summaryRow}>
      <Text style={styles.summaryValue}>
        {completedSets}/{totalSets}
      </Text>
      <Text style={styles.summaryValue}>{totalVolume} kg</Text>
      <Text style={styles.summaryValue}>{formatDuration(duration)}</Text>
    </View>
  </View>
)

const styles = StyleSheet.create({
  summary: { marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-evenly", marginBottom: 4 },
  summaryLabel: { color: "#aaa", fontSize: 13, fontWeight: "600", flex: 1, textAlign: "center" },
  summaryValue: { color: "#fff", fontSize: 14, fontWeight: "700", flex: 1, textAlign: "center" },
})
