import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/firebaseConfig';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { styles as baseStyles } from '@/style/profil/profilStyles';
import { useRouter } from 'expo-router';

const styles = {
  ...baseStyles,
  content: {
    padding: 16,
    flex: 1,
  },
  header: {
    backgroundColor: '#FF6A88',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold' as const,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center' as const,
    width: '30%' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FF6A88',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  quickAccessContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 20,
    flexWrap: 'wrap' as const,
  },
  quickAccessButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: '48%' as any,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAccessText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center' as const,
    color: '#333',
  },
  activityFeed: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6A88',
    marginRight: 10,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 10,
    marginTop: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  viewAllText: {
    color: '#FF6A88',
    marginRight: 5,
    fontWeight: '500' as '500',
    fontSize: 15,
  },
  dbLocationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  databaseLocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
  },
  logsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  logIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  logContent: {
    flex: 1,
  },
  logMessage: {
    fontSize: 15,
    lineHeight: 20,
  },
  logTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  errorText: {
    color: '#FF4040',
    fontWeight: '500' as '500',
  },
  warningText: {
    color: '#FFA500',
    fontWeight: '500' as '500',
  },
  infoText: {
    color: '#3498db',
  },
  emptyText: {
    textAlign: 'center' as const,
    color: '#999',
    padding: 20,
    fontStyle: 'italic' as const,
  },
};

export default function AdminDashboard() {
  interface LogEntry {
    type: string;
    message: string;
    timestamp: string;
    id: string;
  }
  
  interface Activity {
    id: string;
    type: string;
    user?: string;
    email?: string;
    timestamp: any;
  }

  const router = useRouter();

  const [databaseLogs, setDatabaseLogs] = useState<LogEntry[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [coachCount, setCoachCount] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <Ionicons name="alert-circle" size={18} color="#FF4040" />;
      case 'warning':
        return <Ionicons name="warning" size={18} color="#FFA500" />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={18} color="#3498db" />;
    }
  };
  
  const formatDate = (timestamp: string | number | Date | any) => {
    if (!timestamp) return '';
    
    try {
      const date = typeof timestamp === 'object' && 'toDate' in timestamp ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('fr-FR') + ' - ' + date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return 'Date inconnue';
    }
  };

  const fetchStats = async () => {
    try {
      const usersRef = collection(db, 'utilisateurs');
      const usersSnapshot = await getDocs(usersRef);
      
      let users = 0;
      let coaches = 0;
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === 'utilisateur') {
          users++;
        } else if (userData.role === 'coach') {
          coaches++;
        }
      });
      
      setUserCount(users);
      setCoachCount(coaches);
      
      const sessionRef = collection(db, 'programme');
      const sessionSnapshot = await getDocs(sessionRef);
      setSessionCount(sessionSnapshot.size);
      
    } catch (error: any) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      setDatabaseLogs(prevLogs => [
        {
          type: 'error',
          message: `Erreur de récupération des stats: ${error.message}`,
          timestamp: formatDate(new Date()),
          id: 'error-stats'
        },
        ...prevLogs
      ]);
    }
  };

  const fetchActivities = async () => {
    try {
      const usersRef = collection(db, 'utilisateurs');
      const usersQuery = query(usersRef, orderBy('derniereConnexion', 'desc'), limit(10));
      const usersSnapshot = await getDocs(usersQuery);
      
      const activities = usersSnapshot.docs.map(doc => {
        const userData = doc.data();
        return {
          id: doc.id,
          type: 'connection',
          user: userData.nomComplet || userData.email,
          timestamp: userData.derniereConnexion,
          email: userData.email
        };
      });
      
      setRecentActivities(activities);
      
      const logs: LogEntry[] = [];
      activities.slice(0, 5).forEach(activity => {
        logs.push({
          type: 'info',
          message: `Dernière connexion: ${activity.user || activity.email}`,
          timestamp: formatDate(activity.timestamp),
          id: `login-${activity.id}`
        });
      });
      
      const modifiedUsersQuery = query(usersRef, orderBy('dateModification', 'desc'), limit(5));
      const modifiedUsersSnapshot = await getDocs(modifiedUsersQuery);
      
      modifiedUsersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        logs.push({
          type: 'warning',
          message: `Profil modifié: ${userData.nomComplet || userData.email}`,
          timestamp: formatDate(userData.dateModification),
          id: `modified-${doc.id}`
        });
      });
      
      logs.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      });
      
      setDatabaseLogs(logs);
      
    } catch (error: any) {
      console.error("Erreur lors de la récupération des activités:", error);
      setDatabaseLogs([{
        type: 'error',
        message: `Erreur de récupération des activités: ${error.message}`,
        timestamp: formatDate(new Date()),
        id: 'error-activities'
      }]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStats();
    fetchActivities();
    
    const usersRef = collection(db, 'utilisateurs');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          setDatabaseLogs(prevLogs => [{
            type: 'info',
            message: `Nouvel utilisateur: ${change.doc.data().nomComplet || change.doc.data().email}`,
            timestamp: formatDate(new Date()),
            id: `new-${change.doc.id}`
          }, ...prevLogs]);
        }
        if (change.type === "modified") {
          setDatabaseLogs(prevLogs => [{
            type: 'warning',
            message: `Utilisateur modifié: ${change.doc.data().nomComplet || change.doc.data().email}`,
            timestamp: formatDate(new Date()),
            id: `mod-${change.doc.id}`
          }, ...prevLogs]);
        }
      });
      
      fetchStats();
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord Admin</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userCount}</Text>
            <Text style={styles.statLabel}>Utilisateurs</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{coachCount}</Text>
            <Text style={styles.statLabel}>Coachs</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{sessionCount}</Text>
            <Text style={styles.statLabel}>Séances</Text>
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Accès rapide</Text>
        
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => router.push('/Listutilisateur')}
          >
            <Ionicons name="people" size={24} color="#FF6A88" />
            <Text style={styles.quickAccessText}>Gestion des utilisateurs</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessButton}
            onPress={() => router.push('/Listcoach')}
          >
            <Ionicons name="school" size={24} color="#FF6A88" />
            <Text style={styles.quickAccessText}>Liste des coachs</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Activité récente</Text>
        
        <View style={styles.activityFeed}>
          {recentActivities.slice(0, 3).map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View>
                <Text style={styles.activityText}>
                  {activity.user || activity.email}
                </Text>
                <Text style={styles.activityTime}>
                  {formatDate(activity.timestamp)}
                </Text>
              </View>
            </View>
          ))}
          
          {recentActivities.length === 0 && !loading && (
            <Text style={styles.emptyText}>Aucune activité récente</Text>
          )}
          
          {loading && (
            <ActivityIndicator size="small" color="#FF6A88" />
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Logs de la base de données</Text>
        
        <View style={styles.logsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#FF6A88" />
          ) : (
            <>
              {databaseLogs.length === 0 ? (
                <Text style={styles.emptyText}>Aucun log disponible</Text>
              ) : (
                databaseLogs.map((log, index) => (
                  <View key={log.id || index} style={styles.logItem}>
                    <View style={styles.logIconContainer}>
                      {getLogIcon(log.type)}
                    </View>
                    <View style={styles.logContent}>
                      <Text style={[
                        styles.logMessage,
                        log.type === 'error' ? styles.errorText : 
                        log.type === 'warning' ? styles.warningText : styles.infoText
                      ]}>
                        {log.message}
                      </Text>
                      <Text style={styles.logTime}>{log.timestamp}</Text>
                    </View>
                  </View>
                ))
              )}
            
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Voir tous les logs</Text>
                <Ionicons name="chevron-forward" size={16} color="#FF6A88" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}