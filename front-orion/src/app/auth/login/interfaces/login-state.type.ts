import { LoginSuccessResponse } from './login.interface';

export type LoginState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: LoginSuccessResponse }
  | { status: 'error'; errors: string[] };
