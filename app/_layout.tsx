import Constants from "expo-constants";
import { Stack } from "expo-router";
import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import "@walletconnect/react-native-compat";
import { WagmiProvider } from "wagmi";
import { mainnet, polygon, arbitrum } from "@wagmi/core/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createAppKit,
  defaultWagmiConfig,
  AppKit,
} from "@reown/appkit-wagmi-react-native";

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId at https://dashboard.reown.com
const projectId = "a987f3a48e0a447ad6a3025c107be265"; // Replace with your actual project ID

// 2. Create config
const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "myapp://", // Using the scheme from app.json
    universal: "https://your-app-universal-link.com", // Replace with your universal link
  },
};

const chains = [mainnet, polygon, arbitrum] as const;

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal - This must be called at module level
createAppKit({
  projectId,
  metadata,
  wagmiConfig,
  defaultChain: mainnet, // Optional
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
});

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  
  const appId = Constants.expoConfig?.extra?.privyAppId;
  const clientId = Constants.expoConfig?.extra?.privyClientId;
  
  console.log("Privy Configuration:", { appId, clientId });
  
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={appId}
          clientId={clientId}
        >
          <Stack>
            <Stack.Screen name="index" />
          </Stack>
          <PrivyElements />
          <AppKit />
        </PrivyProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
