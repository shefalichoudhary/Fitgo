import React, { useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing, useColorScheme } from "react-native"

type ConfirmModalProps = {
  visible: boolean
  title?: string
  message?: string
  onCancel: () => void
  onConfirm: () => void
  cancelText?: string
  confirmText?: string
   singleButton?: boolean
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title = "Confirm",
  message = "Are you sure?",
  onCancel,
  onConfirm,
  cancelText = "Cancel",
  confirmText = "Delete",
  singleButton = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const styles = getStyles(isDark)

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start()
    }
  }, [visible])

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalSubtitle}>{message}</Text>

          {singleButton ? (
            <View style={styles.singleButtonWrap}>
              <TouchableOpacity onPress={onConfirm} style={[styles.modalBtn, styles.singleBtn]}>
                <Text style={styles.singleBtnText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={onCancel} style={[styles.modalBtn, styles.cancelBtn]}>
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onConfirm} style={[styles.modalBtn, styles.deleteBtn]}>
                <Text style={styles.deleteText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    </Modal>
  )
}
const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: isDark ? "#1F1F1F" : "#fff",
      padding: 24,
      borderRadius: 16,
      width: "80%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: "700", color: isDark ? "#fff" : "#000", marginBottom: 8 },
    modalSubtitle: { fontSize: 14, color: isDark ? "#aaa" : "#555", marginBottom: 16 },
    modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
    modalBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
    cancelBtn: { backgroundColor: "#2A2A2A" },
    deleteBtn: { backgroundColor: "#EF4444" },
    cancelText: { color: "#fff", fontWeight: "600" },
    deleteText: { color: "#fff", fontWeight: "700" },
     /* Single-button layout */
    singleButtonWrap: { flexDirection: "row", justifyContent: "flex-end" },
    singleBtn: { paddingVertical: 10, paddingHorizontal: 26, borderRadius: 10, backgroundColor: "#3B82F6" },
    singleBtnText: { color: isDark ? "#fff" : "#fff", fontWeight: "700" },
  })
