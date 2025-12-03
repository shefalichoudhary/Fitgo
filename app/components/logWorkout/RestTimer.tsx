// components/RestTimer/RestTimer.tsx
import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import { View, Text, TouchableOpacity, StyleSheet, Vibration } from "react-native";

type ActiveRestTimer = {
  exerciseId: string | null;
  setId?: string | null;
  remaining: number;
  running: boolean;
};

export type RestTimerHandle = {
  start: (exerciseId: string, setId: string, seconds: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  getState: () => ActiveRestTimer;
};

type Props = {
  // function used to resolve a label for the currently active exercise id
  resolveLabel?: (exerciseId: string | null) => string;
  // optional callbacks
  onChange?: (state: ActiveRestTimer) => void; // called whenever state changes
  onFinish?: (exerciseId: string | null, setId?: string | null) => void; // when timer ends naturally
};

/**
 * RestTimer component owns the interval and exposes imperative methods via ref.
 * Parent uses `ref` to start/pause/resume/stop timers.
 */
const RestTimer = forwardRef<RestTimerHandle, Props>(({ resolveLabel, onChange, onFinish }, ref) => {
  const [state, setState] = useState<ActiveRestTimer>({
    exerciseId: null,
    setId: null,
    remaining: 0,
    running: false,
  });

  const timerRef = useRef<number | null>(null);
  // guard owner helps avoid interval overlaps
  const activeTimerOwnerRef = useRef<{ exerciseId: string | null; setId: string | null }>({
    exerciseId: null,
    setId: null,
  });

  const clearExistingInterval = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    activeTimerOwnerRef.current = { exerciseId: null, setId: null };
  };

  // core tick behaviour (shared by start/resume)
  const startInterval = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev;
        const owner = activeTimerOwnerRef.current;
        if (owner.exerciseId !== prev.exerciseId || owner.setId !== (prev.setId ?? null)) {
          // owner changed — stop interval
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        }

        if (!prev.running) return prev;

        if (prev.remaining <= 1) {
          // timer finished
          Vibration.vibrate(500);
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          activeTimerOwnerRef.current = { exerciseId: null, setId: null };
          const finishedState = { exerciseId: null, setId: null, remaining: 0, running: false };
          // notify
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

  // imperative API
  useImperativeHandle(
    ref,
    () => ({
      start: (exerciseId: string, setId: string, seconds: number) => {
        // clear any existing timer and set new owner
        clearExistingInterval();
        activeTimerOwnerRef.current = { exerciseId, setId };
        const newState = { exerciseId, setId, remaining: seconds, running: true };
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
          // if there's already an interval, just set running true
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
        const next = { exerciseId: null, setId: null, remaining: 0, running: false };
        setState(next);
        onChange?.(next);
      },

      getState: () => state,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      activeTimerOwnerRef.current = { exerciseId: null, setId: null };
    };
  }, []);

  if (!state || !state.exerciseId || state.remaining <= 0) return null;

  const label = resolveLabel ? resolveLabel(state.exerciseId) : "Rest";

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.seconds}>{state.remaining}s</Text>
      </View>

      <View style={styles.controls}>
        {state.running ? (
          <TouchableOpacity onPress={() => (ref as any)?.current?.pause?.()} style={styles.btn}>
            <Text style={styles.btnText}>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => (ref as any)?.current?.resume?.()} style={styles.btn}>
            <Text style={styles.btnText}>Resume</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => (ref as any)?.current?.stop?.()} style={[styles.btn, styles.stopBtn]}>
          <Text style={[styles.btnText, { color: "#fff" }]}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default RestTimer;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#071826",
    borderWidth: 1,
    borderColor: "#122032",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  left: {},
  title: { color: "#94a3b8", fontSize: 12 },
  seconds: { color: "#e6eef8", fontSize: 20, fontWeight: "700" },
  controls: { flexDirection: "row", gap: 8 },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0f1724",
    borderWidth: 1,
    borderColor: "#1f2a44",
    marginLeft: 8,
  },
  stopBtn: {
    backgroundColor: "#dc2626",
    borderColor: "#b91c1c",
  },
  btnText: { color: "#cbd5e1", fontWeight: "600" },
});
