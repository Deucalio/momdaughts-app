import { Image } from 'expo-image';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "../components/Text";
const { width } = Dimensions.get("window");

const AboutSection = ({onExploreStory}) => {
  const handleExploreStory = () => {
    // Add your navigation logic here
    console.log("Explore Our Story pressed");
    onExploreStory();
  };

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.heroContainer}>
        <Image
          source={{
            uri: "https://momdaughts.com/cdn/shop/files/talk-about-brand.jpg?v=1748530994&width=900",
          }}
          style={styles.heroImage}
          resizeMode="cover"
        />
    
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <Text style={styles.subtitle}>Born From A Bond,</Text>

        <Text style={styles.title}>Built for Every Woman</Text>

        <Text style={styles.description}>
          We believe every woman deserves access to exceptional, affordable care
          that truly understands her. From our thoughtfully designed menstrual
          cups to nourishing skin serums, every MomDaughts product is created
          with your comfort, confidence, and well-being in mind.
        </Text>

        <TouchableOpacity
          onPress={handleExploreStory}
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Explore Our Story</Text>
          <View style={styles.underline} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  heroContainer: {
    position: "relative",
    width: Math.min(width - 32, 400),
    height: 384,
    marginBottom: 32,
    marginHorizontal: 16,
    alignSelf: "center",
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  overlay: {
    position: "absolute",
    bottom: 20,
    left: 32,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  overlayText: {
    fontSize: 18,
    fontFamily: "Outfit-Medium",
    color: "#374151",
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#6B7280",
    marginBottom: 8,
  },
  title: {
    fontSize: width > 768 ? 48 : 36,
    fontFamily: "Outfit-Bold",
    color: "#000000",
    lineHeight: width > 768 ? 56 : 42,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 32,
  },
  button: {
    alignItems: "flex-start",
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#000000",
    marginBottom: 4,
  },
  underline: {
    height: 2,
    backgroundColor: "#000000",
    width: "100%",
    maxWidth: 140,
  },
});

export default AboutSection;
