import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, RadioButton } from 'react-native-paper';

const ActivityLevel = ({ navigation }: any) => {
  const [activityLevel, setActivityLevel] = useState('sedentaire');

  const handleSaveActivityLevel = () => {
    navigation.replace('CaloriesCalculation');  
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sélectionnez votre niveau d'activité</Text>

      <RadioButton.Group onValueChange={setActivityLevel} value={activityLevel}>
        <View style={styles.radioGroup}>
          <RadioButton.Item label="Sédentaire (peu ou pas d'exercice)" value="sedentaire" />
          <RadioButton.Item label="Activité légère (1-3 jours par semaine)" value="legere" />
          <RadioButton.Item label="Activité modérée (3-5 jours par semaine)" value="moderee" />
          <RadioButton.Item label="Activité intense (6-7 jours par semaine)" value="intense" />
        </View>
      </RadioButton.Group>

      <Button mode="contained" onPress={handleSaveActivityLevel} style={styles.button}>
        Enregistrer
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  radioGroup: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: '100%',
  },
});

export default ActivityLevel;
