"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { fetchArticle } from "../utils/actions";
import { useAuthenticatedFetch } from "../utils/authStore";
const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
import RenderHtml from "react-native-render-html";
import HeaderWithoutCart from "../../components/HeaderWithoutCart";

export default function ArticlePage() {
  const { id } = useLocalSearchParams();
  const { authenticatedFetch } = useAuthenticatedFetch();
  const router = useRouter();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("Essentials");
  const { width } = useWindowDimensions();

  const handleLinkPress = (event, href) => {
    Linking.openURL(href).catch((err) => {
      Alert.alert("Error", "Failed to open link");
      console.error("Failed to open URL:", err);
    });
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString).toISOString().split("T")[0];
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Custom styles for HTML elements
  const tagsStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: "#333",
      fontFamily: "System", // Use system font
    },
    p: {
      marginBottom: 16,
      textAlign: "left",
    },
    h1: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
      marginTop: 24,
      color: "#1a1a1a",
    },
    h2: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 12,
      marginTop: 20,
      color: "#2a2a2a",
    },
    h3: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
      marginTop: 16,
      color: "#3a3a3a",
    },
    a: {
      color: "#df367c", // Pink color to match your theme
      textDecorationLine: "underline",
    },
    strong: {
      fontWeight: "bold",
    },
    ol: {
      marginBottom: 16,
      paddingLeft: 20,
    },
    ul: {
      marginBottom: 16,
      paddingLeft: 20,
    },
    li: {
      marginBottom: 8,
      lineHeight: 22,
    },
  };

  useEffect(() => {
    const loadArticle = async () => {
      if (id) {
        const articleData = await fetchArticle(
          authenticatedFetch,
          `gid://shopify/Article/${id}`
        );
        setArticle(articleData.article);
        setLoading(false);
      }
    };
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2c2a6b" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2c2a6b" />
        </View>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2c2a6b" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Article not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2c2a6b" />

      {/* Full Header - above the image */}
      {/* <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#f8f9fa" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View> */}
          <HeaderWithoutCart 
        title="Blogs" 
        onBackPress={() => router.back()}
        showLogo={true}
        showBackButton={true}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: article.image.url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Date and Read Time */}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.date}>{formatDate(article.createdAt)}</Text>
            <Text style={styles.readTime}>{article.readTime}</Text>
          </View>

          {/* Article Title */}
          <Text style={styles.title}>{article.title}</Text>

          {/* Article Summary */}
          <Text style={styles.summary}>{article.summary}</Text>

          {/* Article Content */}
          <View style={styles.articleContent}>
            <RenderHtml
              contentWidth={screenWidth - 32} // Account for padding
              source={{ html: article.body }}
              tagsStyles={tagsStyles}
              renderersProps={{
                a: {
                  onPress: handleLinkPress,
                },
              }}
              defaultTextProps={{
                selectable: true, // Allow text selection
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c2a6b",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
  },
  transparentHeader: {
    position: "absolute",
    top: StatusBar.currentHeight || 44, // Adjust for status bar height
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#2c2a6b",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    // backgroundColor: "rgba(248, 249, 250, 0.15)", // Light semi-transparent background
    transform: "translateY(8px)",
    alignSelf: "flex-start",
  },
  backText: {
    color: "#f8f9fa", // Light gray color for better contrast
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  fansText: {
    color: "white",
    fontSize: 16,
    marginLeft: 5,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    backgroundColor: "#2c2a6b",
    justifyContent: "center",
    alignItems: "center",
  },
  heroImage: {
    width: "100%",
    minHeight: 230,
    maxHeight: screenHeight * 0.5, // Adjust this value as needed
    resizeMode: "contain", // Shows full image
  },
  contentContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    paddingTop: 30,
    paddingHorizontal: 20,
    minHeight: 500,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600", // Semi-bold
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  activeTab: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    letterSpacing: 0.5,
  },
  activeTabText: {
    color: "#333",
  },
  tabSeparator: {
    color: "#ccc",
    marginHorizontal: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 34,
    marginBottom: 15,
  },
  summary: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 20,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  authorText: {
    fontSize: 14,
    color: "#666",
    marginRight: 15,
  },
  followButton: {
    backgroundColor: "#00BCD4",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  followButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  starButton: {
    padding: 5,
  },
  readTime: {
    fontSize: 14,
    color: "#999",
    textAlign: "right",
  },
  articleContent: {
    paddingBottom: 50,
  },
  contentText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 26,
  },
});
