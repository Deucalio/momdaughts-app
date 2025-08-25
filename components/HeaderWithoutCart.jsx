import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
      // Default back behavior - you might want to use navigation here
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
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: backgroundColor,
          },
        ]}
      >
        {/* Left Section - Back Button */}
        {showBackButton && (
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
        )}

        {/* Page Title - Right after back button */}
        {/* <Text style={[styles.pageTitle, { color: textColor }]}>
          {title}
        </Text> */}

        {/* Center Section - Logo and Brand Name or Custom Component */}
        <View style={styles.centerContainer}>
          {centerComponent
            ? centerComponent
            : showLogo && (
                <View style={styles.logoContainer}>
                  <View style={styles.logoPlaceholder}>
                    <Image
                      source={{ uri: logoUri }}
                      style={styles.logo}
                      resizeMode="cover"
                    />
                  </View>
                  {/* <Text style={[styles.brandName, { color: textColor }]}>
                  MomDaughts
                </Text> */}
                  <Text style={styles.logoTitle}>
                    <Text
                      style={{
                        color: "#2c2a6b",
                      }}
                    >
                      Mom
                    </Text>
                    Daughts
                  </Text>
                </View>
              )}
        </View>

        {/* Right Section - Custom Component or Spacer */}
        <View style={styles.rightSection}>
          {rightComponent || <View style={styles.headerSpacer} />}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    marginRight: 16,
    padding: 4, // Add some padding for better touch target
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholder: {
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoTitle: {
    letterSpacing: 0.5,
    fontSize: 23,
    color: "#f596bb",
    fontFamily: "BadlocICG-Regular",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  rightSection: {
    minWidth: 40,
    alignItems: "flex-end",
  },
  headerSpacer: {
    width: 40,
  },
});

export default HeaderWithoutCart;
