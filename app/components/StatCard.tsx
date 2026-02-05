import React from "react";
import { View, Text, StyleSheet} from "react-native";

interface StatCardProps {
    number: number;
    label:string;
    icon:string;
    type: 'blue' | 'orange' | 'green';
}

const StatCard = ({ number, label, icon, type }: StatCardProps) => {
  const bgStyle = 
    type === 'blue' ? styles.statCardBlue : 
    type === 'orange' ? styles.statCardOrange : 
    styles.statCardGreen;

  return (
    <View style={[styles.statCard, bgStyle]}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={styles.statIcon}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statCard: { flex: 1, borderRadius: 16, padding: 16, position: 'relative' },
  statCardBlue: { backgroundColor: '#3B82F6' },
  statCardOrange: { backgroundColor: '#F59E0B' },
  statCardGreen: { backgroundColor: '#10B981' },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' },
  statLabel: { fontSize: 12, color: '#FFFFFF' },
  statIcon: { position: 'absolute', right: 12, top: 12, opacity: 0.3 },
  statIconText: { fontSize: 32 },
});

export default StatCard;