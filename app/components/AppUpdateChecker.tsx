// AppUpdateChecker.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  AppStateStatus,
  View,
  Modal,
  Text,
  Alert,
  TouchableOpacity,
  ActivityIndicator as RNActivityIndicator,
  StyleSheet,
} from "react-native";
import * as Updates from "expo-updates";

export default function AppUpdateChecker({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const promptedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const check = async () => {
      try {
        console.log("[Update] checking for update...");
        setChecking(true);
        const res = await Updates.checkForUpdateAsync();
        console.log("[Update] checkForUpdateAsync result:", res);
        if (!mountedRef.current) return;

        if (res.isAvailable && !promptedRef.current) {
          promptedRef.current = true;
          setShowPrompt(true);
        }
      } catch (e) {
        console.warn("[Update] check error:", e);
      } finally {
        if (mountedRef.current) setChecking(false);
      }
    };

    // initial check
    check();

    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") {
        check();
      }
    });

    return () => {
      mountedRef.current = false;
      sub.remove();
    };
  }, []);

  const applyUpdate = async () => {
    if (fetching) return;
    setFetching(true);
    try {
      console.log("[Update] fetching update...");
      const update = await Updates.fetchUpdateAsync();
      console.log("[Update] fetchUpdateAsync result:", update);
      if (update.isNew) {
        await Updates.reloadAsync();
      } else {
        Alert.alert("Up-to-date", "No new changes found after download.");
        setShowPrompt(false);
        promptedRef.current = false;
      }
    } catch (e) {
      console.warn("[Update] fetch/apply failed:", e);
      Alert.alert("Update failed", "Could not download update. Please try later.");
      setShowPrompt(false);
      promptedRef.current = false;
    } finally {
      setFetching(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {children}

      <Modal
        visible={showPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrompt(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Update available</Text>
            <Text style={styles.message}>
              A new update is available. Would you like to download and apply it now?
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => setShowPrompt(false)}
                activeOpacity={0.7}
                style={[styles.button, styles.buttonOutline]}
              >
                <Text style={[styles.buttonText, styles.outlineText]}>Later</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={applyUpdate}
                activeOpacity={0.75}
                style={[
                  styles.button,
                  styles.buttonPrimary,
                  fetching && styles.buttonDisabled,
                  { marginLeft: 8 },
                ]}
                disabled={fetching}
              >
                {fetching ? (
                  <RNActivityIndicator />
                ) : (
                  <Text style={[styles.buttonText, styles.primaryText]}>Yes, update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalCard: {
    width: 320,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    // shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    // elevation for Android
    elevation: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  message: {
    marginBottom: 16,
    color: "#222",
  },
  actions: {
    flexDirection: "row", // type-safe literal
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    minWidth: 100,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: "#1E90FF",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryText: {
    color: "white",
  },
  outlineText: {
    color: "#333",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
