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
   cancelIcon?: React.ReactNode;
  confirmIcon?: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  singleButtonIcon?: React.ReactNode;
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
  secondaryBtnStyle,
   cancelIcon,
  confirmIcon,
  secondaryIcon,
  singleButtonIcon,
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

    const ActionButton = ({
    onPress,
    style,
    textStyle,
    icon,
    text,
  }: {
    onPress: () => void;
    style: any;
    textStyle: any;
    icon?: React.ReactNode;
    text: string;
  }) => (
    <TouchableOpacity onPress={onPress} style={style}>
      <View style={styles.btnContent}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text style={textStyle}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  const showSecondary = !!onSecondary && !!secondaryText;

  
  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Pressable style={styles.pressableOverlay} onPress={onCancel}>
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>{message}</Text>

            {/* SINGLE BUTTON MODE */}
            {singleButton ? (
              <View style={styles.singleButtonWrap}>
                <ActionButton
                  onPress={onConfirm}
                  style={[styles.modalBtn, styles.singleBtn]}
                  textStyle={styles.singleBtnText}
                  icon={singleButtonIcon}
                  text={confirmText}
                />
              </View>
            ) : showSecondary && hideCancel ? (
              /* STACKED BUTTONS (no cancel) */
              <View style={styles.stackedActionsCenter}>
                <ActionButton
                  onPress={onConfirm}
                  style={[styles.modalBtn, styles.primaryBtn, styles.actionStackBtn]}
                  textStyle={styles.primaryText}
                  icon={confirmIcon}
                  text={confirmText}
                />

                <ActionButton
                  onPress={onSecondary!}
                  style={[
                    styles.modalBtn,
                    styles.secondaryBtn,
                    styles.actionStackBtn,
                    secondaryBtnStyle,
                  ]}
                  textStyle={styles.secondaryText}
                  icon={secondaryIcon}
                  text={secondaryText!}
                />
              </View>
            ) : (
              /* DEFAULT BUTTON BLOCK */
              <View style={styles.modalButtons}>
                {/* Cancel Button */}
                <ActionButton
                  onPress={onCancel}
                  style={[styles.modalBtn, styles.cancelBtn]}
                  textStyle={styles.cancelText}
                  icon={cancelIcon}
                  text={cancelText}
                />

                {/* Right Column (secondary + confirm or confirm alone) */}
                {showSecondary ? (
                  <View style={styles.actionsColumn}>
                    <ActionButton
                      onPress={onSecondary!}
                      style={[styles.modalBtn, styles.secondaryBtn, styles.actionFullWidth]}
                      textStyle={styles.secondaryText}
                      icon={secondaryIcon}
                      text={secondaryText!}
                    />

                    <ActionButton
                      onPress={onConfirm}
                      style={[styles.modalBtn, styles.primaryBtn, styles.actionFullWidth]}
                      textStyle={styles.primaryText}
                      icon={confirmIcon}
                      text={confirmText}
                    />
                  </View>
                ) : (
                  <ActionButton
                    onPress={onConfirm}
                    style={[styles.modalBtn, styles.primaryBtn]}
                    textStyle={styles.primaryText}
                    icon={confirmIcon}
                    text={confirmText}
                  />
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

/* --------------------------- STYLES --------------------------- */

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
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 14,
      color: isDark ? "#aaa" : "#555",
      marginBottom: 18,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginLeft: 8,
      
     },
    btnContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrap: {
      marginRight: 5,
      alignSelf: "center",
    },

    cancelBtn: { backgroundColor: "#2A2A2A", paddingHorizontal: 16 },
    cancelText: { color: "#fff", fontWeight: "600" },

    actionsColumn: {
      flexDirection: "column",
      alignItems: "stretch",
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
    singleBtnText: { color: "#fff", fontWeight: "700" },
  });

export default ConfirmModal;