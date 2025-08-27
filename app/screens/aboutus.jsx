import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useRouter } from 'expo-router';
// Alternative imports if not using Expo Router:
// import { useNavigation } from '@react-navigation/native';
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function AboutUsPage() {
  const router = useRouter();
  // Alternative for React Navigation:
  // const navigation = useNavigation();

  const handleBackPress = () => {
    // For Expo Router:
    router.back();
    
    // Alternative for React Navigation:
    // navigation.goBack();
    
    // Alternative for simple navigation:
    // navigation.navigate('Home'); // specify your previous screen
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header Image */}
      <Image
        source={{
          uri: "https://momdaughts.com/cdn/shop/files/banner_3_mob.jpg?v=1748096411&width=800",
        }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      {/* Back Button - Positioned over the image */}
      <SafeAreaView style={styles.backButtonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={14} color={"000000"} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Absolutely Positioned Scrollable Card */}
      <View style={styles.cardContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>A Legacy of Care, Reimagined</Text>

          <Text style={styles.bodyText}>
            It all started with a conversation—a mother and daughter sharing
            stories, struggles, and silent questions that generations of women
            have carried quietly. We spoke about periods, about pain no one
            talks about, about the awkwardness, the mess, the lack of choices.
            And in those heart-to-hearts, we realized something powerful: the
            world has long overlooked the real needs of women.
          </Text>

          <Text style={styles.sectionTitle}>Our Promise</Text>
          <View style={styles.bulletContainer}>
            <Text style={styles.bulletText}>
              • We'll always speak your language.
            </Text>
            <Text style={styles.bulletText}>
              • We'll never sell you something we wouldn't use ourselves.
            </Text>
            <Text style={styles.bulletText}>
              • And we'll keep showing up—for you, your daughters, and the
              generations to come.
            </Text>
          </View>

          <View style={styles.bannerContainers}>
            <Image
              source={{
                uri: "https://i.ibb.co/XrPS5RnP/please.jpg",
              }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.bodyText}>
            <Text style={styles.brandName}>MomDaughts</Text> was born from that
            realization—a brand inspired by real moments between mothers and
            daughters, created to support women through every phase of life,
            with empathy, honesty, and care at the core.
          </Text>

          <Text style={styles.bodyText}>
            We launched our first product, the{" "}
            <Text style={styles.brandName}>MomDaughts Menstrual Cup</Text>, to
            offer women a safer, more sustainable alternative—something we
            wished we had ourselves. But we didn't stop there. As our community
            grew, so did we—listening, learning, and developing more products
            designed to bring comfort, confidence, and care into the daily lives
            of women everywhere.
          </Text>

          <Text style={[styles.bodyText]}>
            Because <Text style={styles.brandName}>MomDaughts</Text> is more
            than a brand—it's a bond. A reminder that women don't have to go
            through anything alone. That behind every strong woman is a village
            of support, wisdom, and love.
          </Text>

          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.bodyText}>
            To empower women with thoughtful, sustainable, and effective care
            solutions—rooted in real stories and built for real lives.
          </Text>

          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.bodyText}>
            A world where feminine health and self-care are treated with the
            dignity, innovation, and understanding they truly deserve.
          </Text>

          {/* Additional bottom padding to account for navigation space */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* Navigation Space Container */}
      <View style={styles.navigationSpaceContainer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  headerImage: {
    width: width,
    height: height * 0.4,
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  // Back Button Styles
  backButtonContainer: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginLeft: -2, // Slight adjustment for visual centering
  },
  cardContainer: {
    position: "absolute",
    top: height * 0.3,
    left: 0,
    right: 0,
    bottom: 80, // Reduced bottom to make space for navigation container
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 36,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4a4a4a",
    marginBottom: 20,
    textAlign: "left",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 32,
    marginBottom: 5,
    lineHeight: 32,
  },
  bulletContainer: {
    marginBottom: 24,
  },
  bulletText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4a4a4a",
    marginBottom: 12,
    textAlign: "left",
  },
  brandName: {
    fontWeight: "600",
    color: "#1a1a1a",
  },
  bannerContainers: {
    height: 200,
    backgroundColor: "#f5f5f5",
    marginVertical: 32,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#e0e0e0",
    borderRadius: 16,
  },
  bannerText: {
    fontSize: 16,
    color: "#888888",
    fontStyle: "italic",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Dark overlay for text readability
  },
  bannerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    textAlign: "center",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  // Navigation Space Container
  navigationSpaceContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80, // Adjust height as needed for your navigation buttons
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
  },
  // Additional bottom spacing for scroll content
  bottomSpacing: {
    height: 40, // Extra space at the bottom of scroll content
  },
});