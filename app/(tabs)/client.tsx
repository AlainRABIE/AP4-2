"";

import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

type Utilisateur = {
  id: string;
  nomComplet: string;
  email: string;
  age?: number;
  poids?: number;
  taille?: number;
  sexe?: string;
  departement?: string;
  abonnement?: string;
  urlAvatar?: string;
  derniereConnexion?: any;
};

export default function UtilisateursScreen() {
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function fetchUtilisateurs() {
      try {
        setLoading(true);
        
        const utilisateursRef = collection(db, 'utilisateurs');
        const q = query(utilisateursRef, where("role", "==", "utilisateur"));
        const querySnapshot = await getDocs(q);
        
        const utilisateursData: Utilisateur[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          utilisateursData.push({
            id: doc.id,
            nomComplet: data.nomComplet || 'Sans nom',
            email: data.email || 'Pas d\'email',
            age: data.age,
            poids: data.poids,
            taille: data.taille,
            sexe: data.sexe,
            departement: data.departement,
            abonnement: data.abonnement,
            urlAvatar: data.urlAvatar,
            derniereConnexion: data.derniereConnexion,
          });
        });
        
        setUtilisateurs(utilisateursData);
      } catch (err) {
        console.error("Erreur lors de la récupération des utilisateurs:", err);
        setError("Impossible de charger les utilisateurs");
      } finally {
        setLoading(false);
      }
    }

    fetchUtilisateurs();
  }, []);

  const filteredUtilisateurs = utilisateurs.filter(user => 
    user.nomComplet.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.departement && user.departement.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Jamais connecté';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getAvatarSource = (urlAvatar: string | undefined) => {
    return urlAvatar && urlAvatar.length > 0
      ? { uri: urlAvatar }
      : require('../../assets/images/default-avatar.png');
  };

  const renderUtilisateur = ({ item }: { item: Utilisateur }) => (
    <View style={styles.userCard}>
      <View style={styles.avatarContainer}>
        <Image 
          source={getAvatarSource(item.urlAvatar)}
          style={styles.avatar}
          defaultSource={require('../../assets/images/default-avatar.png')}
        />
        {item.abonnement && (
          <View style={[
            styles.abonnementBadge, 
            item.abonnement === "plus" ? styles.abonnementPlus : styles.abonnementBasic
          ]}>
            <Text style={styles.abonnementText}>{item.abonnement}</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nomComplet}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.detailsContainer}>
            {item.age && (
              <Text style={styles.detailText}>{item.age} ans</Text>
            )}
            {item.sexe && (
              <Text style={styles.detailText}>{item.sexe === 'homme' ? '♂️' : '♀️'} {item.sexe}</Text>
            )}
            {item.departement && (
              <Text style={styles.detailText}>📍 {item.departement}</Text>
            )}
          </View>
          {item.poids && item.taille && (
            <Text style={styles.physicalInfo}>
              {item.poids} kg • {item.taille} cm
            </Text>
          )}
          <Text style={styles.lastConnection}>
            Dernière connexion: {formatDate(item.derniereConnexion)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => router.push({ pathname: '/conversation', params: { userId: item.id, userName: item.nomComplet } })}
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path d="M8 11H8.01M12 11H12.01M16 11H16.01M21 20L17.6757 18.3378C17.4237 18.2118 17.2977 18.1488 17.1656 18.1044C17.0484 18.065 16.9277 18.0365 16.8052 18.0193C16.6672 18 16.5263 18 16.2446 18H6.2C5.07989 18 4.51984 18 4.09202 17.782C3.71569 17.5903 3.40973 17.2843 3.21799 16.908C3 16.4802 3 15.9201 3 14.8V7.2C3 6.07989 3 5.51984 3.21799 5.09202C3.40973 4.71569 3.71569 4.40973 4.09202 4.21799C4.51984 4 5.0799 4 6.2 4H17.8C18.9201 4 19.4802 4 19.908 4.21799C20.2843 4.40973 20.5903 4.71569 20.782 5.09202C21 5.51984 21 6.0799 21 7.2V20Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Utilisateurs</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un utilisateur..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        clearButtonMode="while-editing"
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setLoading(true);
            }}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>{filteredUtilisateurs.length} utilisateurs trouvés</Text>
          <FlatList
            data={filteredUtilisateurs}
            renderItem={renderUtilisateur}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3b82f6',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e5e7eb',
  },
  abonnementBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
  abonnementPlus: {
    backgroundColor: '#4f46e5', 
  },
  abonnementBasic: {
    backgroundColor: '#10b981', 
  },
  abonnementText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  physicalInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  lastConnection: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  messageButton: {
    marginLeft: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // messageIcon supprimé car remplacé par SVG
});