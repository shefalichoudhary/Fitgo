import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native"
import { db } from "@/utils/storage"
import { users } from "@/utils/storage/schema"
import { eq } from "drizzle-orm"
import { Ionicons } from "@expo/vector-icons"
import { getCurrentUser } from "@/utils/user"
import { ConfirmModal } from "@/components/ConfirmModal" // adjust path

type Props = { navigation?: any }
type ConfirmType = "save" | "cancel" | null

export default function ProfileScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("Productive. Passionate. Progress-driven. Always learning.")
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmType, setConfirmType] = useState<ConfirmType>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          setUsername(userData.username)
          setEmail(userData.email)
        } else {
          console.log("⚠️ No user found in DB")
        }
      } catch (error) {
        console.error("❌ Failed to fetch user:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  /** When user taps Save button in UI — show confirm modal */
  const onSavePressed = () => {
    setConfirmType("save")
    setConfirmVisible(true)
  }

  /** When user taps Cancel while editing — show confirm modal */
  const onCancelPressed = () => {
    setConfirmType("cancel")
    setConfirmVisible(true)
  }

  /** Actual save logic (called after confirming Save) */
  const performSave = async () => {
    if (!user) return
    try {
      setSaving(true)
      await db
        .update(users)
        .set({ username, email })
        .where(eq(users.id, user.id))
        .run()
      setUser({ ...user, username, email })
      setEditing(false)
    } catch (err) {
      console.error("❌ Failed to update profile:", err)
    } finally {
      setSaving(false)
      setConfirmVisible(false)
      setConfirmType(null)
    }
  }

  /** Discard changes (called after confirming Cancel) */
  const performDiscard = () => {
    if (user) {
      setUsername(user.username)
      setEmail(user.email)
      // If you want to reset bio too: setBio(user.bio || default)
    } else {
      setUsername("")
      setEmail("")
    }
    setEditing(false)
    setConfirmVisible(false)
    setConfirmType(null)
  }

  /** Handler when user confirms in modal: dispatch to proper action */
  const handleConfirm = () => {
    if (confirmType === "save") {
      performSave()
    } else if (confirmType === "cancel") {
      performDiscard()
    } else {
      setConfirmVisible(false)
      setConfirmType(null)
    }
  }

  const handleCancelInModal = () => {
    // simply close modal and keep current editing state
    setConfirmVisible(false)
    setConfirmType(null)
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: "#9CA3AF", marginTop: 10 }}>Loading profile...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Ionicons name="person-circle-outline" size={100} color="#6B7280" style={{ marginBottom: 20 }} />
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
          Profile Not Found
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 15, textAlign: "center", marginBottom: 25, paddingHorizontal: 20 }}>
          We couldn’t find your profile information. Please make sure you’re logged in or create a new profile to get started.
        </Text>
      </View>
    )
  }

  // prepare modal props per confirmType
  const modalProps = (() => {
    if (confirmType === "save") {
      return {
        title: "Save changes?",
        message: "Do you want to save the changes you made to your profile?",
        cancelText: "Cancel",
        confirmText: saving ? "Saving..." : "Save",
      }
    } else if (confirmType === "cancel") {
      return {
        title: "Discard changes?",
        message: "Are you sure you want to discard your unsaved changes?",
        cancelText: "Keep editing",
        confirmText: "Discard",
      }
    } else {
      return {
        title: "Confirm",
        message: "Are you sure?",
        cancelText: "Cancel",
        confirmText: "OK",
      }
    }
  })()

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Full Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.valueInput} value={username} editable={editing} onChangeText={setUsername} />
        </View>

        {/* Email */}
        <View style={styles.section}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput style={styles.valueInput} value={email} editable={editing} onChangeText={setEmail} />
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

        {/* Stats */}
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
            <TouchableOpacity style={styles.primaryButton} onPress={onSavePressed}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancelPressed}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editButtonsRow}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setEditing(true)}>
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Confirm modal used for save / cancel */}
      <ConfirmModal
        visible={confirmVisible}
        title={modalProps.title}
        message={modalProps.message}
        cancelText={modalProps.cancelText}
        confirmText={modalProps.confirmText}
        onCancel={handleCancelInModal}
        onConfirm={handleConfirm}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000ff", padding: 12 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000000ff" },
  card: { backgroundColor: "#101111ff", padding: 20, borderRadius: 14, shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, elevation: 5 },
  section: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "500", color: "#9CA3AF", marginBottom: 5, letterSpacing: 0.3 },
  valueInput: { fontSize: 17, color: "#E5E7EB", fontWeight: "400", borderBottomWidth: 1, borderBottomColor: "#374151", paddingVertical: 4 },
  textArea: { borderWidth: 1, borderColor: "#212224ff", borderRadius: 8, padding: 12, fontSize: 15, textAlignVertical: "top", color: "#D1D5DB", backgroundColor: "#1c1c1dff", lineHeight: 20 },
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
  logoutButtonText: { color: "#EF4444", fontWeight: "600", fontSize: 15 },
})
