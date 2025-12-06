// components/RoutineCard.tsx  (updated snippet)
import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, TouchableOpacity, StyleSheet } from "react-native";
import { RenderItemParams } from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";
import type { RoutineWithExercises } from "../../../hooks/useRoutines";
import { useNavigation } from "@react-navigation/native";
import ConfirmModal from "../ConfirmModal"; // default export in your file
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type RoutineCardProps = RenderItemParams<RoutineWithExercises> & {
  onDelete?: (id: string) => void;
  onDuplicate?: (item: RoutineWithExercises) => void;
  onStartWorkout?: (id: string) => void;
};

export const RoutineCard = ({ item, drag, isActive, onDelete, onDuplicate }: RoutineCardProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"duplicate" | "delete" | null>(null);
  const navigation = useNavigation<any>();

  const openMenu = () => {
    setPendingAction(null);
    setShowConfirm(true);
  };

  const closeMenu = () => {
    setShowConfirm(false);
    setPendingAction(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onLongPress={drag}
        delayLongPress={200}
        onPress={() => navigation.navigate("RoutineDetails", { id: item.id })}
        style={[styles.card, isActive && { backgroundColor: "#2a2a2a" }]}
      >
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.exercises.length} exercises</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => navigation.navigate("Log Workout" as any, { routineId: item.id })}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Pressable>

      <ConfirmModal
        visible={showConfirm}
        title={item.title}
        message={
          `${item.exercises.length} exercises\n\n` +
          `Duplicate → Creates an identical copy.\n` +
          `Delete → Removes this routine permanently.`
        }
        onCancel={closeMenu} // will close
        onConfirm={() => {
          setShowConfirm(false);
          onDuplicate?.(item);
        }}
        confirmText="Duplicate"
        onSecondary={() => {
          setShowConfirm(false);
          onDelete?.(item.id);
        }}
        secondaryText="Delete"
        secondaryBtnStyle={{ backgroundColor: "#d81727" }}
        hideCancel={true}
         confirmIcon={<MaterialCommunityIcons name="content-duplicate" size={24} color="white" />}
  secondaryIcon={<MaterialCommunityIcons name="delete-outline" size={24} color="white" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#9CA3AF", fontSize: 13, },
  actions: { flexDirection: "row", alignItems: "center" },
  startButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 1,
  },
  startButtonText: { color: "#fff", fontWeight: "500", fontSize: 16 },
  menuButton: { padding: 4 },
});
