import React from "react"
import { View, Text, StyleSheet } from "react-native"

export const WeekHeader = ({ title }: { title: string }) => (
  <View style={styles.headerContainer}>
    <Text style={styles.sectionHeader}>{title}</Text>
  </View>
)

const styles = StyleSheet.create({
  headerContainer: { marginTop: 10, marginBottom: 4 },
  sectionHeader: { fontSize: 18, fontWeight: "800", color: "#fff", marginBottom: 6 },
})
