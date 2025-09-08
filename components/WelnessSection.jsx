"use client";

import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthenticatedFetch } from "@/app/utils/authStore";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.65;
const CARD_SPACING = 16;
import { fetchCollections } from "./../app/utils/actions";

const COLLECTIONS = [
  {
    id: "426340712740",
    title: "The Menstrual Collection",
    itemCount: 0,
    imageUrl: "https://cdn.shopify.com/s/files/1/0669/0773/4308/collections/the-menstrual-collection-125547.png?v=1748522707",
  },
  {
    id: "630364766500",
    title: "IPL Laser Hair Removers",
    itemCount: 0,
    imageUrl: "https://cdn.shopify.com/s/files/1/0669/0773/4308/collections/ipl-hair-removal-collection.jpg?v=1748522744",
  },
  {
    id: "449705443620",
    title: "Skin Serums",
    itemCount: 0,
    imageUrl: "",
  },

  {
    id: "637913465124",
    title: "Skin Care",
    itemCount: 0,
    imageUrl: "",
  },
];

export default function WellnessCollections() {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const [collections, setCollections] = useState(COLLECTIONS);
  const { authenticatedFetch } = useAuthenticatedFetch();

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_SPACING));
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollViewRef.current?.scrollTo({
      x: index * (CARD_WIDTH + CARD_SPACING),
      animated: true,
    });
    setCurrentIndex(index);
  };

  useEffect(() => {
    const fetchAndUpdateCollections = async () => {
      try {
        const ids = COLLECTIONS.map((collection) => collection.id).join(",");
        const collections_ = await fetchCollections(authenticatedFetch, ids);
        console.log("API Collections:", collections_);



        // Update static COLLECTIONS with latest API data
        const updatedCollections = COLLECTIONS.map((collection) => {
          const apiData = collections_.find(
            (item) => item.id.replace("gid://shopify/Collection/", "") === collection.id
          );
          console.log("API Data:", apiData);
          return apiData
            ? {
                ...collection,
                title: apiData.title,
                handle: apiData.handle,
                itemCount: apiData.activeProductsItemsCount,
                description: apiData.description,
                imageUrl: apiData.image.url || collection.imageUrl, // fallback to old
              }
            : collection;
        });

        console.log("Updated Collections:", updatedCollections);

        setCollections(updatedCollections);
      } catch (error) {
        console.error("Failed to fetch or update collections:", error);
      }
    };

    fetchAndUpdateCollections();
  }, []);
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.subtitle}>Care, Evolverd For Her</Text>
        <Text style={styles.title}>
          MomDaughts'{"\n"}Innovative Wellness{"\n"}Collections
        </Text>
      </View>

      {/* Horizontal Slider */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        snapToAlignment="start"
        contentInset={{ left: CARD_SPACING, right: CARD_SPACING }}
        contentContainerStyle={styles.scrollContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {collections.map((collection, index) => (
          <TouchableOpacity
            onPress={() => router.push(`/screens/collections/${collection.id}?imageUrl=${collection.imageUrl}&title=${collection.title}&description=${collection.description}`)}
            key={collection.id}
            style={styles.card}
            activeOpacity={0.5}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: collection.imageUrl }}
                style={styles.backgroundImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.textSection}>
              <View style={styles.textContent}>
                <Text style={styles.cardTitle}>{collection.title}</Text>
                <Text style={styles.itemCount}>
                  {collection.itemCount} items
                </Text>
              </View>
              <TouchableOpacity style={styles.arrowButton}>
                {/* <Text style={styles.arrowText}>→</Text> */}
                <Ionicons
                  name="arrow-forward-outline"
                  size={16}
                  color={"#1f2937"}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {collections.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              currentIndex === index ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fbedf3",
    paddingVertical: 32,
    marginBottom: 52,
    marginTop: 8,
    borderRadius: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    lineHeight: 32,
  },
  scrollContainer: {
    paddingHorizontal: CARD_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    height: 260, // Increased height for better proportions
    marginRight: CARD_SPACING,
    borderRadius: 20,
    backgroundColor: "#ffffff",

    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  textSection: {
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 18,
  },
  itemCount: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ec4899",
  },
  inactiveDot: {
    backgroundColor: "#d1d5db",
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e9e9e9",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
});
