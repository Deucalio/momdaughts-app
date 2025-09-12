import { Ionicons } from "@expo/vector-icons";
import {
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "../components/Text";
const HeaderWithoutCart = ({
  title = "Page Title",
  showBackButton = true,
  showLogo = true,
  logoUri = "https://i.ibb.co/391FfHYS/Layer-1.png",
  onBackPress,
  backgroundColor = "#fff",
  textColor = "#333",
  iconColor = "#333",
  rightComponent = null,
  centerComponent = null,
}) => {
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      console.log("Back button pressed");
    }
  };

  return (
    <>
      <StatusBar
        barStyle={backgroundColor === "#fff" ? "dark-content" : "light-content"}
        backgroundColor={backgroundColor}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: "#e0e0e0",
          backgroundColor: backgroundColor,
        }}
      >
        {/* Left Section - Back Button and Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
          }}
        >
          {showBackButton && (
            <TouchableOpacity
              style={{
                marginRight: 12,
                padding: 4,
              }}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color={iconColor} />
            </TouchableOpacity>
          )}
          
          {centerComponent ? (
            <View style={{ flex: 1 }}>
              {centerComponent}
            </View>
          ) : (
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Outfit-SemiBold",
                color: textColor,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </View>

        {/* Right Section - Logo */}
        <View
          style={{
            alignItems: "flex-end",
          }}
        >
         
        </View>
      </View>
    </>
  );
};

export default HeaderWithoutCart;