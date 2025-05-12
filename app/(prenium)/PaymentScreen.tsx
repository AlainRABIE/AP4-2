import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Image } from 'react-native';
import { CardField, useStripe, CardFieldInput, initStripe } from '@stripe/stripe-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { STRIPE_PUBLISHABLE_KEY } from '../../config/stripe';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import app from '../../firebase/firebaseConfig'; 

export default function PaymentScreen() {
  const { createPaymentMethod, confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);
  
  const auth = getAuth(app);
  const db = getFirestore(app);

  const params = useLocalSearchParams();
  const planName = params.planName as string;
  const planPrice = params.planPrice as string;
  const planPeriod = params.planPeriod as string;

  useEffect(() => {
    initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.votre.app',
    });
  }, []);

  const updateUserSubscription = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      console.log(`Mise à jour de l'abonnement vers: ${planName}`);
      
      const userRef = doc(db, 'utilisateurs', user.uid);
      await updateDoc(userRef, {
        abonnement: planName, 
        derniereModification: serverTimestamp(),
        dateModification: serverTimestamp()
      });

      console.log(`Abonnement mis à jour avec succès vers: ${planName}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      Alert.alert('Information incomplète', 'Veuillez remplir toutes les informations de carte bancaire');
      return;
    }

    try {
      setLoading(true);

      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: 'Utilisateur Premium',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await updateUserSubscription();

      Alert.alert(
        'Paiement réussi!',
        'Votre abonnement premium est maintenant actif.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.push({
                pathname: '/(prenium)/CheckoutScreen',
                params: {
                  planName: planName,
                  planPrice: planPrice,
                  planPeriod: planPeriod
                }
              });
            }
          }
        ]
      );

    } catch (error) {
      Alert.alert('Erreur de paiement', error instanceof Error ? error.message : 'Une erreur inconnue est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Confirmer votre abonnement</Text>

      <View style={styles.planCard}>
        <Text style={styles.planTitle}>{planName}</Text>
        <Text style={styles.planPrice}>
          {Number(planPrice).toFixed(2).replace('.', ',')} € 
          <Text style={styles.planPeriod}>/ {planPeriod}</Text>
        </Text>
        <Text style={styles.planDescription}>
          • Accès à toutes les fonctionnalités{'\n'}
          • Support premium{'\n'}
          • Sans publicités
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.sectionTitle}>Informations de paiement</Text>

        <View style={styles.secureInfo}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2913/2913658.png' }} 
            style={styles.lockIcon} 
          />
          <Text style={styles.secureText}>Paiement sécurisé via Stripe</Text>
        </View>

        <CardField
          postalCodeEnabled={true}
          placeholders={{
            number: '4242 4242 4242 4242',
            expiration: 'MM/AA',
            cvc: 'CVC',
          }}
          cardStyle={styles.cardStyle}
          style={styles.cardField}
          onCardChange={setCardDetails}
        />
      </View>

      <TouchableOpacity 
        style={[styles.payButton, !cardDetails?.complete && styles.payButtonDisabled]} 
        onPress={handlePayment}
        disabled={loading || !cardDetails?.complete}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.payButtonText}>Payer par Carte</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.termsText}>
        En effectuant ce paiement, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
        Votre abonnement sera automatiquement renouvelé chaque mois jusqu'à annulation.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1E293B',
  },
  planCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1E293B',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0EA5E9',
    marginBottom: 16,
  },
  planPeriod: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: 'normal',
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  cardContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1E293B',
  },
  secureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  lockIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  secureText: {
    fontSize: 13,
    color: '#64748B',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginVertical: 8,
  },
  cardStyle: {
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  payButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  }
});

