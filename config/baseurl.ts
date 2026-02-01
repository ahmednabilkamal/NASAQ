const base_URL = process.env.EXPO_NODE_ENV === "production" ? process.env.EXPO_PUBLIC_LOCAL_BASE_URL : process.env.EXPO_PUBLIC_SERVER_URL;

export default base_URL; 