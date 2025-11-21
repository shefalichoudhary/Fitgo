import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

export const EmptyRoutineState = () => (
  <View style={styles.container}>
    <Ionicons name="barbell-outline" size={50} color="#6B7280" style={{ marginBottom: 4 }} />
    <Text style={styles.text}>No exercises added yet</Text>
    <Text style={styles.subText}>Tap “Add Exercise” below to start building your routine.</Text>
  </View>
)

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  text: { color: "#9CA3AF", fontSize: 18, fontWeight: "600", marginBottom: 4 },
  subText: { color: "#6B7280", fontSize: 14, textAlign: "center", maxWidth: "80%", lineHeight: 20 },
})
