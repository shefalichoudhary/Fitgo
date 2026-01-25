// components/MeasurementCard.tsx
import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { MetricRow } from "./MetricRow"
import { Measurement } from "../../../types/Measurement"

type Props = {
  item: Measurement
  onLongPress: () => void
  onEdit: () => void
  scaleAnim: Animated.AnimatedInterpolation<number>
  metrics: any[]
  formatDate: (date: string | null) => string
}

export function MeasurementCard({
  item,
  onLongPress,
  onEdit,
  scaleAnim,
  metrics,
  formatDate,
}: Props) {
  return (
    <TouchableOpacity activeOpacity={0.9} onLongPress={onLongPress}>
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color="#60A5FA" />
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>

          {/* EDIT ICON */}
          <TouchableOpacity onPress={onEdit} hitSlop={10}>
            <Ionicons name="pencil-outline" size={18} color="#93C5FD" />
          </TouchableOpacity>
        </View>

        {/* METRICS */}
        {metrics
          .filter((m) => item[m.key as keyof Measurement] != null)
          .map((m) => (
            <MetricRow
              key={m.key}
              icon={m.icon}
              label={m.label}
              value={item[m.key as keyof Measurement] as any}
              unit={m.unit}
            />
          ))}

        {/* NOTES */}
        {item.notes && (
          <View style={styles.notes}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={14}
              color="#93C5FD"
            />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1C1C1D",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 13,
    fontWeight: "600",
    color: "#93C5FD",
  },
  notes: {
    marginTop: 12,
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
  },
  notesText: {
    color: "#CBD5E1",
    fontSize: 13,
    flex: 1,
  },
})
