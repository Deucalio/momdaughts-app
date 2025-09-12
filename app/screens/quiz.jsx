"use client";

import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,

  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Text from "../../components/Text";
const { width, height } = Dimensions.get("window");

// Your custom color theme
const colors = {
  primary: "#f5b8d0", // Light pink
  secondary: "#e2c6df", // Light purple-pink
  accent: "#eb9fc1", // Medium pink
  dark: "#2b2b6b", // Dark blue
  black: "#040707", // Near black
  white: "#ffffff", // White
};

const questions = [
  {
    id: 1,
    question: "What is your Age Group?",
    options: ["Under 18", "18-24", "25-34", "35+"],
  },
  {
    id: 2,
    question: "What is your Marital Status?",
    options: ["Unmarried", "Married"],
  },
  {
    id: 3,
    question: "Have you ever given Birth?",
    options: [
      "No, I haven't",
      "Yes, via C-Section",
      "Yes, via vaginal delivery",
    ],
  },
];

// const getRecommendation = (answers) => {
//   const [ageGroup, maritalStatus, birthStatus] = answers;

//   // Age-based sizing
//   if (ageGroup === "Under 18") return "small";
//   if (ageGroup === "18-24") return "medium";
//   if (ageGroup === "25-34") {
//     if (birthStatus.includes("Yes")) return "large";
//     return "medium";
//   }
//   if (ageGroup === "35+") {
//     if (birthStatus.includes("Yes")) return "xlarge";
//     return "large";
//   }

//   return "medium";
// };

const getRecommendation = (answers) => {
  const [age, status, birthHistory] = answers;

  if (age === "Under 18" || birthHistory === "No, I haven't") {
    return {
      size: "Small",
      explanation:
        "Perfect for beginners and those who haven't given birth. Our Small cup offers comfortable protection with easy insertion.",
    };
  } else if (birthHistory === "Yes, via vaginal delivery") {
    return {
      size: "Large",
      explanation:
        "Recommended for those who have given birth vaginally. Our Large cup provides optimal coverage and comfort for your body.",
    };
  } else if (birthHistory === "Yes, via C-Section" || age === "35+") {
    return {
      size: "Large",
      explanation:
        "Our Large cup is ideal for your needs, offering superior comfort and reliable protection.",
    };
  } else {
    return {
      size: "Small",
      explanation:
        "Our Small cup is perfect for you, providing comfortable and reliable protection.",
    };
  }
};


