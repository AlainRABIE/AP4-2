import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../firebase/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function Mdpoublie() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(50);
  const inputScale = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);
  const checkmarkOpacity = useSharedValue(0);
  
  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 800 });
    slideAnim.value = withTiming(0, { duration: 800 });
  }, []);

  const inputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }]
    };
  });
  
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideAnim.value }]
    };
  });
  
  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: checkmarkOpacity.value,
      transform: [{ scale: checkmarkScale.value }]
    };
  });

  const focusInput = () => {
    inputScale.value = withSpring(1.02);
  };

  const blurInput = () => {
    inputScale.value = withSpring(1);
  };

  const checkEmailExists = async (email: unknown) => {
    try {
      const userQuery = query(collection(db, 'utilisateurs'), where('email', '==', email));
      const querySnapshot = await getDocs(userQuery);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  };

  const animateSuccess = () => {
    checkmarkScale.value = withSpring(1, { damping: 12 });
    checkmarkOpacity.value = withTiming(1);
    
    setTimeout(() => {
      router.replace('/login');
    }, 2500);
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();
    
    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Format d\'email invalide');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const emailExists = await checkEmailExists(email);
      
      if (!emailExists) {
        setError("Cette adresse email n'est pas associée à un compte");
        setLoading(false);
        return;
      }
      
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      setSuccess(true);
      animateSuccess();
      
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe :', error);
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={['#FF6A88', '#FF8E53']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Animated.View 
            style={[styles.contentWrapper, containerStyle]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.formContainer}>
              {!success ? (
                <>
                  <Text style={styles.title}>Mot de passe oublié ?</Text>
                  <Text style={styles.subtitle}>
                    Entrez votre adresse email pour recevoir un lien de réinitialisation
                  </Text>
                  
                  {error ? (
                    <Animated.View 
                      entering={FadeInDown.duration(400)}
                      style={styles.errorContainer}
                    >
                      <Ionicons name="alert-circle" size={20} color="#fff" />
                      <Text style={styles.errorText}>{error}</Text>
                    </Animated.View>
                  ) : null}
                  
                  <Animated.View style={[styles.inputWrapper, inputStyle]}>
                    <View style={styles.inputContainer}>
                      <Ionicons name="mail-outline" size={22} color="#FF6A88" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Votre adresse email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        onFocus={focusInput}
                        onBlur={blurInput}
                      />
                      {email ? (
                        <TouchableOpacity onPress={() => setEmail('')}>
                          <Ionicons name="close-circle" size={20} color="#999" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </Animated.View>

                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.buttonText}>Réinitialiser</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <Animated.View style={[styles.checkmarkCircle, checkmarkStyle]}>
                    <Ionicons name="checkmark" size={40} color="#FFF" />
                  </Animated.View>
                  <Text style={styles.successTitle}>Email envoyé</Text>
                  <Text style={styles.successText}>
                    Les instructions de réinitialisation ont été envoyées à {email}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.replace('/login')}
              >
                <Ionicons name="arrow-back-outline" size={16} color="#FF6A88" style={styles.loginLinkIcon} />
                <Text style={styles.loginLinkText}>Retour à la connexion</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentWrapper: {
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 90,
    height: 90,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 25,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#eaeaea',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF6A88',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6A88',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginLinkIcon: {
    marginRight: 6,
  },
  loginLinkText: {
    color: '#FF6A88',
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6A88',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  }
});