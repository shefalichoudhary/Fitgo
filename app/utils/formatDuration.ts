export const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds} sec`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds
      ? `${minutes} min ${remainingSeconds} sec`
      : `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`
}
