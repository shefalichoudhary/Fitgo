import React, { useEffect, useState, useCallback } from "react";
import Feather from "@expo/vector-icons/Feather";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { db } from "@/utils/storage";
import { users } from "@/utils/storage/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/utils/user";
import LoadingOverlay from "@/components/LoadingOverlay";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ProfileSection } from "@/components/profileScreen/ProfileSection";
import { ProfileField } from "@/components/profileScreen/ProfileField";
import { ProfileOptionGroup } from "@/components/profileScreen/ProfileOptionGroup";
import { ProfileActions } from "@/components/profileScreen/ProfileActions";
import { ProfileHeader } from "@/components/profileScreen/ProfileHeader";
import { NumberPickerModal } from "@/components/Common/NumberPickerModal";

type ConfirmType = "save" | "cancel" | null;

const mapUserToForm = (u: any) => ({
  username: u?.username ?? "",
  email: u?.email ?? "",
  age: u?.age?.toString() ?? "",
  height: u?.height?.toString() ?? "",
  gender: u?.gender ?? "",
  experience: u?.experience ?? "",
  fitness_goal: u?.fitness_goal ?? "",
  bio: u?.bio ?? "",
});

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(mapUserToForm(null));
  const [agePickerOpen, setAgePickerOpen] = useState(false);
  const [heightPickerOpen, setHeightPickerOpen] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmType>(null);
  const [saving, setSaving] = useState(false);

  /* ================= FETCH USER (RUNS ONCE) ================= */
  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser();
      if (u) {
        setUser(u);
        setForm(mapUserToForm(u));
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  /* ================= RESET EDIT MODE ON TAB SWITCH ================= */
  useFocusEffect(
    useCallback(() => {
      return () => {
        setEditing(false);
        if (user) {
          setForm(mapUserToForm(user));
        }
      };
    }, [user])
  );

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);

    await db
      .update(users)
      .set({
        username: form.username,
        email: form.email,
        age: form.age ? Number(form.age) : null,
        height: form.height ? Number(form.height) : null,
        gender: form.gender || null,
        experience: form.experience || null,
        fitness_goal: form.fitness_goal || null,
        bio: form.bio,
      })
      .where(eq(users.id, user.id))
      .run();
    setEditing(false);
    setConfirmVisible(false);
    setSaving(false);
  };

  const discardChanges = () => {
    if (!user) return;
    setForm(mapUserToForm(user));
    setEditing(false);
    setConfirmVisible(false);
  };

  if (loading) {
    return <LoadingOverlay visible message="Loading profile..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <ProfileHeader username={form.username} email={form.email} />

        <ProfileSection title="Personal Information">
          <ProfileField
            label="Full Name"
            value={form.username}
            editable={editing}
            onChange={(v: string) => handleChange("username", v)}
          />

          <ProfileField
            label="Email"
            value={form.email}
            editable={editing}
            onChange={(v: string) => handleChange("email", v)}
          />

          {/* AGE */}
          {editing || !form.age ? (
            <View style={styles.section}>
              <Text style={styles.label}>Age</Text>
              <TouchableOpacity
                disabled={!editing && !!form.age}
                onPress={() => setAgePickerOpen(true)}
                style={styles.pickerRow}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.pickerValue, !form.age && styles.placeholder]}
                >
                  {form.age || "Select age"}
                </Text>
                {(editing || !form.age) && (
                  <Feather name="chevron-down" size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <ProfileField label="Age" value={form.age} editable={false} />
          )}

          {/* HEIGHT */}
          {editing || !form.height ? (
            <View style={styles.section}>
              <Text style={styles.label}>Height (cm)</Text>
              <TouchableOpacity
                disabled={!editing && !!form.height}
                onPress={() => setHeightPickerOpen(true)}
                style={styles.pickerRow}
              >
                <Text style={[styles.pickerValue, !form.height && styles.placeholder]}>
                  {form.height || "Select height"}
                </Text>
                {(editing || !form.height) && (
                  <Feather name="chevron-down" size={18} color="#9CA3AF" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <ProfileField label="Height (cm)" value={form.height} editable={false} />
          )}

          {/* GENDER */}
          {editing || !form.gender ? (
            <ProfileOptionGroup
              label="Gender"
              options={["Male", "Female", "Other"]}
              value={form.gender}
              onChange={(v: string) => handleChange("gender", v)}
            />
          ) : (
            <ProfileField label="Gender" value={form.gender} editable={false} />
          )}
        </ProfileSection>

        <ProfileSection title="Fitness Profile">
          <ProfileOptionGroup
            label="Experience"
            options={["Beginner", "Intermediate", "Advanced"]}
            value={form.experience}
            onChange={(v: string) => handleChange("experience", v)}
          />

          <ProfileOptionGroup
            label="Fitness Goal"
            options={["Lose Fat", "Build Muscle", "Stay Fit"]}
            value={form.fitness_goal}
            onChange={(v: string) => handleChange("fitness_goal", v)}
          />
        </ProfileSection>

        <ProfileActions
          editing={editing}
          onEdit={() => setEditing(true)}
          onSave={() => {
            setConfirmType("save");
            setConfirmVisible(true);
          }}
          onCancel={() => {
            setConfirmType("cancel");
            setConfirmVisible(true);
          }}
        />
      </View>

      {/* PICKERS */}
      <NumberPickerModal
        visible={agePickerOpen}
        title="Select Age"
        values={Array.from({ length: 83 }, (_, i) => i + 18)}
        onSelect={(v) => handleChange("age", String(v))}
        onClose={() => setAgePickerOpen(false)}
      />

      <NumberPickerModal
        visible={heightPickerOpen}
        title="Select Height (cm)"
        values={Array.from({ length: 121 }, (_, i) => i + 140)}
        onSelect={(v) => handleChange("height", String(v))}
        onClose={() => setHeightPickerOpen(false)}
      />

      {/* CONFIRM MODAL */}
      <ConfirmModal
        visible={confirmVisible}
        title={confirmType === "save" ? "Save changes?" : "Discard changes?"}
        message={confirmType === "save" ? "Save profile updates?" : "Unsaved changes will be lost."}
        confirmText={saving ? "Saving..." : "Confirm"}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={confirmType === "save" ? saveProfile : discardChanges}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  card: { backgroundColor: "#0B0B0C", margin: 12, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "#1F1F1F" },
  section: { marginBottom: 14 },
  label: { color: "#9CA3AF", fontSize: 12, marginBottom: 6 },
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#2A2A2A", paddingVertical: 8 },
  pickerValue: { color: "#FFF", fontSize: 15 },
  placeholder: { color: "#6B7280" },
})

