// components/DurationTimer.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
type Props = {
  initialSeconds?: number;
  editable?: boolean;
  onChange?: (seconds: number) => void;
  onStop?: () => void;
  hideControlsWhenNotEditable?: boolean;
  soundFile?: any;
  playOnStart?: boolean; // default true
};

export default function DurationTimer({
  initialSeconds = 0,
  editable = true,
  onChange,
  onStop,
  hideControlsWhenNotEditable = false,
  soundFile,
  playOnStart = true,
}: Props) {
  const [seconds, setSeconds] = useState<number>(initialSeconds ?? 0);
  const [running, setRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  // expo-av sound object
  const soundRef = useRef<Audio.Sound | null>(null);

  // load sound once if provided
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!soundFile) return;
      try {
        const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: false });
        if (mounted) soundRef.current = sound;
      } catch (err) {
        console.warn("DurationTimer: failed to load sound", err);
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
        } catch (err) {
          /* ignore */
        }
      })();
    };
  }, [soundFile]);

  // sync when parent updates initialSeconds
  useEffect(() => {
    setSeconds(initialSeconds ?? 0);
  }, [initialSeconds]);

  // play a short sound when timer is started
  const playStartSound = async () => {
    if (!playOnStart) return;
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
        return;
      }
      if (soundFile) {
        const { sound } = await Audio.Sound.createAsync(soundFile, { shouldPlay: true });
        setTimeout(() => {
          sound.unloadAsync().catch(() => {});
        }, 1500);
      }
    } catch (err) {
      console.warn("DurationTimer: playStartSound error", err);
    }
  };

  // interval effect
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          onChange && onChange(next);
          return next;
        });
      }, 1000) as unknown as number;
    } else {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current as any);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current as any);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  // manual text input handler
  const handleTextChange = (text: string) => {
    const n = text === "" ? 0 : Number(text);
    const val = Number.isNaN(n) ? 0 : n;
    setSeconds(val);
    onChange && onChange(val);
  };

  const toggleRunning = async () => {
    if (!editable) return;
    // if about to start, ensure we play sound
    const willStart = !running;
    if (willStart) {
      await playStartSound();
    }
    setRunning((r) => {
      const next = !r;
      if (!next) {
        // paused — persist current via onChange
        onChange && onChange(seconds);
        onStop && onStop();
      }
      return next;
    });
  };

  const reset = () => {
    setRunning(false);
    setSeconds(0);
    onChange && onChange(0);
    onStop && onStop();
  };

  // controls hidden when not editable (optionally)
  if (!editable && hideControlsWhenNotEditable) {
    return (
      <View style={localStyles.row}>
        <TextInput
          value={String(seconds)}
          keyboardType="numeric"
          editable={false}
          style={[localStyles.underlineInput, { flex: 1 }]}
          placeholder="seconds"
        />
      </View>
    );
  }

  return (
    <View style={localStyles.row}>
      <TextInput
        value={String(seconds ?? "")}
        keyboardType="numeric"
        editable={editable}
        style={[localStyles.underlineInput, { flex: 1 }]}
        placeholder="seconds"
        onChangeText={handleTextChange}
      />

      <View style={localStyles.controls}>
        <TouchableOpacity
          onPress={toggleRunning}
          disabled={!editable}
          accessibilityLabel={running ? "Pause timer" : "Start timer"}
          accessibilityRole="button"
          style={[localStyles.btn, running ? localStyles.btnActive : null]}
        >
          <Ionicons name={running ? "pause" : "play"} size={18} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={reset}
          disabled={!editable}
          accessibilityLabel="Reset timer"
          accessibilityRole="button"
          style={[localStyles.btn, { marginLeft: 8 }]}
        >
          <Ionicons name="refresh" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", flex: 1 },
  underlineInput: {
    height: 38,
    borderBottomWidth: 0,
    borderBottomColor: "#2b3948", // subtle divider; adjust to taste
    paddingHorizontal: 6,
    paddingVertical: 8,
    backgroundColor: "transparent", // remove filled background
    fontSize: 14,
    color: "#e7eaecff",
    textAlignVertical: "center",
    textAlign: "center",
  },
  controls: { flexDirection: "row", marginLeft: 8 },
  btn: {
    width: 40,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#183b8a",
  },
  btnActive: { backgroundColor: "#10B981" },
});
