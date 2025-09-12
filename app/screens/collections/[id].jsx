import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import NavigationSpaceContainer from "../../../components/NavigationSpaceContainer";
import Text from "../../../components/Text";
import { fetchCollection } from "../../utils/actions";
import { useAuthenticatedFetch } from "../../utils/authStore";
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const COLLECTIONS = [
  {
    id: "426340712740",
    title: "The Menstrual Collection",
    imageUrl:
      "https://momdaughts.com/cdn/shop/collections/the-menstrual-collection-125547.png?v=1748522707&width=710",
    description: `Made to care for you — the MomDaughts' Menstrual Collection brings comfort, ease, and confidence to your period.`,
  },
  {
    id: "630364766500",
    title: "IPL Laser Hair Removers",
    imageUrl:
      "https://momdaughts.com/cdn/shop/collections/ipl-hair-removal-collection.jpg?v=1748522744&width=710",
    description: `Explore our IPL hair removers and devices — your perfect match for effortless hair removal and everyday confidence.`,
  },
  {
    id: "449705443620",
    title: "Skin Serums",
    imageUrl:
      "https://momdaughts.com/cdn/shop/collections/momdaughts-skin-care-collection-683704.png?v=1748526758&width=710",
    description:
      "Achieve your skincare goals in Pakistan! Our targeted Skin Serums address concerns like hydration & brightening. Shop 6 powerful formulas to transform your routine.",
  },
  {
    id: "637913465124",

    title: "Skin Care",
    imageUrl:
      "https://momdaughts.com/cdn/shop/collections/skin_care_collection_image.jpg?v=1749815037&width=710",
    description:
      "The MomDaughts Skin Care Collection is your go-to for all things skincare. Our products are designed to nourish, hydrate, and rejuvenate your skin, leaving you feeling refreshed and revitalized.",
  },
];

const FullPageSkeleton = () => (
  <SafeAreaView style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="#4a5d4a" />

    {/* Banner skeleton */}
    <View style={[styles.bannerContainer, styles.skeletonImage]} />

    {/* Content Section */}
    <View style={styles.content}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title skeleton */}
        <View style={styles.titleSection}>
          <View style={[styles.skeletonText, { width: "60%", height: 28 }]} />
        </View>

        {/* Description skeleton */}
        <View
          style={{
            paddingHorizontal: 20,
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <View
            style={[
              styles.skeletonText,
              { width: "90%", height: 16, marginBottom: 8 },
            ]}
          />
          <View style={[styles.skeletonText, { width: "70%", height: 16 }]} />
        </View>

        {/* Product Grid skeleton */}
        <View style={styles.productGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductSkeleton key={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
);

// Loading skeleton component
const ProductSkeleton = () => (
  <View style={styles.productCard}>
    <View style={[styles.productImageContainer, styles.skeletonImage]} />
    <View
      style={[
        styles.skeletonText,
        { width: "80%", height: 16, marginBottom: 4 },
      ]}
    />
    <View style={[styles.skeletonText, { width: "50%", height: 16 }]} />
  </View>
);

const CollectionScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useLocalSearchParams();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const params = useLocalSearchParams();
    const imageUrl = params.imageUrl;
  const title = params.title;
  const description = params.description;
  const [collection, setCollection] = useState(null);
  


  

  // const collection = collections.find((collection) => collection.id === id)

  // Simulate API call
  const loadProducts = async (collectionId) => {
    try {
      setLoading(true);
      const response = await fetchCollection(authenticatedFetch, collectionId);
      const updatedCollection = response[0].collection;
      updatedCollection.description = updatedCollection.description ? updatedCollection.description : COLLECTIONS.find((collection) => collection.id === collectionId).description

      setCollection(updatedCollection);
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsOnly = async (collectionId) => {
    try {
      setLoading(true);
      const response = await fetchCollection(authenticatedFetch, collectionId);
      setProducts(response);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      setCollection({
        imageUrl: imageUrl,
        title: title,
        description: description ? description : COLLECTIONS.find((collection) => collection.id === id).description
      })
      loadProductsOnly(id);
      return;
    }
    if (id) {
      loadProducts(id);
    }
  }, [id]);

  if ( !collection) {
    return <FullPageSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4a5d4a" />

      {/* Full Screen Banner Image with Header Overlay */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: collection.imageUrl }}
          style={styles.bannerImage}
          contentFit="cover"
        />
        {/* Header overlay */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Title and Description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{collection.title}</Text>
            <Text style={styles.itemCount}>{loading ? "" : ""}</Text>
          </View>

          <Text style={styles.description}>{collection.description}</Text>

          {/* Product Grid */}
          <View style={styles.productGrid}>
            {loading
              ? // Show skeleton loading
                Array.from({ length: 4 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))
              : // Show actual products
                products.map((product) => (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                      router.push(`/products/${product.id.split("/").pop()}`);
                    }}
                    key={product.id}
                    style={[
                      styles.productCard,
                      {
                        marginBottom: screenHeight * 0.09,
                      },
                    ]}
                  >
                    <View style={styles.productImageContainer}>
                      <Image
                        source={{ uri: product.images[0]?.originalSrc }}
                        style={styles.productImage}
                      />
                    </View>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.title}
                    </Text>
                    <Text style={styles.productPrice}>
                      PKR{" "}
                      {parseFloat(
                        product.variants?.price || 0
                      ).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
          </View>
        </ScrollView>
      </View>
      <NavigationSpaceContainer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4a5d4a",
  },
  bannerContainer: {
    width: screenWidth,
    height: screenHeight * 0.35, // 35% of screen height, adjust as needed
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 35,
    zIndex: 1,
  },
  backButton: {
    padding: 6,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent background for better visibility
    borderRadius: 20,
  },
  content: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    marginTop: -24, // Overlap with banner to create seamless transition
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Outfit-SemiBold",
    color: "#2c2c2c",
    flex: 1,
    textAlign: "center",
  },
  itemCount: {
    fontSize: 16,
    color: "#888",
    fontFamily: "Outfit-Medium",
    position: "absolute",
    right: 20,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    paddingHorizontal: 20,
    textAlign: "center",
    marginBottom: 32,
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 16,
  },
  productCard: {
    width: "47%",
  },
  productImageContainer: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#f8f8f8",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productName: {
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: "#2c2c2c",
    marginBottom: 4,
    lineHeight: 20,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    color: "#2c2c2c",
  },
  // Loading skeleton styles
  skeletonImage: {
    backgroundColor: "#e0e0e0",
  },
  skeletonText: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "white",
    fontFamily: "Outfit-Medium",
  },
});

export default CollectionScreen;
