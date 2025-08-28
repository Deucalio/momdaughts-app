import { View } from "react-native";
export default function NavigationSpaceContainer() {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 50, // Adjust height as needed for your navigation buttons
        backgroundColor: "#ffffff",
        zIndex: 3,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
      }}
    ></View>
  );
}
