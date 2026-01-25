import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, useColorScheme, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../utils/storage";
import { measurements } from "../utils/storage/schema";
import { desc, sql } from "drizzle-orm";
import { ConfirmModal } from "../components/ConfirmModal";
import { MeasurementCard } from "../components/Measurement/MeasurementCard";
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { HomeStackParamList } from "@/navigators/navigationTypes"

type Measurement = {
  id: string;
  date: string | null;
  notes?: string | null;
  weight?: number | null;
  bodyFat?: number | null;
  muscleMass?: number | null;
  waist?: number | null;
  chest?: number | null;
};

const metrics = [
  { key: "weight", label: "Weight", icon: "weight-kilogram", unit: "kg" },
  { key: "bodyFat", label: "Body Fat", icon: "percent", unit: "%" },
  { key: "muscleMass", label: "Muscle Mass", icon: "dumbbell", unit: "kg" },
  { key: "waist", label: "Waist", icon: "human-male-height", unit: "cm" },
  { key: "chest", label: "Chest", icon: "human-male-height-variant", unit: "cm" },
];

export default function MeasurementScreen() {
  const isDark = useColorScheme() === "dark";
  const styles = getStyles(isDark);
const navigation =
  useNavigation<NativeStackNavigationProp<HomeStackParamList>>()

  const [data, setData] = useState<Measurement[]>([]);
  const [selected, setSelected] = useState<Measurement | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const result = await db.select().from(measurements).orderBy(desc(measurements.date));
    setData(result as Measurement[]);
  };

  const openDelete = (m: Measurement) => {
    setSelected(m);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const closeDelete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => setSelected(null));
  };

  const remove = async (id: string) => {
    await db.delete(measurements).where(sql`${measurements.id} = ${id}`);
    setData((p) => p.filter((i) => i.id !== id));
    closeDelete();
  };

  const formatDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "No date";

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={80} color="#3B82F6" />
          <Text style={styles.emptyTitle}>No Measurements Yet</Text>
          <Text style={styles.emptyText}>Track your body stats to monitor progress.</Text>
        </View>
      ) : (
        data.map((m: any) => (
          <MeasurementCard
            key={m.id}
            item={m}
            metrics={metrics}
              onEdit={() =>
    navigation.navigate("AddMeasurement", {
      editData:m,
    })
  }
            formatDate={formatDate}
            onLongPress={() => openDelete(m)}
            scaleAnim={fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.02],
            })}
          />
        ))
      )}

      <ConfirmModal
        visible={!!selected}
        title="Delete Measurement?"
        message="Are you sure you want to delete this measurement?"
        onCancel={closeDelete}
        onConfirm={() => selected && remove(selected.id)}
      />
    </ScrollView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { padding: 16, paddingBottom: 40, backgroundColor: "#000" },
    empty: { alignItems: "center", marginTop: 100 },
    emptyTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 12 },
    emptyText: { color: "#9CA3AF", marginTop: 6 },
  });
