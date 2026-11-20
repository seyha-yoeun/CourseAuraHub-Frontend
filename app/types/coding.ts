export type CodeVerdict = 'accepted' | 'wrong_answer' | 'compile_error' | 'runtime_error' | 'time_limit' | 'error'

export interface CodeCase {
  input: string | null
  expectedOutput: string
}

export interface CodeExerciseForm {
  language: string
  instructions: string | null
  starterCode: string | null
  examples: CodeCase[]
  tests: CodeCase[]
  timeLimitSeconds: number | null
  memoryLimitMb: number | null
}

/** Staff view, with the hidden tests and the languages the server can run. */
export interface CodeExercise extends CodeExerciseForm {
  lessonId: number
  timeLimitSeconds: number
  memoryLimitMb: number
  languages: string[]
}

export interface CodeSubmission {
  code: string
  passed: boolean
  passedTests: number
  totalTests: number
  verdict: CodeVerdict
  createdAt: string
}

/** Learner view: examples in full, hidden tests only as a count. */
export interface LearnerCodeExercise {
  lessonId: number
  language: string
  instructions: string | null
  starterCode: string | null
  examples: CodeCase[]
  hiddenTests: number
  timeLimitSeconds: number
  memoryLimitMb: number
  passed: boolean
  lastSubmission: CodeSubmission | null
  // Whether the server can run code right now
  runsEnabled: boolean
}

export interface CodeExampleResult {
  input: string | null
  expectedOutput: string
  actualOutput: string | null
  passed: boolean
}

export interface CodeRunResult {
  passed: boolean
  passedTests: number
  totalTests: number
  verdict: CodeVerdict
  // Compiler or runtime output for examples; for hidden tests only which one failed
  message: string | null
  examples: CodeExampleResult[]
  lessonCompleted: boolean
}
