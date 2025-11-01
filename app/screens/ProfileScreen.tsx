import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";

type Props = {
  navigation?: any;
};

export default function ProfileScreen({ navigation }: Props) {
  const [name, setName] = React.useState("Jane Doe");
  const [email, setEmail] = React.useState("jane.doe@example.com");
  const [bio, setBio] = React.useState(
    "Productive. Passionate. Progress-driven. Always learning."
  );

  function onEditPress() {
    Alert.alert("Edit profile", "Hook this up to your edit screen or modal.");
  }

  function onLogout() {
    Alert.alert("Logout", "Perform logout logic here.");
  }

  return (
    <View style={styles.container}>
      

      <View style={styles.card}>
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <Text style={styles.value}>{name}</Text>
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.label}>Email Address</Text>
          <Text style={styles.value}>{email}</Text>
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
        <TouchableOpacity style={styles.primaryButton} onPress={onEditPress}>
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080808ff",
    padding: 20,
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9CA3AF",
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 17,
    color: "#E5E7EB",
    fontWeight: "400",
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
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F3F4F6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    letterSpacing: 0.2,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  logoutButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DC2626",
  },
  logoutButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 15,
  },
});
