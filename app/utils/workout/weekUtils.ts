import { startOfWeek, endOfWeek, format, parse } from "date-fns"

export const getWeekRange = (date: string) => {
  const d = new Date(date)
  const weekStart = startOfWeek(d, { weekStartsOn: 1 })
  return `${format(weekStart, "MMM d, yyyy")} - ${format(
    endOfWeek(d, { weekStartsOn: 1 }), "MMM d, yyyy"
  )}`
}

export const getRelativeWeekTitle = (weekRange: string) => {
  const weekStartStr = weekRange.split(" - ")[0]
  const weekStart = parse(weekStartStr, "MMM d, yyyy", new Date())
  const now = new Date()

  const diffWeeks = Math.floor(
    (now.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )

  return diffWeeks === 0
    ? "This Week"
    : diffWeeks === 1
    ? "Last Week"
    : `${diffWeeks} Weeks Ago`
}
