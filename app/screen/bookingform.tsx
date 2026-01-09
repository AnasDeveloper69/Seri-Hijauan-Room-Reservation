import { View , Text, StyleSheet} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function BookingForm(){
    return(
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>This is booking form .</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  }
});