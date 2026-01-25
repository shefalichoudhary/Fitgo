// components/MetricRow.tsx
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"

type Props = {
  icon: string
  label: string
  value: string | number
  unit?: string
}

export function MetricRow({ icon, label, value, unit }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={icon as any} size={18} color="#fff" />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.value}>
        {value} {unit}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  left: {
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
    backgroundColor: "#3B82F6",
  },
  label: {
    fontSize: 15,
    color: "#CBD5E1",
  },
  value: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
})
