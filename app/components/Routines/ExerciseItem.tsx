import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import Sound from "react-native-sound"


export const ExerciseItem = ({
  name,
  muscleGroup,
  onPress,
  isSelected,
  children,
}: {
  name?: string
  muscleGroup?: string
  onPress?: () => void
  isSelected?: boolean
  children?: React.ReactNode
}) => {
 
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.card,
        isSelected ? styles.selectedCard : null,
      ]}
    >
      {name && <Text style={styles.title}>{name}</Text>}
      {muscleGroup && <Text style={styles.subtitle}>{muscleGroup}</Text>}
      {children && <View style={{ marginTop: 8 }}>{children}</View>}
    </TouchableOpacity>
  )
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: "#000000ff", // default black
    borderRadius: 10,
    padding: 16,
    marginBottom: 8,
  },
  selectedCard: {
    backgroundColor: "#2b2b2bff", // white background when selected
  },
  title: {
    color: "#fff", // default text color
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
  },
  selectedText: {
    color: "#000", // title color when selected
  },
  selectedSubtitle: {
    color: "#555", // subtitle color when selected
  },
})