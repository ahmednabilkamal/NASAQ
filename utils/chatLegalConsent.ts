import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@venus_user_chat_legal_accepted_v1';

export async function hasUserAcceptedChatLegal(): Promise<boolean> {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === '1';
}

export async function setUserAcceptedChatLegal(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, '1');
}
