export const ExercisesValidationMessages = {
  NAME_REQUIRED: 'name должен быть строкой.',
  NAME_TOO_LONG: 'name не должен превышать 150 символов.',
  DESCRIPTION_REQUIRED: 'description должен быть строкой.',
  DESCRIPTION_TOO_LONG: 'description не должен превышать 2000 символов.',
  MUSCLE_GROUP_INVALID: 'muscleGroup должен быть одним из допустимых значений.',
  SOURCE_INVALID: 'source должен быть одним из значений: ALL, CATALOG, CUSTOM.',
  SEARCH_INVALID: 'search должен быть строкой.',
  SEARCH_TOO_LONG: 'search не должен превышать 100 символов.',
} as const;
