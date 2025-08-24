import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const FeaturedProduct = () => {
  return (
    <View style={styles.container}>
      {/* Confidence Header */}
      <Text style={styles.confidenceText}>Confidence Starts Here</Text>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: "https://momdaughts.com/cdn/shop/files/momdaughts-long-tailed-menstrual-cup-441105_99e0bf2e-5e22-402b-b8ca-610a57d9d035.jpg?v=1751642433&width=1070",
          }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>

      {/* Product Info Card */}
      <View style={styles.productCard}>
        <Text style={styles.brandName}>MomDaughts</Text>

        <Text style={styles.productTitle}>
          MomDaughts'{"\n"}Long Tailed{"\n"}Menstrual Cup
        </Text>

        <Text style={styles.price}>From Rs.1,099.00</Text>

        <Text style={styles.description}>
          Say goodbye to disposable pads and tampons with the{" "}
          <Text style={styles.boldText}>MomDaughts' Long...</Text>
        </Text>

        <TouchableOpacity style={styles.buyButton} activeOpacity={0.8}>
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  confidenceText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
  },
  productImage: {
    width: width * 0.8,
    height: 250,
  },
  productCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
  },
  brandName: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 8,
    fontWeight: "500",
  },
  productTitle: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000000",
    lineHeight: 34,
    marginBottom: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#666666",
    lineHeight: 24,
    marginBottom: 24,
  },
  boldText: {
    fontWeight: "700",
    color: "#000000",
  },
  buyButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 25,
    alignItems: "center",
    shadowColor: "#2c2a6b",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

export default FeaturedProduct;
