import React, { useEffect, useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from "react-native"
import { db } from "@/utils/storage"
import { users } from "@/utils/storage/schema"
import { eq } from "drizzle-orm"
import { Ionicons } from "@expo/vector-icons"
import { getCurrentUser } from "@/utils/user"
import { ConfirmModal } from "@/components/ConfirmModal"
import LoadingOverlay from "@/components/LoadingOverlay"
import Feather from "@expo/vector-icons/Feather"

type ConfirmType = "save" | "cancel" | null

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)

  const [form, setForm] = useState({
    username: "",
    email: "",
    age: "",
    height: "",
    gender: "",
    experience: "",
    fitness_goal: "",
    bio: "",
  })

  const [confirmVisible, setConfirmVisible] = useState(false)
  const [confirmType, setConfirmType] = useState<ConfirmType>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser()
      if (u) {
        setUser(u)
        setForm({
          username: u.username ?? "",
          email: u.email ?? "",
          age: u.age?.toString() ?? "",
          height: u.height?.toString() ?? "",
          gender: u.gender ?? "",
          experience: u.experience ?? "",
          fitness_goal: u.fitness_goal ?? "",
          bio: u.bio ?? "",
        })
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  const handleChange = (key: string, value: string) => {
    setForm((p) => ({ ...p, [key]: value }))
  }

  const saveProfile = async () => {
    if (!user) return
    setSaving(true)

    await db
      .update(users)
      .set({
        username: form.username,
        email: form.email,
        age: form.age ? Number(form.age) : null,
        height: form.height ? Number(form.height) : null,
        gender: form.gender || null,
        experience: form.experience || null,
        fitness_goal: form.fitness_goal ,
        bio: form.bio,
      })
      .where(eq(users.id, user.id))
      .run()

    setEditing(false)
    setConfirmVisible(false)
    setSaving(false)
  }

  const discardChanges = () => {
    if (!user) return
    setForm({
      username: user.username ?? "",
      email: user.email ?? "",
      age: user.age?.toString() ?? "",
      height: user.height?.toString() ?? "",
      gender: user.gender ?? "",
      experience: user.experience ?? "",
      fitness_goal: user.fitness_goal ?? "",
      bio: user.bio ?? "",
    })
    setEditing(false)
    setConfirmVisible(false)
  }

  if (loading) {
    return <LoadingOverlay visible message="Loading profile..." />
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.card}>

        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={72} color="#FFF" />
          <Text style={styles.name}>{form.username}</Text>
          <Text style={styles.email}>{form.email}</Text>
        </View>

        {/* PERSONAL */}
        <Section title="Personal Information">
          <Field label="Full Name" value={form.username} editable={editing} onChange={(v:any)=>handleChange("username",v)} />
          <Field label="Email" value={form.email} editable={editing} onChange={(v:any)=>handleChange("email",v)} />
          <Field label="Age" value={form.age} editable={editing} keyboardType="numeric" onChange={(v:any)=>handleChange("age",v)} />
          <Field label="Height (cm)" value={form.height} editable={editing} keyboardType="numeric" onChange={(v:any)=>handleChange("height",v)} />

          {/* GENDER */}
          {(editing || !form.gender) && (
            <OptionGroup
              label="Gender"
              options={["Male", "Female", "Other"]}
              value={form.gender}
              onChange={(v:any)=>handleChange("gender",v)}
            />
          )}
          {!editing && form.gender && (
            <Field label="Gender" value={form.gender} editable={false} />
          )}
        </Section>

        {/* FITNESS */}
        <Section title="Fitness Profile">
          {(editing || !form.experience) && (
            <OptionGroup
              label="Experience"
              options={["Beginner","Intermediate","Advanced"]}
              value={form.experience}
              onChange={(v:any)=>handleChange("experience",v)}
            />
          )}
          {!editing && form.experience && (
            <Field label="Experience" value={form.experience} editable={false} />
          )}

          {(editing || !form.fitness_goal) && (
            <OptionGroup
              label="Fitness Goal"
              options={["Lose Fat","Build Muscle","Stay Fit"]}
              value={form.fitness_goal}
              onChange={(v:any)=>handleChange("fitness_goal",v)}
            />
          )}
          {!editing && form.fitness_goal && (
            <Field label="Fitness Goal" value={form.fitness_goal} editable={false} />
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              value={form.bio}
              editable={editing}
              multiline
              onChangeText={(v)=>handleChange("bio",v)}
              style={styles.textArea}
              placeholder="Tell something about yourself…"
              placeholderTextColor="#6B7280"
            />
          </View>
        </Section>

        {/* ACTIONS */}
        {editing ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={()=>{setConfirmType("save");setConfirmVisible(true)}}>
              <Text style={styles.btnDark}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={()=>{setConfirmType("cancel");setConfirmVisible(true)}}>
              <Text style={styles.btnLight}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={()=>setEditing(true)}>
            <View style={{flexDirection:"row",alignItems:"center"}}>
              <Feather name="edit" size={18} color="#000" />
              <Text style={[styles.btnDark,{marginLeft:8}]}>Edit Profile</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ConfirmModal
        visible={confirmVisible}
        title={confirmType==="save"?"Save changes?":"Discard changes?"}
        message={confirmType==="save"?"Save profile updates?":"Unsaved changes will be lost."}
        cancelText="Cancel"
        confirmText={saving?"Saving...":"Confirm"}
        onCancel={()=>setConfirmVisible(false)}
        onConfirm={confirmType==="save"?saveProfile:discardChanges}
      />
    </ScrollView>
  )
}

/* ───────── HELPERS ───────── */

const Section = ({ title, children }: any) => (
  <View style={{ marginBottom: 26 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
)

const Field = ({ label, value, editable, onChange, keyboardType="default" }: any) => (
  <View style={styles.section}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      value={value}
      editable={editable}
      keyboardType={keyboardType}
      onChangeText={onChange}
      style={styles.input}
    />
  </View>
)

const OptionGroup = ({ label, options, value, onChange }: any) => (
  <View style={styles.section}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.optionRow}>
      {options.map((opt:string)=>{
        const selected = value===opt
        return (
          <TouchableOpacity key={opt} onPress={()=>onChange(opt)} style={[styles.optionChip, selected && styles.optionActive]}>
            <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
              {selected && <View style={styles.radioInner} />}
            </View>
            <Text style={[styles.optionText, selected && styles.optionTextActive]}>{opt}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  </View>
)

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:"#000" },
  card:{ backgroundColor:"#0B0B0C", margin:12, padding:20, borderRadius:20, borderWidth:1, borderColor:"#1F1F1F" },
  header:{ alignItems:"center", marginBottom:28 },
  name:{ color:"#FFF", fontSize:20, fontWeight:"700", marginTop:8 },
  email:{ color:"#9CA3AF", fontSize:13 },
  sectionTitle:{ color:"#E5E7EB", fontSize:13, fontWeight:"700", marginBottom:12, textTransform:"uppercase" },
  section:{ marginBottom:14 },
  label:{ color:"#9CA3AF", fontSize:12, marginBottom:6 },
  input:{ borderBottomWidth:1, borderBottomColor:"#2A2A2A", color:"#FFF", fontSize:15, paddingVertical:6 },
  textArea:{ borderWidth:1, borderColor:"#2A2A2A", borderRadius:12, padding:12, color:"#FFF", backgroundColor:"#050505", minHeight:90 },
  optionRow:{ flexDirection:"row", flexWrap:"wrap", gap:10 },
  optionChip:{ flexDirection:"row", alignItems:"center", padding:10, borderRadius:14, borderWidth:1, borderColor:"#2A2A2A", backgroundColor:"#050505" },
  optionActive:{ backgroundColor:"#FFF", borderColor:"#FFF" },
  optionText:{ color:"#D1D5DB", fontSize:13 },
  optionTextActive:{ color:"#000", fontWeight:"700" },
  radioOuter:{ width:16, height:16, borderRadius:8, borderWidth:2, borderColor:"#6B7280", marginRight:8, alignItems:"center", justifyContent:"center" },
  radioOuterActive:{ borderColor:"#000" },
  radioInner:{ width:8, height:8, borderRadius:4, backgroundColor:"#000" },
  actions:{ flexDirection:"row", gap:12 },
  primaryBtn:{ backgroundColor:"#FFF", paddingVertical:14, borderRadius:14, alignItems:"center", flex:1 },
  secondaryBtn:{ backgroundColor:"#1F2937", paddingVertical:14, borderRadius:14, alignItems:"center", flex:1 },
  btnDark:{ color:"#000", fontWeight:"700", fontSize:15 },
  btnLight:{ color:"#FFF", fontWeight:"700", fontSize:15 },
})
