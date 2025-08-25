// ________
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { logOut, useAuthenticatedFetch } from "../app/utils/authStore";

const BACKEND_URL = "http://192.168.100.3:3000";

const Header = ({cartItemCount_}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const [cartItemCount, setCartItemCount] = useState(0);

  const getCartItems = async () => {

    try{
      const res = await authenticatedFetch(`${BACKEND_URL}/cart-items-count`);
      if(res.ok){
        const data = await res.json();
        setCartItemCount(data.count);
      }

    }catch(e){
      console.log(e);
    }
  }

  useEffect(() => {
    console.log("Calling getCartItems");
    getCartItems();
  }, [cartItemCount_]);

  const handleCartPress = () => {
    console.log("Navigate to Cart");
    router.push("/cart");
    // Add your cart navigation logic here
  };

  const handleProfileMenuToggle = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleWishlistPress = () => {
    console.log("Navigate to Wishlist");
    setShowProfileMenu(false);
    // Add your wishlist navigation logic here
  };

  const handleProfileSettingsPress = () => {
    console.log("Navigate to Profile Settings");
    setShowProfileMenu(false);
    // Add your profile settings navigation logic here
  };

  const handleLogoutPress = () => {
    setShowProfileMenu(false);
    logOut();
  };

  return (
    <View style={styles.header}>
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
            <Text style={{
              color: "#2c2a6b"
            }}>
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
            <Ionicons name="bag-outline" size={26} color="#ec4899" />
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
              <Ionicons name="person-circle" size={28} color="#ec4899" />
            </TouchableOpacity>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <View style={styles.profileDropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleWishlistPress}
                >
                  <Ionicons name="heart-outline" size={20} color="#666" />
                  <Text style={styles.dropdownText}>Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleProfileSettingsPress}
                >
                  <Ionicons name="settings-outline" size={20} color="#666" />
                  <Text style={styles.dropdownText}>Profile Settings</Text>
                </TouchableOpacity>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLogoutPress}
                >
                  <Ionicons name="log-out-outline" size={20} color="#ec4899" />
                  <Text style={[styles.dropdownText, { color: "#ec4899" }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#fce7f3",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    gap: 4,
    flexDirection: "row",
    width:90,
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoTitle: {

    fontSize: 28,
    color: "#f596bb",
    fontFamily: "BadlocICG-Regular",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    position: "relative",
    padding: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ec4899",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  profileContainer: {
    position: "relative",
  },
  profileDropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 180,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 4,
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
  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ec4899",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Header;
