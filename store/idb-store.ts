import { del, get, set, createStore } from "idb-keyval"
import { StateStorage } from "zustand/middleware"

const customStore = createStore('json-workbench', 'editor-settings');

// Custom storage object
export const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name, customStore)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value, customStore)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name, customStore)
  },
}
