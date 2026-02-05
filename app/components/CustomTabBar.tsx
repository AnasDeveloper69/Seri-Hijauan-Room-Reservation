import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Skip the middle tab (FAB)
          if (route.name === "add") {
            return <View key={route.key} style={styles.fabSpacer} />;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Get icon name based on route
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";
          if (route.name === "home") {
            iconName = isFocused ? "home" : "home-outline";
          } else if (route.name === "booking") {
            iconName = isFocused ? "document" : "document-outline";
          } else if (route.name === "calendar") {
            iconName = isFocused ? "calendar" : "calendar-outline";
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? "#3B82F6" : "#9CA3AF"}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Action Button */}
      {/* <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("add")}
      >
        <Ionicons name="close" size={32} color="#FFFFFF" />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  fabSpacer: {
    width: 60,
  },
  fab: {
    position: "absolute",
    top: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
