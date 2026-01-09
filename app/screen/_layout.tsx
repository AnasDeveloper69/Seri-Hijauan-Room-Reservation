import { Tabs } from "expo-router";

export default function ScreenLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "coral" }}>
      <Tabs.Screen 
        name="dashboard" 
        options={{ 
          headerShown: false,
          title: "Home"
        }} 
      />
      <Tabs.Screen 
        name="calendar" 
        options={{ 
          headerShown: false,
          title: "Calendar"
        }} 
      />
    </Tabs>
  );
}