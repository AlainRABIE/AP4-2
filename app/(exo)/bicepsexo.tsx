import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const bicepsExercises: Array<{
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest?: string;
  notes: string;
  icon: "barbell-outline" | "fitness-outline" | "body-outline" | "footsteps-outline";
}> = [
  {
    id: "1",
    name: "Curl Prise EZ",
    sets: 4,
    reps: "6-8",
    notes: "4 séries de 6-8 répétitions",
    icon: "barbell-outline",
  },
  {
    id: "2",
    name: "Curl Incliné sur Banc",
    sets: 3,
    reps: "6-8",
    notes: "3 séries de 6-8 répétitions à l'échec",
    icon: "fitness-outline",
  },
  {
    id: "3",
    name: "Curl Marteau",
    sets: 3,
    reps: "6-8",
    notes: "3 séries de 6-8 répétitions",
    icon: "body-outline",
  },
];

export default function BicepsExercises() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const toggleExpand = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <LinearGradient
        colors={['#FF6A88', '#FF8E53']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Programme Biceps</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
      
      <FlatList
        data={bicepsExercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.exerciseItem, expandedItem === item.id && styles.expandedItem]} 
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.95)']}
              style={styles.exerciseGradient}
            >
              <View style={styles.exerciseHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={22} color="#FF6A88" />
                </View>
                <Text style={styles.exerciseName}>{item.name}</Text>
                <Ionicons 
                  name={expandedItem === item.id ? "chevron-up" : "chevron-down"} 
                  size={22} 
                  color="#FF6A88" 
                />
              </View>
              
              <View style={styles.setContainer}>
                {Array.from({ length: item.sets }).map((_, idx) => (
                  <View key={idx} style={styles.setDot} />
                ))}
                <Text style={styles.setsText}>{item.sets} séries</Text>
              </View>

              {expandedItem === item.id && (
                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Ionicons name="repeat-outline" size={16} color="#B0BEC5" />
                    <Text style={styles.detailText}>{item.reps} répétitions</Text>
                  </View>
                  {item.rest && (
                    <View style={styles.detailRow}>
                      <Ionicons name="timer-outline" size={16} color="#B0BEC5" />
                      <Text style={styles.detailText}>Repos: {item.rest}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="document-text-outline" size={16} color="#B0BEC5" />
                    <Text style={styles.detailText}>{item.notes}</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity
            style={styles.startButtonContainer}
          >
            <LinearGradient
              colors={['#FF6A88', '#FF8E53']}
              style={styles.startButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="play-circle" size={22} color="#fff" />
              <Text style={styles.startButtonText}>Commencer l'entraînement</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  listContent: {
    padding: 16,
  },
  exerciseItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  expandedItem: {
    marginBottom: 20,
  },
  exerciseGradient: {
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 106, 136, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  setDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6A88',
    marginRight: 4,
  },
  setsText: {
    marginLeft: 8,
    color: '#78909C',
    fontSize: 14,
  },
  detailsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: '#546E7A',
    fontSize: 14,
    marginLeft: 8,
  },
  startButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  startButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 5,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
