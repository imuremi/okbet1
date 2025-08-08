import React, { useState, useCallback } from "react";
import { Text, TextInput, View, Button, ScrollView, StyleSheet } from "react-native";

import {
  usePrivy,
  useEmbeddedEthereumWallet,
  getUserEmbeddedEthereumWallet,
  PrivyEmbeddedWalletProvider,
  useLinkWithOAuth,
} from "@privy-io/expo";
import Constants from "expo-constants";
import { useLinkWithPasskey } from "@privy-io/expo/passkey";
import { PrivyUser } from "@privy-io/public-api";
import { AppKitButton } from "@reown/appkit-wagmi-react-native";

const toMainIdentifier = (x: PrivyUser["linked_accounts"][number]) => {
  if (x.type === "phone") {
    return x.phoneNumber;
  }
  if (x.type === "email" || x.type === "wallet") {
    return x.address;
  }

  if (x.type === "twitter_oauth" || x.type === "tiktok_oauth") {
    return x.username;
  }

  if (x.type === "custom_auth") {
    return x.custom_user_id;
  }

  return x.type;
};

export const UserScreen = () => {
  const [chainId, setChainId] = useState("1");
  const [signedMessages, setSignedMessages] = useState<string[]>([]);

  const { logout, user } = usePrivy();
  const { linkWithPasskey } = useLinkWithPasskey();
  const oauth = useLinkWithOAuth();
  const { wallets, create } = useEmbeddedEthereumWallet();
  const account = getUserEmbeddedEthereumWallet(user);

  const signMessage = useCallback(
    async (provider: PrivyEmbeddedWalletProvider) => {
      try {
        const message = await provider.request({
          method: "personal_sign",
          params: [`0x0${Date.now()}`, account?.address],
        });
        if (message) {
          setSignedMessages((prev) => prev.concat(message));
        }
      } catch (e) {
        console.error(e);
      }
    },
    [account?.address]
  );

  const switchChain = useCallback(
    async (provider: PrivyEmbeddedWalletProvider, id: string) => {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: id }],
        });
        alert(`Chain switched to ${id} successfully`);
      } catch (e) {
        console.error(e);
      }
    },
    [account?.address]
  );

  if (!user) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Text style={styles.label}>User ID</Text>
            <Text style={styles.value}>{user.id}</Text>
          </View>
        </View>

        {/* Linked Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked Accounts</Text>
          {user?.linked_accounts.length ? (
            <View style={styles.card}>
              {user?.linked_accounts?.map((m, index) => (
                <View key={`linked-account-${m.type}-${m.verified_at}-${index}`} style={styles.accountItem}>
                  <Text style={styles.accountType}>{m.type}</Text>
                  <Text style={styles.accountValue}>{toMainIdentifier(m)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.emptyText}>No linked accounts</Text>
            </View>
          )}
        </View>

        {/* Wallet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet</Text>
          <View style={styles.card}>
            {account?.address ? (
              <>
                <Text style={styles.label}>Embedded Wallet</Text>
                <Text style={styles.value}>{account?.address}</Text>
              </>
            ) : (
              <Text style={styles.emptyText}>No wallet created</Text>
            )}
            <Button title="Create Wallet" onPress={() => create()} color="#676FFF" />
          </View>
        </View>

        {/* Wallet Actions */}
        {account?.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wallet Actions</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Chain ID</Text>
                <TextInput
                  value={chainId}
                  onChangeText={setChainId}
                  placeholder="Enter chain ID"
                  style={styles.input}
                />
              </View>
              <View style={styles.buttonGroup}>
                <Button
                  title="Switch Chain"
                  onPress={async () =>
                    switchChain(await wallets[0].getProvider(), chainId)
                  }
                  color="#676FFF"
                />
                <Button
                  title="Sign Message"
                  onPress={async () => signMessage(await wallets[0].getProvider())}
                  color="#676FFF"
                />
              </View>
            </View>
          </View>
        )}

        {/* Signed Messages */}
        {signedMessages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Signed Messages</Text>
            <View style={styles.card}>
              {signedMessages.map((m, index) => (
                <View key={index} style={styles.messageItem}>
                  <Text style={styles.messageText}>{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Connect External Wallet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connect External Wallet</Text>
          <View style={styles.card}>
            <AppKitButton />
          </View>
        </View>

        {/* Link Accounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Link Accounts</Text>
          <View style={styles.card}>
            <Button
              title="Link Passkey"
              onPress={() =>
                linkWithPasskey({
                  relyingParty: Constants.expoConfig?.extra?.passkeyAssociatedDomain,
                })
              }
              color="#676FFF"
            />
            <View style={styles.socialButtons}>
              {(["github", "google", "discord", "apple"] as const).map((provider) => (
                <View key={provider} style={styles.socialButton}>
                  <Button
                    title={`Link ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
                    disabled={oauth.state.status === "loading"}
                    onPress={() => oauth.link({ provider })}
                    color="#676FFF"
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button title="Sign Out" onPress={logout} color="#dc3545" />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    textTransform: 'capitalize',
  },
  accountValue: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  buttonGroup: {
    gap: 12,
  },
  messageItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'monospace',
  },
  socialButtons: {
    marginTop: 12,
    gap: 8,
  },
  socialButton: {
    marginBottom: 4,
  },
});
