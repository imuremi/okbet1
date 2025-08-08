import React from "react";
import { Text, View, StyleSheet } from "react-native";

export default function BetScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bet</Text>
        <Text style={styles.subtitle}>Welcome to the betting screen</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.betText}>Place your bets here!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  betText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#676FFF',
    textAlign: 'center',
  },
}); 