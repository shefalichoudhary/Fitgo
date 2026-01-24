export type Measurement = {
  id: string
  date: string | null
  weight: number | null
  bodyFat: number | null
  muscleMass: number | null
  waist: number | null
  chest: number | null
  shoulders?: number | null
  neck?: number | null
  hips?: number | null

  leftArm?: number | null
  rightArm?: number | null
  leftThigh?: number | null
  rightThigh?: number | null
  leftCalf?: number | null
  rightCalf?: number | null

  notes?: string | null
}