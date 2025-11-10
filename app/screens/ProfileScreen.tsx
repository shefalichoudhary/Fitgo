import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { db } from "@/utils/storage";
import { users } from "@/utils/storage/schema";
import { eq } from "drizzle-orm";

type Props = {
  navigation?: any;
};

export default function ProfileScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState(
    "Productive. Passionate. Progress-driven. Always learning."
  );

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await db
          .select()
          .from(users)
          .where(eq(users.username, "Guest"))
          .all();
        if (result.length > 0) {
          const userData = result[0];
          setUser(userData);
          setUsername(userData.username);
          setEmail(userData.email);
        } else {
          console.log("⚠️ No user found in DB");
        }
      } catch (error) {
        console.error("❌ Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const onSave = async () => {
    try {
      await db
        .update(users)
        .set({
          username,
          email,
        })
        .where(eq(users.id, user.id))
        .run();

      setUser({ ...user, username, email, });
      Alert.alert("Success", "Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("❌ Failed to update profile:", err);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const onCancel = () => {
    // Reset changes
    setUsername(user.username);
    setEmail(user.email);
    setEditing(false);
  };

  const onLogout = () => {
    Alert.alert("Logout", "Perform logout logic here.");
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: "#9CA3AF", marginTop: 10 }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "#fff" }}>No user data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Full Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.valueInput}
            value={username}
            editable={editing}
            onChangeText={setUsername}
          />
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.valueInput}
            value={email}
            editable={editing}
            onChangeText={setEmail}
          />
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            style={styles.textArea}
            editable={editing}
            placeholder="Share your story..."
            placeholderTextColor="#6c757d"
          />
        </View>

        <View style={styles.divider} />

        {/* Stats Section */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>120</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>34</Text>
            <Text style={styles.statLabel}>Routines</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>18</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
        </View>

        {/* Actions */}
        {editing ? (
          <View style={styles.editButtonsRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={onSave}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editButtonsRow}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setEditing(true)}
          >
            <Text style={styles.primaryButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080808ff", padding: 20 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  card: {
    backgroundColor: "#101111ff",
    padding: 20,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  section: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  valueInput: {
    fontSize: 17,
    color: "#E5E7EB",
    fontWeight: "400",
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    paddingVertical: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#212224ff",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    textAlignVertical: "top",
    color: "#D1D5DB",
    backgroundColor: "#1c1c1dff",
    lineHeight: 20,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: "#374151", marginVertical: 20 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 28 },
  statItem: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 20, fontWeight: "700", color: "#F3F4F6", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#9CA3AF", letterSpacing: 0.2 },
  editButtonsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  primaryButton: { flex: 1, backgroundColor: "#2563EB", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginRight: 8 },
  cancelButton: { flex: 1, backgroundColor: "#6B7280", paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  primaryButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  cancelButtonText: { color: "white", fontWeight: "600", fontSize: 16 },
  logoutButton: { paddingVertical: 12, borderRadius: 10, alignItems: "center", borderWidth: 1, borderColor: "#DC2626" },
  logoutButtonText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },
});
