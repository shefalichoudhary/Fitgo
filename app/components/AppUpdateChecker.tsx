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
  Platform,
} from "react-native";
import * as Updates from "expo-updates";
import AsyncStorage from "@react-native-async-storage/async-storage"; // add this dependency

const UPDATE_FLAG_KEY = "app:update:just_applied";

export default function AppUpdateChecker({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const promptedRef = useRef(false);
  const mountedRef = useRef(true);

  // simulated numeric progress 0..100 (used for percentage UI)
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const check = async () => {
      try {
        setChecking(true);
        const res = await Updates.checkForUpdateAsync();
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

    check();

    const sub = AppState.addEventListener("change", (state: AppStateStatus) => {
      if (state === "active") check();
    });

    return () => {
      mountedRef.current = false;
      sub.remove();
      stopSimulatedProgress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSimulatedProgress = () => {
    setProgressPercent(0);
    stopSimulatedProgress();

    progressIntervalRef.current = setInterval(() => {
      setProgressPercent((p) => {
        if (p >= 95) return 95;
        const inc = Math.floor(Math.random() * 4) + 1;
        return Math.min(95, p + inc);
      });
    }, 300) as unknown as number;
  };

  const stopSimulatedProgress = () => {
    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current as any);
      progressIntervalRef.current = null;
    }
  };

  const applyUpdate = async () => {
    if (fetching) return;
    setFetching(true);

    // Start simulated progress so user sees movement
    startSimulatedProgress();

    try {
      const update = await Updates.fetchUpdateAsync();

      // Snap to 100% when fetch finishes
      stopSimulatedProgress();
      setProgressPercent(100);

      // ——— NEW: ensure the completed UI is visible for at least MIN_VISIBLE ms ———
      const MIN_VISIBLE = 1200; // ms
      await new Promise((r) => setTimeout(r, MIN_VISIBLE));

      if (update.isNew) {
        // set a flag so the app (after reload) can show a toast/notification
        try {
          await AsyncStorage.setItem(UPDATE_FLAG_KEY, "1");
        } catch (err) {
          console.warn("Failed to write update flag:", err);
        }

        // restart to apply update (this restarts the app)
        await Updates.reloadAsync();
        return; // reloadAsync restarts the app
      } else {
        // no new update after fetch
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
      stopSimulatedProgress();
      setFetching(false);
      // reset percent for next time
      setTimeout(() => {
        if (!mountedRef.current) return;
        setProgressPercent(0);
      }, 300);
    }
  };

  const percentText = `${Math.round(progressPercent)}%`;

  return (
    <View style={{ flex: 1 }}>
      {children}

      <Modal
        visible={showPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!fetching) setShowPrompt(false);
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Update available</Text>
            <Text style={styles.message}>
              A new update is available. Would you like to download and apply it now?
            </Text>

            {fetching ? (
              <>
                <View style={styles.ringRow}>
                  <View style={styles.ring}>
                    <RNActivityIndicator size="large" />
                  </View>

                  <View style={styles.percentWrap}>
                    <Text style={styles.percentText}>{percentText}</Text>
                    <Text style={styles.percentSub}>Downloading</Text>
                  </View>
                </View>

                <View style={styles.progressBox}>
                  <View style={styles.progressTrackBackground}>
                    <View style={[styles.progressTrackFill, { width: `${progressPercent}%` }]} />
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.button, styles.buttonOutline, styles.buttonDisabled]}
                    disabled
                  >
                    <Text style={[styles.buttonText, styles.outlineText]}>Later</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={[styles.button, styles.buttonPrimary, styles.buttonDisabled, { marginLeft: 8 }]}
                    disabled
                  >
                    <Text style={[styles.buttonText, styles.primaryText]}>Updating…</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View>
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.messageSmall}>
                    Pressing <Text style={{ fontWeight: "700" }}>Yes, update</Text> will download the update and restart the app automatically.
                  </Text>
                </View>

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
                    style={[styles.button, styles.buttonPrimary, { marginLeft: 8 }]}
                    disabled={fetching}
                  >
                    <Text style={[styles.buttonText, styles.primaryText]}>Yes, update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
    width: 340,
    padding: 18,
    paddingBottom: 22,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  message: {
    marginBottom: 12,
    color: "#222",
  },
  messageSmall: {
    color: "#444",
    fontSize: 13,
  },

  // ring + percent row
  ringRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12 as any,
    marginBottom: 12,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#e6eef8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  percentWrap: {
    flexDirection: "column",
  },
  percentText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f1724",
  },
  percentSub: {
    color: "#6b7280",
    fontSize: 12,
  },

  progressBox: {
    marginBottom: 12,
    paddingVertical: 6,
  },
  progressTrackBackground: {
    height: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressTrackFill: {
    height: 10,
    backgroundColor: "#1E90FF",
    borderRadius: 6,
    width: "0%",
  },

  actions: {
    flexDirection: "row",
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
