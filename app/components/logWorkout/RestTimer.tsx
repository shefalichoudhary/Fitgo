import React, {useRef, useState, useEffect, useImperativeHandle, forwardRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Platform,
  Animated,
  Easing,
} from 'react-native';

// Optional: if your project has expo-av and expo-haptics available these will be used.
let SoundLib: any = null;
let Haptics: any = null;
try {
  SoundLib = require('expo-av').Audio;
} catch (e) {
  SoundLib = null;
}
try {
  Haptics = require('expo-haptics');
} catch (e) {
  Haptics = null;
}

export type ActiveRestTimer = {
  exerciseId: string | null;
  setId?: string | null;
  remaining: number;
  running: boolean;
  duration?: number;
};

export type RestTimerHandle = {
  start: (exerciseId: string, setId: string | null, seconds: number) => void;
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
  compact?: boolean; // compact UI (less chrome)
  primaryColor?: string; // progress color
};

const RestTimer = forwardRef<RestTimerHandle, Props>(
  (
    {
      resolveLabel,
      onChange,
      onFinish,
      playSound = true,
      vibrationMs = 500,
      compact = false,
      primaryColor = '#34d399',
    },
    ref
  ) => {
    const [state, setState] = useState<ActiveRestTimer>({
      exerciseId: null,
      setId: null,
      remaining: 0,
      running: false,
      duration: 0,
    });

    const stateRef = useRef<ActiveRestTimer>(state);
    stateRef.current = state;

    const intervalRef = useRef<number | null>(null);
    const ownerRef = useRef<{exerciseId: string | null; setId: string | null}>({
      exerciseId: null,
      setId: null,
    });

    const soundRef = useRef<any>(null);

    // Animated values for smooth progress + subtle pop animation on finish
    const progressAnim = useRef(new Animated.Value(0)).current; // 0..1
    const popAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      let mounted = true;
      const load = async () => {
        if (!SoundLib || !playSound) return;
        try {
          const {Sound} = SoundLib;
          const asset = require('@/assets/sounds/beep.mp3');
          const {sound} = await Sound.createAsync(asset);
          if (!mounted) {
            await sound.unloadAsync();
            return;
          }
          soundRef.current = sound;
        } catch (err) {
          console.warn('RestTimer: sound load failed', err);
        }
      };
      load();
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

    const clearIntervalRef = () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current as any);
        intervalRef.current = null;
      }
      ownerRef.current = {exerciseId: null, setId: null};
    };

    const animateProgressTo = (value: number) => {
      Animated.timing(progressAnim, {
        toValue: value,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    };

    const startInterval = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (!prev) return prev;

          const owner = ownerRef.current;
          const ownerExerciseId = owner.exerciseId ?? null;
          const ownerSetId = owner.setId ?? null;

          if (ownerExerciseId !== (prev.exerciseId ?? null) || ownerSetId !== (prev.setId ?? null)) {
            // owner changed out from under timer -> stop and report
            clearIntervalRef();
            const stopped = {...prev, running: false};
            onChange?.(stopped);
            animateProgressTo(0);
            return stopped;
          }

          if (!prev.running) return prev;

          if (prev.remaining <= 1) {
            // finish
            try {
              if (playSound && soundRef.current?.replayAsync) {
                soundRef.current.replayAsync?.catch(() => {
                  Haptics?.notificationAsync?.('success');
                  Vibration.vibrate(vibrationMs);
                });
              } else if (playSound && soundRef.current?.playAsync) {
                soundRef.current.playAsync?.catch(() => {
                  Haptics?.notificationAsync?.('success');
                  Vibration.vibrate(vibrationMs);
                });
              } else {
                Haptics?.notificationAsync?.('success');
                Vibration.vibrate(vibrationMs);
              }
            } catch {
              try {
                Vibration.vibrate(vibrationMs);
              } catch {}
            }

            clearIntervalRef();

            // subtle pop animation
            Animated.sequence([
              Animated.timing(popAnim, {toValue: 1.06, duration: 120, useNativeDriver: true}),
              Animated.timing(popAnim, {toValue: 1, duration: 180, useNativeDriver: true}),
            ]).start();

            const finishedState = {exerciseId: null, setId: null, remaining: 0, running: false, duration: 0};
            onChange?.(finishedState);
            onFinish?.(prev.exerciseId ?? null, prev.setId ?? null);
            animateProgressTo(0);
            return finishedState;
          }

          const next = {...prev, remaining: prev.remaining - 1};
          onChange?.(next);
          const dur = prev.duration ?? prev.remaining;
          const p = dur > 0 ? 1 - (next.remaining / dur) : 1;
          animateProgressTo(p);
          return next;
        });
      }, 1000) as unknown as number;
    };

    useImperativeHandle(ref, () => ({
      start: (exerciseId: string, setId: string | null, seconds: number) => {
        clearIntervalRef();
        ownerRef.current = {exerciseId, setId};
        const secs = Math.max(0, Math.floor(seconds));
        const newState: ActiveRestTimer = {
          exerciseId,
          setId,
          remaining: secs,
          running: true,
          duration: secs,
        };
        setState(newState);
        onChange?.(newState);
        animateProgressTo(0);
        // small scale pop when starting
        Animated.sequence([
          Animated.timing(popAnim, {toValue: 1.02, duration: 80, useNativeDriver: true}),
          Animated.timing(popAnim, {toValue: 1, duration: 120, useNativeDriver: true}),
        ]).start();
        startInterval();
      },
      pause: () => {
        if (intervalRef.current) clearInterval(intervalRef.current as any);
        intervalRef.current = null;
        setState((p) => {
          if (!p) return p;
          const next = {...p, running: false};
          onChange?.(next);
          return next;
        });
      },
      resume: () => {
        setState((p) => {
          if (!p) return p;
          if (p.remaining <= 0) {
            const next = {...p, running: false};
            onChange?.(next);
            return next;
          }
          if (intervalRef.current) {
            const next = {...p, running: true};
            onChange?.(next);
            return next;
          }
          const next = {...p, running: true};
          onChange?.(next);
          startInterval();
          return next;
        });
      },
      stop: () => {
        clearIntervalRef();
        const next: ActiveRestTimer = {exerciseId: null, setId: null, remaining: 0, running: false, duration: 0};
        setState(next);
        onChange?.(next);
        animateProgressTo(0);
      },
      getState: () => stateRef.current,
    }),
    // keep empty deps so handle identity is stable
    []);

    useEffect(() => {
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current as any);
        intervalRef.current = null;
        ownerRef.current = {exerciseId: null, setId: null};
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
    }, []);

    if (!state || !state.exerciseId || state.remaining <= 0) return null;

    const label = resolveLabel ? resolveLabel(state.exerciseId) : 'Rest';
    const duration = state.duration ?? state.remaining ?? 0;

    // progress bar width interpolation
    const widthInterp = progressAnim.interpolate({inputRange: [0, 1], outputRange: ['0%', '100%']});

    return (
      <Animated.View
        style={[
          styles.container,
          compact ? styles.compactContainer : {},
          {transform: [{scale: popAnim}]},
        ]}
        accessible
        accessibilityRole="adjustable"
      >
        <View style={styles.left}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Text>
          <Text style={styles.seconds}>{state.remaining}s</Text>
        </View>

        <View style={styles.middle}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, {width: widthInterp, backgroundColor: primaryColor}]} />
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Duration {duration}s</Text>
            <Text style={styles.metaText}>{Math.round((1 - state.remaining / Math.max(1, duration)) * 100)}%</Text>
          </View>
        </View>

        <View style={styles.controls}>
          {state.running ? (
            <TouchableOpacity onPress={() => (ref as any)?.current?.pause?.()} style={styles.actionBtn} accessibilityLabel="Pause rest timer">
              <Text style={styles.actionText}>Pause</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => (ref as any)?.current?.resume?.()} style={styles.actionBtn} accessibilityLabel="Resume rest timer">
              <Text style={styles.actionText}>Resume</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => (ref as any)?.current?.stop?.()} style={[styles.actionBtn, styles.stopBtn]} accessibilityLabel="Stop rest timer">
            <Text style={[styles.actionText, {color: '#fff'}]}>Stop</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }
);

export default RestTimer;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    zIndex: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#071826',
    borderWidth: 1,
    borderColor: '#122032',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  compactContainer: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  left: {width: 96},
  title: {color: '#94a3b8', fontSize: 12},
  seconds: {color: '#e6eef8', fontSize: 22, fontWeight: '800'},
  middle: {flex: 1, paddingHorizontal: 12},
  progressTrack: {
    height: 10,
    backgroundColor: '#0f1724',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {height: 10, borderRadius: 8, width: '0%'},
  metaRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
  metaText: {fontSize: 11, color: '#94a3b8'},
  controls: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0f1724',
    borderWidth: 1,
    borderColor: '#1f2a44',
    marginLeft: 8,
  },
  stopBtn: {backgroundColor: '#dc2626', borderColor: '#b91c1c'},
  actionText: {color: '#cbd5e1', fontWeight: '700'},
});
