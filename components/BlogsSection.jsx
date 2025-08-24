import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  lightPink: "#f5b8d0",
  
  lavender: "#e2c6df",
  mediumPink: "#eb9fc1",
  darkBlue: "#2b2b6b",
  deepBlue: "#2c2a6b",
  almostBlack: "#040707",
  white: "#ffffff",
  lightGray: "#f8f9fa",
  mediumGray: "#6c757d",
  border: "#e9ecef",
  success: "#28a745",
  danger: "#dc3545",
  cream: "#faf9f7",
  softGold: "#f4f1ea",
};

const BlogCard = ({ blog, onPress }) => {
  // Create gradient colors based on blog category or ID
  const gradientColors =
    blog.id === 1
      ? ["#FFA500", "#32CD32"] // Orange to Green for first card
      : ["#FFB6C1", "#FFB6C1"]; // Pink for second card

  return (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => onPress(blog)}
      activeOpacity={0.8}
    >
      {/* Colorful header image with gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.blogImageContainer}
      >
        <Image
          source={{ uri: blog.image }}
          style={styles.blogImage}
          resizeMode="cover"
        />
      </LinearGradient>

      {/* Content section */}
      <View style={styles.blogContent}>
        <View style={styles.blogDateContainer}>
          <Text style={styles.blogDate}>
            {new Date(blog.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
          <Text style={styles.blogReadTime}>{blog.readTime}</Text>
        </View>
        <Text style={styles.blogTitle} numberOfLines={2}>
          {blog.title}
        </Text>
        <Text style={styles.blogExcerpt} numberOfLines={2}>
          {blog.excerpt}
        </Text>
        <TouchableOpacity style={styles.learnMoreButton}>
          <Text style={styles.learnMoreText}>Learn More</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const BlogsSection = ({ blogs, blogsLoading, onBlogPress }) => {
  return (
    <View style={styles.blogSection}>
      <View style={styles.blogHeader}>
        <View style={styles.blogTitleContainer}>
          <View style={styles.blogBadge}>
            <Text style={styles.blogBadgeText}>📖 BLOGS</Text>
          </View>
          <Text style={styles.blogTitle}>Mom's Journal</Text>
          <Text style={styles.blogSubtitle}>
            Expert tips and stories from real mothers
          </Text>
        </View>
        <TouchableOpacity style={styles.blogViewAll}>
          <Text style={styles.blogViewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {blogsLoading ? (
        <View style={styles.blogLoadingContainer}>
          <ActivityIndicator size="large" color={COLORS.mediumPink} />
          <Text style={styles.blogLoadingText}>Loading articles...</Text>
        </View>
      ) : blogs.length === 0 ? (
        <View style={styles.blogEmptyContainer}>
          <Text style={styles.blogEmptyText}>No articles available</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.blogScrollContainer}
          style={styles.blogScrollView}
        >
          {blogs.slice(0, 3).map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onPress={onBlogPress}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Enhanced Blog Section Styles
  blogSection: {
    marginBottom: 50,
  },
  blogHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 40,
    paddingHorizontal: 4,
  },
  blogTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  blogBadge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.softGold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  blogBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.darkBlue,
    letterSpacing: 0.8,
  },
  blogTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.almostBlack,
    lineHeight: 32,
    marginBottom: 8,
  },
  blogSubtitle: {
    fontSize: 15,
    color: COLORS.mediumGray,
    lineHeight: 20,
    fontWeight: "400",
  },
  blogViewAll: {
    backgroundColor: COLORS.deepBlue,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: COLORS.deepBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  blogViewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.white,
  },
  blogScrollView: {
    width: "100%",
  },
  blogScrollContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
    marginLeft: -10,
  },
  blogCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: 280,
    marginRight: 18,
    overflow: "hidden",
  },
  blogImageContainer: {
    height: 160,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  blogImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  blogContent: {
    padding: 16,
  },
  blogDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  blogDate: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  blogReadTime: {
    fontSize: 12,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.almostBlack,
    lineHeight: 20,
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 13,
    color: COLORS.mediumGray,
    lineHeight: 18,
    marginBottom: 12,
  },
  learnMoreButton: {
    alignSelf: "flex-start",
  },
  learnMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.darkBlue,
    // textDecorationLine: "underline",
    display: "none"
  },
  blogLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  blogLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
  blogEmptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  blogEmptyText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    fontWeight: "500",
  },
});

export default BlogsSection;