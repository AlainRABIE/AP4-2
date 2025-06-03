import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Share
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Coach {
  id: string;
  email: string;
  nomComplet?: string;
  role: string;
  speciality?: string;
  experience?: number;
  rating?: number;
  photoURL?: string;
  urlAvatar?: string; 
  image?: string;
  bio?: string;
  sessionPrice?: string;
  certifications?: string[];
  telephone?: string;
  disponibilites?: Record<string, any>[];
}

export default function CoachPresentation() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoachDetails = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const coachDoc = await getDoc(doc(db, 'utilisateurs', id as string));
        
        if (coachDoc.exists()) {
          setCoach({
            id: coachDoc.id,
            ...coachDoc.data() as Omit<Coach, 'id'>
          });
        } else {
          console.error('Aucun coach trouvé avec cet ID');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails du coach:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoachDetails();
  }, [id]);

  const renderStars = (rating: number = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<MaterialIcons key={i} name="star" size={18} color="#FFB800" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<MaterialIcons key={i} name="star-half" size={18} color="#FFB800" />);
      } else {
        stars.push(<MaterialIcons key={i} name="star-outline" size={18} color="#FFB800" />);
      }
    }
    
    return <View style={styles.ratingContainer}>{stars}</View>;
  };

  const handleShare = async () => {
    if (!coach) return;
    
    try {
      await Share.share({
        message: `Découvrez ${coach.nomComplet}, coach spécialisé en ${coach.speciality || 'fitness'} avec ${coach.experience || 0} ans d'expérience !`,
        title: `Profil de Coach: ${coach.nomComplet}`
      });
    } catch (error) {
      console.error('Erreur lors du partage:', error);
    }
  };

  const handleContact = () => {
    if (coach?.telephone) {
      Linking.openURL(`tel:${coach.telephone}`);
    } else if (coach?.email) {
      Linking.openURL(`mailto:${coach.email}`);
    }
  };

  const handleReservation = () => {
    if (coach?.id) {
      router.push({
        pathname: '/(client)/rendezvous',
        params: { coachId: coach.id }
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6A88" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!coach) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#FF6A88" />
        <Text style={styles.errorText}>Coach introuvable</Text>
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => router.back()}
        >
          <Text style={styles.returnButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#FF6A88', '#FF8E53']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleShare} 
          style={styles.shareButton}
        >
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.avatarContainer}>
          <Image
            source={{ 
              uri: coach.urlAvatar || coach.photoURL || coach.image || 
                  "https://randomuser.me/api/portraits/men/32.jpg"
            }}
            style={styles.avatar}
          />
        </View>
        
        <Text style={styles.name}>{coach.nomComplet || "Coach"}</Text>
        
        {coach.speciality && (
          <View style={styles.specialityContainer}>
            <Text style={styles.speciality}>{coach.speciality}</Text>
          </View>
        )}
        
        {coach.rating && (
          <View style={styles.headerRating}>
            {renderStars(coach.rating)}
            <Text style={styles.ratingText}>{coach.rating.toFixed(1)}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.bio}>
            {coach.bio || `Coach professionnel${coach.speciality ? ` spécialisé en ${coach.speciality}` : ''}.`}
          </Text>
          
          <View style={styles.priceContainer}>
            <MaterialIcons name="euro" size={20} color="#FF6A88" />
            <Text style={styles.priceText}>{coach.sessionPrice || "N/A"}€ par séance</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialIcons name="today" size={22} color="#FF6A88" />
            <Text style={styles.infoText}>Disponible</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="schedule" size={22} color="#FF6A88" />
            <Text style={styles.infoText}>60 min</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="location-on" size={22} color="#FF6A88" />
            <Text style={styles.infoText}>À domicile</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="fitness-center" size={22} color="#FF6A88" />
            <Text style={styles.infoText}>Équipement</Text>
          </View>
        </View>

        {coach.certifications && coach.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {coach.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <MaterialIcons name="verified" size={20} color="#22C55E" />
                <Text style={styles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactItem}>
            <MaterialIcons name="email" size={20} color="#FF6A88" />
            <Text style={styles.contactText}>{coach.email}</Text>
          </View>
          
          {coach.telephone && (
            <View style={styles.contactItem}>
              <MaterialIcons name="phone" size={20} color="#FF6A88" />
              <Text style={styles.contactText}>{coach.telephone}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.reservationButton}
            onPress={handleReservation}
          >
            <Text style={styles.reservationButtonText}>Prendre rendez-vous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContact}
          >
            <Text style={styles.contactButtonText}>Contacter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: '#334155',
    marginBottom: 20,
  },
  returnButton: {
    backgroundColor: '#FF6A88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  returnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  specialityContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginBottom: 12,
  },
  speciality: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  headerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  priceText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#334155',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#334155',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  certificationText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#334155',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#334155',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  reservationButton: {
    flex: 2,
    backgroundColor: '#FF6A88',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#FF6A88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  reservationButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6A88',
  },
  contactButtonText: {
    color: '#FF6A88',
    fontWeight: 'bold',
    fontSize: 16,
  }
});