export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const navigateToVariant = (item) => {
    // router.push("/product");
    router.push(`/products/${item.product_id}?variantId=${item.id}`);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = async () => {
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption("");

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed, get recommendations
      setLoading(true);
      const recommendedSize = getRecommendation(newAnswers);
      const { explanation, size } = recommendedSize;
      console.log("Recommended Size:", recommendedSize);

      try {
        const response = await fetch(
          `https://momdaughts-quiz.vercel.app/api/size?size=${size}`
        );
        const data = await response.json();
        const Variants = data.variants.map((v) => {
          // https://momdaughts.com/products/silicone-menstrual-cup?variant=43736215159076",
          const variantId = v.variant_url.split("?variant=")[1];
          return {
            recommendedSize: size,
            explanation,
            id: variantId,
            ...v,
          };
        });
        setProducts(Variants || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback products
        setProducts([
          {
            id: 1,
            name: "Perfect Fit Bra",
            price: "$49.99",
            image: "/comfortable-bra.png",
            description: "Designed for your perfect fit",
          },
        ]);
      }

      setLoading(false);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
      setSelectedOption(answers[currentQuestion - 1] || "");
    }
  };

  const handleExit = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption("");
    setShowResults(false);
    setProducts([]);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.secondary, colors.accent]}
        style={styles.gradient}
      >
        <View style={styles.imageSection}>
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
              <Text style={styles.exitButtonText}>×</Text>
            </TouchableOpacity>
            {!showResults && (
              <>
                <Text style={styles.progressText}>
                  {currentQuestion + 1} of {questions.length}
                </Text>
                <View style={styles.progressBarContainer}>
                  <View
                    style={[styles.progressBar, { width: `${progress}%` }]}
                  />
                </View>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  {/* <Text style={styles.backButtonText}>←</Text> */}
                  <Ionicons name="arrow-back" size={14} color={colors.dark} />
                </TouchableOpacity>
              </>
            )}
          </View>
          <Image
            source={{
              uri: "https://i.ibb.co/ymfw2YVx/image.png",
            }}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.cardSection}>
          {showResults ? (
            // Results view
            <ScrollView
              style={styles.resultsScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.resultsTitle}>Your Perfect Match!</Text>
              <Text style={styles.resultsSubtitle}>
                Based on your answers, here are our recommendations:
              </Text>

              <Text style={styles.recommendedSizeText}>
                {products.length > 0 && products[0].recommendedSize}
              </Text>

              {/* <Text style={styles.recommendedSizeExplanation}>
                {products.length > 0 && products[0].explanation}
              </Text> */}

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.dark}
                  style={styles.loader}
                />
              ) : (
                <View style={styles.productsGrid}>
                  {products.map((product) => (
                    <View key={product.id} style={styles.productCard}>
                      <View style={styles.productRow}>
                        <Image
                          source={{ uri: product.image }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                        <View style={styles.productInfo}>
                          <Text style={styles.productName}>
                            {product.product_title}
                          </Text>
                          <Text style={styles.productDescription}>
                            {product.variant_title}
                          </Text>
                          <Text style={styles.productPrice}>
                            Rs.{product.price}
                          </Text>
                          <TouchableOpacity
                            onPress={() => navigateToVariant(product)}
                            style={styles.buyButton}
                          >
                            <Text style={styles.buyButtonText}>Shop Now</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.retakeButton} onPress={resetQuiz}>
                <Text style={styles.retakeButtonText}>Retake Quiz</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            // Quiz view
            <>
              <Text style={styles.questionText}>
                {questions[currentQuestion].question}
              </Text>

              <View style={styles.optionsContainer}>
                {questions[currentQuestion].options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedOption === option && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionLetter,
                          selectedOption === option &&
                            styles.selectedOptionLetter,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionLetterText,
                            selectedOption === option &&
                              styles.selectedOptionLetterText,
                          ]}
                        >
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          selectedOption === option &&
                            styles.selectedOptionText,
                        ]}
                      >
                        {option}
                      </Text>
                      <View
                        style={[
                          styles.radioButton,
                          selectedOption === option &&
                            styles.radioButtonSelected,
                        ]}
                      >
                        {selectedOption === option && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !selectedOption && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={!selectedOption}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestion === questions.length - 1
                    ? "Get Results"
                    : "Next"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageSection: {
    height: height * 0.4,
    position: "relative",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exitButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  exitButtonText: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: colors.dark,
  },
  progressContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: colors.black,
    marginRight: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: colors.dark,
  },
  cardSection: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  questionText: {
    fontSize: 20,
    fontFamily: "Outfit-SemiBold",
    color: colors.dark,
    marginBottom: 20, // Reduced from 32 to 20
    lineHeight: 28,
  },

  optionsContainer: {
    flex: 1,
    gap: 10,
    marginBottom: 8, // Added margin to create space between options and Next button
  },
  optionButton: {
    // backgroundColor: colors.primary + "10", // Adding transparency
    backgroundColor: "#f8f9fa" + "80",
    borderRadius: 16,
    padding: 16,
    borderColor: colors.secondary + "50", // Adding transparency
    borderWidth: 1,
  },
  selectedOption: {
    backgroundColor: colors.accent + "50", // Adding transparency
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  selectedOptionLetter: {
    backgroundColor: colors.white,
  },
  optionLetterText: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    color: colors.white,
  },
  selectedOptionLetterText: {
    color: colors.dark,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Outfit-Medium",
    color: colors.black,
  },
  selectedOptionText: {
    color: colors.dark,
    fontFamily: "Outfit-SemiBold",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#adb5bd" + "80", // Adding transparency
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: colors.dark,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.dark,
  },
  nextButton: {
    backgroundColor: colors.dark,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16, // Reduced from 24 to 16
    marginBottom: 20, // Added bottom margin to create space from screen edge
  },

  nextButtonDisabled: {
    backgroundColor: colors.secondary + "50", // Adding transparency
    borderColor: colors.secondary + "50",
  },
  nextButtonText: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: colors.white,
  },
  // Results styles
  resultsScrollView: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 28,
    fontFamily: "Outfit-Bold",
    color: colors.dark,
    textAlign: "center",
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: colors.black,
    textAlign: "center",
    marginBottom: 12,
    opacity: 0.8,
  },
  recommendedSizeText: {
    fontSize: 24,
    fontFamily: "Outfit-SemiBold",
    color: "#9b59b6",
    textAlign: "center",
    marginBottom: 16,
    textTransform: "capitalize",
    padding: 8,
  },
  recommendedSizeExplanation: {
    fontSize: 14,
    color: colors.black,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.9,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  loader: {
    marginVertical: 40,
  },
  productsGrid: {
    width: "100%",
    gap: 16,
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.secondary + "50", // Adding transparency
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: "center",
  },
  productName: {
    fontSize: 14,
    fontFamily: "Outfit-Bold",
    color: colors.dark,
    marginBottom: 2,
  },
  productDescription: {
    fontSize: 11,
    color: colors.black,
    marginBottom: 4,
    opacity: 0.7,
    lineHeight: 14,
  },
  productPrice: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    color: colors.black,
    marginBottom: 8,
  },
  buyButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  buyButtonText: {
    fontSize: 12,
    fontFamily: "Outfit-Bold",
    color: colors.white,
  },
  retakeButton: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  retakeButtonText: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    color: colors.accent,
  },
  gradient: {
    flex: 1,
  },
});
