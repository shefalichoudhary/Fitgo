import React from "react";
import {
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  StyleSheet,
  Platform,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  currentSetType: "Normal" | "Warmup" | "Failure";
  onClose: () => void;
  onSelectType: (type: "Normal" | "Warmup" | "Failure") => void;
  onDelete: () => void;
};

const SET_TYPES = [
  { key: "Normal", short: "N", label: "Normal", color: "#ffffff" },
  { key: "Warmup", short: "W", label: "Warmup", color: "#facc15" },
  { key: "Failure", short: "F", label: "Failure", color: "#ef4444" },
] as const;

export default function SetActionsModal({
  visible,
  currentSetType,
  onClose,
  onSelectType,
  onDelete,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>Set actions</Text>

            {SET_TYPES.map(({ key, short, label, color }) => {
              const isActive = currentSetType === key;

              return (
                <Pressable
                  key={key}
                  style={[
                    styles.row,
                    isActive && styles.rowActive,
                  ]}
                  onPress={() => onSelectType(key)}
                >
                  <View style={[styles.badge, { borderColor: color }]}>
                    <Text style={[styles.badgeText, { color }]}>{short}</Text>
                  </View>

                  <Text style={styles.label}>{label}</Text>
                </Pressable>
              );
            })}

            <Pressable style={[styles.row, styles.removeRow]} onPress={onDelete}>
              <Text style={styles.removeText}>Remove Set</Text>
            </Pressable>
          </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },

  sheet: {
    backgroundColor: "#000",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "black",
    paddingBottom: Platform.OS === "android" ? 55 : 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#e6eef8",
  },

  /* rows */
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: "#18191b",
  },

  /* badge */
  badge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  badgeText: {
    fontWeight: "800",
    fontSize: 14,
  },

  label: {
    fontSize: 15,
    color: "#e6eef8",
    fontWeight: "500",
  },

  /* remove */
  removeRow: {
    marginTop: 14,
    backgroundColor: "#2a0a0a",
    justifyContent: "center",
  },
  removeText: {
    textAlign: "center",
    color: "white",    fontWeight: "700",
    fontSize: 15,
  },
});
