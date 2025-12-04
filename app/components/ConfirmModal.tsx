// components/ConfirmModal.tsx
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  useColorScheme,
  Pressable,
  StyleProp,
  ViewStyle
} from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
  onSecondary?: () => void;
  cancelText?: string;
  confirmText?: string;
  singleButton?: boolean;
  secondaryText?: string;
  secondaryBtnStyle?: StyleProp<ViewStyle>;
  /**
   * When true and a secondary action is present, do NOT render the Cancel button.
   * Instead render the two action buttons stacked (secondary above primary).
   */
  hideCancel?: boolean;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title = "Confirm",
  message = "Are you sure?",
  onCancel,
  onConfirm,
  onSecondary,
  cancelText = "Cancel",
  confirmText = "Delete",
  singleButton = false,
  secondaryText,
  hideCancel = false,
  secondaryBtnStyle
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const styles = getStyles(isDark);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const showSecondary = !!onSecondary && !!secondaryText;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      {/* Pressable overlay: tapping here closes the modal */}
      <Pressable style={styles.pressableOverlay} onPress={onCancel}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          {/* The inner container must capture touches so overlay press doesn't fire when tapping inside */}
          <View
            style={styles.modalContainer}
            // consume touches inside modal so outer Pressable won't receive them
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>{message}</Text>

            {singleButton ? (
              <View style={styles.singleButtonWrap}>
                <TouchableOpacity onPress={onConfirm} style={[styles.modalBtn, styles.singleBtn]}>
                  <Text style={styles.singleBtnText}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            ) : showSecondary && hideCancel ? (
              // NO Cancel: show two buttons stacked centered (secondary above primary)
              <View style={styles.stackedActionsCenter}>
                 <TouchableOpacity
                  onPress={onConfirm}
                  style={[styles.modalBtn, styles.primaryBtn, styles.actionStackBtn]}
                >
                  <Text style={styles.primaryText}>{confirmText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onSecondary}
                  style={[styles.modalBtn, styles.secondaryBtn, styles.actionStackBtn,    secondaryBtnStyle,]}
                >
                  <Text style={styles.secondaryText}>{secondaryText}</Text>
                </TouchableOpacity>

               
              </View>
            ) : (
              // Default: Cancel on left, actions on right (actions possibly stacked)
              <View style={styles.modalButtons}>
                {/* Cancel (hidden only if hideCancel && showSecondary was handled above) */}
                <TouchableOpacity onPress={onCancel} style={[styles.modalBtn, styles.cancelBtn]}>
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>

                {/* If there's a secondary action, render stacked actions column */}
                {showSecondary ? (
                  <View style={styles.actionsColumn}>
                    <TouchableOpacity
                      onPress={onSecondary}
                      style={[styles.modalBtn, styles.secondaryBtn, styles.actionFullWidth,]}
                    >
                      <Text style={styles.secondaryText}>{secondaryText}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onConfirm}
                      style={[styles.modalBtn, styles.primaryBtn, styles.actionFullWidth]}
                    >
                      <Text style={styles.primaryText}>{confirmText}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // No secondary: show only primary button on right
                  <TouchableOpacity
                    onPress={onConfirm}
                    style={[styles.modalBtn, styles.primaryBtn]}
                  >
                    <Text style={styles.primaryText}>{confirmText}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    pressableOverlay: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: isDark ? "#1F1F1F" : "#fff",
      padding: 20,
      borderRadius: 14,
      width: "84%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 6,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: isDark ? "#fff" : "#000",
      marginBottom: 8,
    },
    modalSubtitle: { fontSize: 14, color: isDark ? "#aaa" : "#555", marginBottom: 18 },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8 },
    cancelBtn: { backgroundColor: "#2A2A2A", paddingHorizontal: 16 },
    cancelText: { color: "#fff", fontWeight: "600" },
    actionsColumn: {
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "center",
    },
    actionFullWidth: {
      minWidth: 160,
      marginBottom: 8,
    },
    secondaryBtn: { backgroundColor: isDark ? "#334155" : "#E5E7EB" },
    secondaryText: { color: isDark ? "#fff" : "#111827", fontWeight: "600", textAlign: "center" },
    primaryBtn: { backgroundColor: "#3B82F6" },
    primaryText: { color: "#fff", fontWeight: "700", textAlign: "center" },
    stackedActionsCenter: {
      flexDirection: "column",
      alignItems: "stretch",
      justifyContent: "center",
    },
    actionStackBtn: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginBottom: 10,
    },
    singleButtonWrap: { flexDirection: "row", justifyContent: "flex-end" },
    singleBtn: {
      paddingVertical: 10,
      paddingHorizontal: 26,
      borderRadius: 10,
      backgroundColor: "#3B82F6",
    },
    singleBtnText: { color: isDark ? "#fff" : "#fff", fontWeight: "700" },
  });

export default ConfirmModal;
