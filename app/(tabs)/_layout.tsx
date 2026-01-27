import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

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
          href: "/booking",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "document" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          headerShown: false,
          title: "Calendar",
          href: "/calendar",
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
