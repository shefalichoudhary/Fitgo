import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Easing,
} from "react-native"
import { RenderItemParams } from "react-native-draggable-flatlist"
import { Ionicons } from "@expo/vector-icons"
import type { RoutineWithExercises } from "../../../hooks/useRoutines"
import { useNavigation } from "@react-navigation/native"

type RoutineCardProps = RenderItemParams<RoutineWithExercises> & {
  onDelete?: (id: string) => void
  onDuplicate?: (item: RoutineWithExercises) => void
  onStartWorkout?: (id: string) => void
}

export const RoutineCard = ({
  item,
  drag,
  isActive,
  onDelete,
  onDuplicate,
  onStartWorkout,
}: RoutineCardProps) => {
  const [showPopup, setShowPopup] = useState(false)
  const slideAnim = useRef(new Animated.Value(300)).current // starts off-screen
  const navigation = useNavigation<any>()
  useEffect(() => {
    if (showPopup) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start()
    }
  }, [showPopup])

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
            onPress={() => {
              // Navigate to workout screen or start workout logic
              navigation.navigate("Log Workout" as any, { routineId: item.id })
            }}
          >
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPopup(true)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </Pressable>

      <Modal
  visible={showPopup}
  transparent
  animationType="fade"
  onRequestClose={() => setShowPopup(false)}
>
  <TouchableWithoutFeedback onPress={() => setShowPopup(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback>
        <Animated.View style={[styles.modalCard, { transform: [{ scale: showPopup ? 1 : 0.8 }] }]}>
          {/* Header */}
          <Text style={styles.modalTitle}>{item.title}</Text>
          <Text style={styles.modalSubtitle}>{item.exercises.length} exercises</Text>

          {/* Buttons */}
          <Pressable
            style={({ pressed }) => [
              styles.modalButton,
              { backgroundColor: pressed ? "#4B5563" : "#374151" },
            ]}
            onPress={() => {
              onDuplicate?.(item);
              setShowPopup(false);
            }}
          >
            <Ionicons name="copy-outline" size={20} color="#fff" style={{ marginRight: 12 }} />
            <Text style={styles.modalButtonText}>Duplicate</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.modalButton,
              { backgroundColor: pressed ? "#991B1B" : "#B91C1C" },
            ]}
            onPress={() => {
              onDelete?.(item.id);
              setShowPopup(false);
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" style={{ marginRight: 12 }} />
            <Text style={styles.modalButtonText}>Delete</Text>
          </Pressable>

          {/* Cancel */}
          <TouchableOpacity
            style={styles.modalCancel}
            onPress={() => setShowPopup(false)}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center" },
  startButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  startButtonText: { color: "#fff", fontWeight: "600" },
  menuButton: { padding: 4 },

 modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 20,
},
modalCard: {
  backgroundColor: "#181818ff", // slightly lighter than card
  borderRadius: 16,
  padding: 24,
  width: "100%",
  maxWidth: 320,
  alignItems: "center",
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 12,
},
modalTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#fff",
  marginBottom: 4,
  textAlign: "center",
},
modalSubtitle: {
  fontSize: 14,
  color: "#9CA3AF",
  marginBottom: 20,
  textAlign: "center",
},
modalButton: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 12,
  width: "100%",
  justifyContent: "flex-start",
  marginBottom: 12,
},
modalButtonText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 16,
},
modalCancel: {
  marginTop: 8,
  paddingVertical: 10,
  paddingHorizontal: 24,
},
modalCancelText: {
  color: "#9CA3AF",
  fontWeight: "600",
  fontSize: 16,
},

})
