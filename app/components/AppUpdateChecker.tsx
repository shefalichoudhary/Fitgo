// AppUpdateChecker.tsx
import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator } from "react-native";
import * as Updates from "expo-updates";

export default function AppUpdateChecker({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        setChecking(true);
        const { isAvailable } = await Updates.checkForUpdateAsync();
        if (!mounted) return;

        if (isAvailable) {
          // We found an update — ask user whether to fetch now
          Alert.alert(
            "Update available",
            "A new update is available. Would you like to download and apply it now?",
            [
              {
                text: "Later",
                style: "cancel",
              },
              {
                text: "Yes, update",
                onPress: async () => {
                  try {
                    // fetch in background
                    const update = await Updates.fetchUpdateAsync();
                    if (update.isNew) {
                      // optional: show a small loader / toast
                      // apply update immediately (reload)
                      await Updates.reloadAsync();
                    }
                  } catch (e) {
                    console.warn("Failed to fetch/apply update", e);
                    Alert.alert("Update failed", "Could not download update. Please try later.");
                  }
                },
              },
            ],
            { cancelable: true }
          );
        }
      } catch (e) {
        console.warn("Error checking for update", e);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, []);

  // Optional: render children immediately; or block with loader while checking
  // Returning children immediately is usually fine because checkForUpdateAsync is fast.
  return <>{children}</>;
}
