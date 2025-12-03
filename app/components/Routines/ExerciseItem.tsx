import React, { useState, useRef ,useEffect} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ConfirmModal } from "../ConfirmModal"
import { Audio } from "expo-av";

export const ExerciseItem = ({
  name,
  muscleGroup,
  onPress,
  isSelected,
  children,
  onDelete,
    disabled = false, 
}: {
  name?: string;
  muscleGroup?: string;
  onPress?: () => void;
  isSelected?: boolean;
  children?: React.ReactNode;
  onDelete?: () => void;
    disablePress?: boolean;
      disabled?: boolean  
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);
  const isSoundLoadedRef = useRef(false);


    // Preload the beep on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
           require("../../../assets/sounds/button-press.mp3"), // update path if different
          { shouldPlay: false }
        );
        if (!mounted) {
          // if unmounted while loading
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
        isSoundLoadedRef.current = true;
      } catch (err) {
        console.warn("Failed to load beep sound", err);
      }
    };

    load();
    return () => {
      mounted = false;
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
        } catch (e) {
          /* ignore unload errors */
        }
      })();
    };
  }, []);

  
  // play the preloaded sound (non-blocking)
  const playBeep = () => {
    try {
      if (isSoundLoadedRef.current && soundRef.current) {
        // replayFromPositionAsync ensures it starts from beginning
        soundRef.current.replayAsync().catch((err) => {
          // fallback: try playAsync if replayAsync unavailable
          soundRef.current?.playAsync().catch(() => {});
        });
      } else {
        // if not loaded, try a quick one-off play (best-effort)
        Audio.Sound.createAsync(require("../../../assets/sounds/button-press.mp3"))
          .then(({ sound }) => {
            sound.playAsync().finally(() => sound.unloadAsync().catch(() => {}));
          })
          .catch(() => {});
      }
    } catch (err) {
      console.warn("playBeep error", err);
    }
  };

  const openPopup = () => {
    setShowPopup(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closePopup = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setShowPopup(false));
  };

  const handleConfirmDelete = () => {
    closePopup();
    onDelete?.();
  };
  const Container = disabled ? View : TouchableOpacity;
  return (
       <Container
      activeOpacity={0.8}
     onPress={
  disabled
    ? undefined
    : () => {
        // Play only when selecting (not unselecting)
        if (!isSelected) {
          playBeep();
          Vibration.vibrate(30);
        }

        onPress && onPress();
      }
}
      style={[styles.card, isSelected && styles.selectedCard]}
    >
      <View style={styles.header}>
        <View>
          {name && <Text style={[styles.title, isSelected && styles.selectedText]}>{name}</Text>}
          {muscleGroup && <Text style={[styles.subtitle, isSelected && styles.selectedSubtitle]}>{muscleGroup}</Text>}
        </View>

        {onDelete && (
          <TouchableOpacity onPress={openPopup} style={styles.iconButton}>
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {children && <View style={styles.childrenContainer}>{children}</View>}

      {/* Delete confirmation popup */}
  <ConfirmModal
        visible={showPopup}
        title="Delete Exercise?"
        message="Are you sure you want to delete this exercise?"
        onCancel={closePopup}
        onConfirm={handleConfirmDelete}
        cancelText="Cancel"
        confirmText="Delete"
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedCard: { backgroundColor: "#4c4d4eff", shadowOpacity: 0.35 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#F9FAFB", fontSize: 16, fontWeight: "700" },
  subtitle: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  selectedText: { color: "#fff" },
  selectedSubtitle: { color: "#E0E7FF" },
  childrenContainer: { marginTop: 12, borderTopWidth: 1, borderTopColor: "#2A2A2A", paddingTop: 12 },
  iconButton: { padding: 4 },

  // Popup modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1F1F1F",
    padding: 24,
    borderRadius: 16,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: "#aaa", marginBottom: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  modalBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  cancelBtn: { backgroundColor: "#2A2A2A" },
  deleteBtn: { backgroundColor: "#EF4444" },
  cancelText: { color: "#fff", fontWeight: "600" },
  deleteText: { color: "#fff", fontWeight: "700" },
});
