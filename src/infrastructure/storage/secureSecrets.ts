import * as SecureStore from 'expo-secure-store';

const options: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureSecrets = {
  async save(ref: string, privateKey: string) {
    await SecureStore.setItemAsync(ref, privateKey, options);
  },
  async get(ref: string) {
    return SecureStore.getItemAsync(ref, options);
  },
  async remove(ref: string) {
    await SecureStore.deleteItemAsync(ref, options);
  },
};
