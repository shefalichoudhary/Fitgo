export const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${String(h).padStart(2, "0")} hr ${String(m).padStart(2, "0")} min`
  }

  return `${String(m).padStart(2, "0")} min ${String(s).padStart(2, "0")} sec`
}