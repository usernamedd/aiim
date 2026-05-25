// Adapter: Tauri Command Adapter
// Bridge between UI layer and Tauri backend (Rust commands)

import { invoke } from '@tauri-apps/api/core';

export interface TauriCommandAdapter {
  invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T>;
}

export class DefaultTauriCommandAdapter implements TauriCommandAdapter {
  async invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    return invoke<T>(cmd, args);
  }
}
