"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { fetchArticles } from "../utils/actions";
import { useAuthenticatedFetch } from "../utils/authStore";
import HeaderWithoutCart from "../../components/HeaderWithoutCart"; // Adjust path as needed
import ScreenWrapper from "../../components/ScreenWrapper";

import { useRouter } from "expo-router";
const { width } = Dimensions.get("window");

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const highlightsFlatListRef = useRef(null);
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        const articles = await fetchArticles(authenticatedFetch, 100);
        console.log("articles:", articles);
        setArticles(articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const onHighlightScroll = (event) => {
    const slideSize = width * 0.8 + 15; // card width + margin
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / slideSize);

    // Clamp within range
    const clampedIndex = Math.min(
      Math.max(index, 0),
      highlightedArticles.length - 1
    );

    setCurrentHighlightIndex(clampedIndex);
  };

  const handleBackPress = () => {
    // Handle navigation back - replace with your navigation logic
    console.log("Navigate back from Articles page");
    // Example: navigation.goBack();
    router.back();
  };

  const renderHighlightItem = ({ item }) => (
    <TouchableOpacity
      style={styles.highlightCard}
      onPress={() => router.push(`/articles/${item.id.split("/").pop()}`)}
    >
      <Image
        source={{ uri: item.image?.url || "" }}
        style={styles.highlightImage}
      />
      <View style={styles.highlightContent}>
        <Text style={styles.highlightMeta}>
          {item.readTime} | {formatDate(item.createdAt)}
        </Text>
        <Text style={styles.highlightTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.highlightSummary}>
          {item.cleanText}
        </Text>
        <View style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>READ MORE</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderLatestPostItem = ({ item }) => (
    <View style={styles.latestPostCard}>
      <Image
        source={{ uri: item.image?.url || "" }}
        style={styles.latestPostImage}
      />
      <View style={styles.latestPostContent}>
        <Text style={styles.latestPostMeta}>
          {item.readTime} | {formatDate(item.createdAt)}
        </Text>
        <Text style={styles.latestPostTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={styles.latestPostSummary}>
          {item.cleanText}
        </Text>
        <TouchableOpacity
          onPress={() => router.push(`/articles/${item.id.split("/").pop()}`)}
          style={styles.readMoreButton}
        >
          <Text style={styles.readMoreText}>READ MORE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {highlightedArticles.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            index === currentHighlightIndex
              ? styles.activeDot
              : styles.inactiveDot,
          ]}
          onPress={() => {
            const slideSize = width * 0.8 + 15;
            const offset = index * slideSize;
            highlightsFlatListRef.current?.scrollToOffset({
              offset,
              animated: true,
            });
            setCurrentHighlightIndex(index);
          }}
        />
      ))}
    </View>
  );
  const highlightedArticles = articles.slice(0, 3);
  const latestArticles = articles.slice(1);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <HeaderWithoutCart title="Blogs" onBackPress={handleBackPress} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading articles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ListHeaderComponent = () => (
    <>
      {/* App Title */}
      <View style={styles.appTitleContainer}>
        <Text style={styles.appSubtitle}>
          Period Talk | Menstrual Health, Tips & Real Stories
        </Text>
        <Text style={styles.welcomeText}>
          Welcome to our blog! Your go-to source for period talk, skincare, hair
          & body care, makeup tips, routines, the latest trends and much more!
        </Text>
      </View>

      {/* Highlights Section */}
     <View style={styles.section}>
  <Text style={styles.sectionTitle}>HIGHLIGHTS</Text>
  <FlatList
    data={highlightedArticles}
    renderItem={renderHighlightItem}
    keyExtractor={(item) => String(item.id)}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.highlightsScroll}
    // Removed snapToInterval, snapToAlignment, decelerationRate, pagination
    pagingEnabled={false}
    bounces={true}
    removeClippedSubviews={false}
    nestedScrollEnabled={true}
  />
</View>

      {/* Latest Posts Section Title */}
      <Text style={styles.sectionTitle}>LATEST POSTS</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <HeaderWithoutCart
        title="Blogs"
        onBackPress={handleBackPress}
        showLogo={true}
        showBackButton={true}
      />

      <FlatList
        data={latestArticles}
        renderItem={renderLatestPostItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={ListHeaderComponent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        // Removed getItemLayout as it was causing issues with nested horizontal scroll
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  appTitleContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#ff69b4",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1,
  },
highlightsScroll: {
  paddingLeft: (width - (width * 0.8)) / 2,
  paddingRight: (width - (width * 0.8)) / 2,
},

  highlightCard: {
    width: width * 0.8,
    marginRight: 15,
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    // elevation: 3,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
  highlightImage: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  highlightContent: {
    padding: 16,
  },
  highlightMeta: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 6,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 20,
  },
  highlightSummary: {
    fontSize: 14,
    color: "#666",
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: "italic",
  },
  readMoreButton: {
    backgroundColor: "#2c2a6b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  readMoreText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#ff69b4",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
  latestPostCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "white",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  latestPostImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  latestPostContent: {
    padding: 20,
  },
  latestPostMeta: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  latestPostTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    lineHeight: 26,
  },
  latestPostSummary: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 15,
    fontStyle: "italic",
  },
});

export default Articles;
