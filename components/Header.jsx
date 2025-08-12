import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { logOut, useAuthenticatedFetch } from "../app/utils/authStore";


const Header = ({ cartItemCount }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const insets = useSafeAreaInsets();

  // const getCartItems = async () => {
  //     try {
  //       const res = await authenticatedFetch(`${BACKEND_URL}/cart-items-count`);
  //       if (res.ok) {
  //         const data = await res.json();
  //         console.log("Cart Items Count:", data.count);
  //         setCartItemCount(data.count);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   }

  //   useEffect(() => {
  //     console.log("Calling getCartItems");
  //     getCartItems();
  //   }, []);

  const handleCartPress = () => {
    console.log("Navigate to Cart");
    router.push("/cart");
  };

  const handleProfileMenuToggle = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleWishlistPress = () => {
    console.log("Navigate to Wishlist");
    setShowProfileMenu(false);
  };

  const handleProfileSettingsPress = () => {
    console.log("Navigate to Profile Settings");
    setShowProfileMenu(false);
  };

  const handleLogoutPress = () => {
    setShowProfileMenu(false);
    logOut();
  };

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={{
                uri: "https://i.ibb.co/391FfHYS/Layer-1.png",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text
              onPress={() => {
                logOut();
              }}
              style={styles.logoTitle}
            >
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
          <View style={styles.headerActions}>
            {/* Cart Icon */}
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCartPress}
            >
              <Ionicons name="bag-outline" size={24} color="#ec4899" />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.badgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Profile Icon with Dropdown */}
            <View style={styles.profileContainer}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleProfileMenuToggle}
              >
                <Ionicons name="person-circle" size={26} color="#ec4899" />
              </TouchableOpacity>
              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <View style={styles.profileDropdown}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleWishlistPress}
                  >
                    <Ionicons name="heart-outline" size={18} color="#666" />
                    <Text style={styles.dropdownText}>Wishlist</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleProfileSettingsPress}
                  >
                    <Ionicons name="settings-outline" size={18} color="#666" />
                    <Text style={styles.dropdownText}>Profile Settings</Text>
                  </TouchableOpacity>
                  <View style={styles.dropdownDivider} />
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleLogoutPress}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={18}
                      color="#ec4899"
                    />
                    <Text style={[styles.dropdownText, { color: "#ec4899" }]}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Overlay to close dropdown when clicking outside */}
      {showProfileMenu && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowProfileMenu(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderBottomWidth: 1,
    borderBottomColor: "#fce7f3",
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50, // Fixed height for consistency
  },
  logoContainer: {
    gap: 4,
    flexDirection: "row",
    width: 90,
    alignItems: "center",
  },
  logo: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  logoTitle: {
    fontSize: 24,
    color: "#f596bb",
    fontFamily: "BadlocICG-Regular",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerButton: {
    position: "relative",
    padding: 6,
  },
  cartBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ec4899",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  profileContainer: {
    position: "relative",
  },
  profileDropdown: {
    position: "absolute",
    top: 35,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 6,
    minWidth: 170,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 2,
    marginHorizontal: 12,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default Header;
