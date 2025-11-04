import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@/theme/colors";

type ExerciseItemProps = {
  name: string;
  muscleGroup: string;
  onPress?: () => void;
  isSelected?: boolean; // ✅ Add this to support multi-select
};

export const ExerciseItem = ({ name, muscleGroup, onPress, isSelected = false }: ExerciseItemProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        isSelected && styles.itemContainerSelected, // ✅ Update styles if selected
      ]}
      onPress={onPress}
    >
      <View style={styles.leftSection}>
        <Text style={styles.nameText}>{name}</Text>
      </View>
      <Text style={styles.groupText}>{muscleGroup}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.palette.neutral800,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemContainerSelected: {
    backgroundColor: colors.palette.neutral700,
    borderColor: colors.tint,
  },
  leftSection: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
  },
  groupText: {
    fontSize: 14,
    color: colors.textDim,
  },
});
