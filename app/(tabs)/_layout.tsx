import {  Tabs,useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "react-native";
import { Account } from "react-native-appwrite";
import { client } from "../../appwrite";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "coral",
        tabBarInactiveTintColor: "#9CA3AF",
  
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          headerShown: false,
          title: "Booking",
          href:"/booking",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

    </Tabs>
  );
}