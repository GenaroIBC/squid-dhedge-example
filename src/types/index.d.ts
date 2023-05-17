export type KnownResult<T> = {
  ok: true
  data: T
}

export type KnownError = {
  ok: false
  error: string
}

export type KnownResponse<T> = KnownResult<T> | KnownError
