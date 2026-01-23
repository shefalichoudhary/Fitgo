import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

let SoundLib: any = null;
let Haptics: any = null;

try {
  SoundLib = require('expo-av').Audio;
} catch {}
try {
  Haptics = require('expo-haptics');
} catch {}

export type ActiveRestTimer = {
  exerciseId: string | null;
  setId?: string | null;
  remaining: number;
  running: boolean;
  total: number;   // ✅ renamed from duration
};

export type RestTimerHandle = {
  start: (exerciseId: string, setId: string | null, seconds: number) => void;
  stop: () => void;
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const RestTimer = forwardRef<RestTimerHandle>((_, ref) => {
const [state, setState] = useState<ActiveRestTimer>({
  exerciseId: null,
  setId: null,
  remaining: 0,
  running: false,
  total: 0,
});

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progress = useRef(new Animated.Value(0)).current;

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };
const playFinishSound = async () => {
  try {
    if (!SoundLib) return;

    const { sound } = await SoundLib.Sound.createAsync(
      require("../../../assets/sounds/beep-end.mp3"), // 👈 your sound file
      { shouldPlay: true }
    );

    sound.setOnPlaybackStatusUpdate((status:any) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync(); // ✅ cleanup
      }
    });
  } catch (e) {
    console.warn("Sound play failed", e);
  }
};

const stopTimer = () => {
  clearTimer();
  progress.setValue(0);

  setState({
    exerciseId: null,
    setId: null,
    remaining: 0,
    running: false,
    total: 0, // ✅ FIX
  });
};

const startInterval = () => {
  intervalRef.current = setInterval(() => {
    setState((prev) => {
      if (!prev.running) return prev;

      const nextRemaining = prev.remaining - 1;

if (nextRemaining <= 0) {
  clearTimer();
  progress.setValue(1);

  try {
    playFinishSound();
    Haptics?.notificationAsync?.("success");
    Vibration.vibrate(500);
  } catch {}

  return {
    exerciseId: null,
    setId: null,
    remaining: 0,
    running: false,
    total: 0, // ✅ FIX
  };
}

  const ratio =
  prev.total > 0 ? (prev.total - nextRemaining) / prev.total : 0;

Animated.timing(progress, {
  toValue: ratio,
  duration: 200,
  easing: Easing.linear,
  useNativeDriver: false,
}).start();

      return { ...prev, remaining: nextRemaining };
    });
  }, 1000);
};


const adjust = (delta: number) => {
  setState((prev) => {
    if (!prev.running) return prev;

    const nextRemaining = Math.max(0, prev.remaining + delta);
    const nextTotal =
      delta > 0 ? prev.total + delta : prev.total;

    return {
      ...prev,
      remaining: nextRemaining,
      total: Math.max(nextTotal, nextRemaining),
    };
  });
};


useImperativeHandle(ref, () => ({
  start: (exerciseId, setId, seconds) => {
    clearTimer();
    progress.setValue(0);

    setState({
      exerciseId,
      setId,
      remaining: seconds,
      total: seconds, // ✅ FIX
      running: true,
    });

    startInterval();
  },
  stop: stopTimer,
}));


  if (!state.running) return null;

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
<SafeAreaView edges={["bottom"]} style={styles.wrapper}>
  {/* Progress bar – full width */}
  <View style={styles.progressTrack}>
    <Animated.View style={[styles.progressFill, { width }]} />
  </View>

  {/* Controls */}
  <View style={styles.content}>
    <View style={styles.row}>
      <TouchableOpacity onPress={() => adjust(-15)} style={styles.btn}>
        <Text style={styles.btnText}>-15</Text>
      </TouchableOpacity>

      <Text style={styles.time}>{formatTime(state.remaining)}</Text>

      <TouchableOpacity onPress={() => adjust(15)} style={styles.btn}>
        <Text style={styles.btnText}>+15</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={stopTimer} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </View>
  </View>
</SafeAreaView>

  );
});

  

export default RestTimer;
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,                 // ✅ SafeArea handles spacing
    left: 0,
    right: 0,
    backgroundColor: "#000000",
    borderTopWidth: 1,
    borderColor: "#0f172a",
    zIndex: 9999,
    elevation: 20,
  },

  /* ───────── Progress Bar ───────── */
  progressTrack: {
    height: 5,
    backgroundColor: "#000000",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
  },

  /* ───────── Content Area ───────── */
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",      // ✅ vertical alignment
    justifyContent: "space-between",
  },

  btn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#111827",
  },

  btnText: {
    color: "#e5e7eb",
    fontWeight: "700",
  },

time: {
  width: 72,              // ✅ FIXED WIDTH (key line)
  textAlign: "center",
  fontSize: 20,
  fontWeight: "800",
  color: "#ffffff",
},

  skip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },

  skipText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

