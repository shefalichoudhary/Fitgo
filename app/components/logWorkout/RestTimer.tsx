// components/logWorkout/RestTimer.tsx
import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Platform } from "react-native";

let AudioModule: any = null;
try {
  AudioModule = require("expo-av").Audio;
} catch (e) {
  AudioModule = null;
}

export type ActiveRestTimer = {
  exerciseId: string | null;
  setId?: string | null;
  remaining: number;
  running: boolean;
  duration?: number;
};

export type RestTimerHandle = {
  start: (exerciseId: string, setId: string, seconds: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  getState: () => ActiveRestTimer;
};

type Props = {
  resolveLabel?: (exerciseId: string | null) => string;
  onChange?: (state: ActiveRestTimer) => void;
  onFinish?: (exerciseId: string | null, setId?: string | null) => void;
  playSound?: boolean;
  vibrationMs?: number;
};

const RestTimer = forwardRef<RestTimerHandle, Props>(
  ({ resolveLabel, onChange, onFinish, playSound = true, vibrationMs = 500 }, ref) => {
    const [state, setState] = useState<ActiveRestTimer>({
      exerciseId: null,
      setId: null,
      remaining: 0,
      running: false,
      duration: 0,
    });

    // keep a ref mirror of state so getState is always up-to-date
    const stateRef = useRef<ActiveRestTimer>(state);
    stateRef.current = state;

    const timerRef = useRef<number | null>(null);
    const activeTimerOwnerRef = useRef<{ exerciseId: string | null; setId: string | null }>({
      exerciseId: null,
      setId: null,
    });

    const soundRef = useRef<any>(null);

    useEffect(() => {
      let mounted = true;
      const loadSound = async () => {
        if (!AudioModule || !playSound) return;
        try {
          const { Sound } = AudioModule;
          // optional: replace with your actual asset path, or skip if not available.
          const asset = require("@/assets/sounds/beep.mp3");
          const { sound } = await Sound.createAsync(asset);
          if (!mounted) {
            await sound.unloadAsync();
            return;
          }
          soundRef.current = sound;
        } catch (err) {
          console.warn("RestTimer: failed to load sound (expo-av). Falling back to vibration.", err);
        }
      };
      loadSound();
      return () => {
        mounted = false;
        if (soundRef.current) {
          (async () => {
            try {
              await soundRef.current.unloadAsync?.();
            } catch {}
            soundRef.current = null;
          })();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playSound]);

    const clearExistingInterval = () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      activeTimerOwnerRef.current = { exerciseId: null, setId: null };
    };

    const startInterval = () => {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (!prev) return prev;

          const owner = activeTimerOwnerRef.current;
          const ownerExerciseId = owner.exerciseId ?? null;
          const ownerSetId = owner.setId ?? null;
          const prevExerciseId = prev.exerciseId ?? null;
          const prevSetId = prev.setId ?? null;

          // If owner changed externally, stop the timer *and update state* (was the bug)
          if (ownerExerciseId !== prevExerciseId || ownerSetId !== prevSetId) {
            console.warn("[RestTimer] owner mismatch — stopping interval", {
              owner: { exerciseId: ownerExerciseId, setId: ownerSetId },
              prev: { exerciseId: prevExerciseId, setId: prevSetId },
              ts: Date.now(),
            });
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            activeTimerOwnerRef.current = { exerciseId: null, setId: null };
            // update state to reflect stopped timer (previous code left running=true)
            const stopped = {
              exerciseId: null,
              setId: null,
              remaining: prev.remaining,
              running: false,
              duration: 0,
            };
            // ensure UI + callers know it stopped
            onChange?.(stopped);
            return stopped;
          }

          if (!prev.running) return prev;

          if (prev.remaining <= 1) {
            // finished: sound/vibrate
            try {
              if (playSound && soundRef.current?.replayAsync) {
                soundRef.current.replayAsync?.().catch(() => Vibration.vibrate(vibrationMs));
              } else if (playSound && soundRef.current?.playAsync) {
                soundRef.current.playAsync?.catch(() => Vibration.vibrate(vibrationMs));
              } else {
                Vibration.vibrate(vibrationMs);
              }
            } catch {
              Vibration.vibrate(vibrationMs);
            }

            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            activeTimerOwnerRef.current = { exerciseId: null, setId: null };
            const finishedState = { exerciseId: null, setId: null, remaining: 0, running: false, duration: 0 };
            onChange?.(finishedState);
            onFinish?.(prev.exerciseId, prev.setId);
            return finishedState;
          }

          const next = { ...prev, remaining: prev.remaining - 1 };
          onChange?.(next);
          return next;
        });
      }, 1000) as unknown as number;
    };

    useImperativeHandle(
      ref,
      () => ({
        start: (exerciseId: string, setId: string, seconds: number) => {
          clearExistingInterval();
          activeTimerOwnerRef.current = { exerciseId, setId };
          const newState: ActiveRestTimer = {
            exerciseId,
            setId,
            remaining: Math.max(0, Math.floor(seconds)),
            running: true,
            duration: Math.max(0, Math.floor(seconds)),
          };
          setState(newState);
          onChange?.(newState);
          startInterval();
        },

        pause: () => {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setState((p) => {
            if (!p) return p;
            const next = { ...p, running: false };
            onChange?.(next);
            return next;
          });
        },

        resume: () => {
          setState((p) => {
            if (!p) return p;
            if (p.remaining <= 0) {
              const next = { ...p, running: false };
              onChange?.(next);
              return next;
            }
            if (timerRef.current) {
              const next = { ...p, running: true };
              onChange?.(next);
              return next;
            }
            const next = { ...p, running: true };
            onChange?.(next);
            startInterval();
            return next;
          });
        },

        stop: () => {
          clearExistingInterval();
          const next: ActiveRestTimer = { exerciseId: null, setId: null, remaining: 0, running: false, duration: 0 };
          setState(next);
          onChange?.(next);
        },

        getState: () => stateRef.current,
      }),
      // keep this dependent on nothing - stateRef always reflects latest
      []
    );

    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        activeTimerOwnerRef.current = { exerciseId: null, setId: null };
        if (soundRef.current) {
          (async () => {
            try {
              await soundRef.current.unloadAsync?.();
            } catch {}
            soundRef.current = null;
          })();
        }
      };
    }, []);

    if (!state || !state.exerciseId || state.remaining <= 0) return null;

    const label = resolveLabel ? resolveLabel(state.exerciseId) : "Rest";
    const duration = state.duration ?? state.remaining ?? 0;
    const progress = duration > 0 ? 1 - state.remaining / duration : 1;
    const progressPercent = Math.max(0, Math.min(1, progress));

    return (
      <View style={styles.container} accessible accessibilityRole="adjustable">
        <View style={styles.left}>
          <Text style={styles.title}>{label}</Text>
          <Text style={styles.seconds}>{state.remaining}s</Text>
        </View>

        <View style={styles.middle}>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]} />
          </View>
        </View>

        <View style={styles.controls}>
          {state.running ? (
            <TouchableOpacity onPress={() => (ref as any)?.current?.pause?.()} style={styles.btn} accessibilityLabel="Pause rest timer">
              <Text style={styles.btnText}>Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => (ref as any)?.current?.resume?.()} style={styles.btn} accessibilityLabel="Resume rest timer">
              <Text style={styles.btnText}>Resume</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => (ref as any)?.current?.stop?.()} style={[styles.btn, styles.stopBtn]} accessibilityLabel="Stop rest timer">
            <Text style={[styles.btnText, { color: "#fff" }]}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

export default RestTimer;

const styles = StyleSheet.create({
  container: { position: "absolute", left: 16, right: 16, bottom: 24, zIndex: 1000, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: "#071826", borderWidth: 1, borderColor: "#122032", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6 },
  left: { width: 80 },
  title: { color: "#94a3b8", fontSize: 12 },
  seconds: { color: "#e6eef8", fontSize: 20, fontWeight: "700" },
  middle: { flex: 1, paddingHorizontal: 12 },
  progressBarBackground: { height: 8, backgroundColor: "#0f1724", borderRadius: 6, overflow: "hidden" },
  progressBarFill: { height: 8, backgroundColor: "#4ade80", borderRadius: 6, width: "0%" },
  controls: { flexDirection: "row", gap: 8, alignItems: "center" as const },
  btn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: "#0f1724", borderWidth: 1, borderColor: "#1f2a44", marginLeft: 8 },
  stopBtn: { backgroundColor: "#dc2626", borderColor: "#b91c1c" },
  btnText: { color: "#cbd5e1", fontWeight: "600" },
});
