import React from "react"
import { ExerciseItem } from "./ExerciseItem"

export const ExerciseList = ({
  exercise,
  disablePress,
  deleteExercise,
}: any) => {
  return (
    <ExerciseItem
      name={exercise.name}
      disablePress={disablePress}
      onDelete={() => deleteExercise(exercise.id)}
    >

    </ExerciseItem>
  )
}


