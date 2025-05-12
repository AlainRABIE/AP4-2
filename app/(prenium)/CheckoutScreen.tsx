import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CheckoutScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const planName = params.planName as string;
  const planPrice = params.planPrice as string;
  const planPeriod = params.planPeriod as string;
  
  const successAnim = new Animated.Value(0);
  
  useEffect(() => {
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const scaleAnim = successAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 1]
  });

  const goToHome = () => {
    router.push('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6A88', '#FF99AC']}
        style={styles.gradient}
      >
        <View style={styles.contentContainer}>
          <Animated.View 
            style={[
              styles.successIconContainer, 
              {transform: [{scale: scaleAnim}]}
            ]}
          >
            <Ionicons name="checkmark-circle" size={80} color="#fff" />
          </Animated.View>
          
          <Text style={styles.title}>Paiement Confirmé !</Text>
          
          <View style={styles.card}>
            <Text style={styles.message}>
              Votre abonnement <Text style={styles.highlight}>{planName || "premium"}</Text> a été activé avec succès.
            </Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Prix :</Text>
              <Text style={styles.priceValue}>
                {Number(planPrice || 0).toFixed(2).replace('.', ',')} € / {planPeriod || "mois"}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={goToHome}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Retour à l'accueil</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: 'white',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    lineHeight: 24,
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FF6A88',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 106, 136, 0.1)',
    borderRadius: 8,
    padding: 12,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 5,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6A88',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FF6A88',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CheckoutScreen;
