import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

type ExerciseItemProps = {
  name: string
  muscleGroup: string
  onPress?: () => void
  isSelected?: boolean // ✅ supports multi-select
}

export const ExerciseItem = ({
  name,
  muscleGroup,
  onPress,
  isSelected = false,
}: ExerciseItemProps) => {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.leftSection}>
        <Text style={styles.nameText}>{name}</Text>
      </View>
      <Text style={styles.groupText}>{muscleGroup}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#111010ff", // dark card background
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2A2A2A", // subtle border
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  itemContainerSelected: {
    backgroundColor: "#444242ff", // slightly brighter on selection
    borderColor: "#202020ff", // accent blue border
  },
  leftSection: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF", // bright text for dark mode
  },
  groupText: {
    fontSize: 14,
    color: "#AAAAAA", // dimmed secondary text
  },
})
