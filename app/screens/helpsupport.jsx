"use client";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Text from "../../components/Text";
export default function HelpSupportPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const helpCategories = [
    {
      id: "period-care",
      title: "Period Care",
      icon: "medical",
      items: [
        {
          question: "How do I choose the right menstrual cup size?",
          answer: "Consider your age, flow, and whether you've given birth. We offer Long Tailed, Short Tailed, and Double Tail options. Our Long Tailed cup is perfect for higher cervix, while Short Tailed works best for lower cervix."
        },
        {
          question: "How do I clean and sterilize my menstrual cup?",
          answer: "Rinse with water during each change and sterilize between cycles. Use our Foldable Sterilizer Cup for convenient and reliable sterilization."
        },
        {
          question: "What if my menstrual cup is leaking?",
          answer: "Leaks often occur due to improper positioning or wrong size. Ensure the cup is fully opened and seated correctly. Consider trying different sizes from our menstrual collection."
        },
        {
          question: "How long can I wear a menstrual cup?",
          answer: "You can safely wear a menstrual cup for up to 12 hours, depending on your flow. Empty and rinse as needed throughout the day."
        }
      ]
    },
    {
      id: "skincare",
      title: "Skincare & Beauty",
      icon: "sparkles",
      items: [
        {
          question: "How do I use IPL hair remover safely?",
          answer: "Always read instructions carefully. Start with lower settings and gradually increase. Use on clean, dry skin and avoid sun exposure before and after treatment."
        },
        {
          question: "Which serum should I use for my skin type?",
          answer: "We offer various serums: Niacinamide for oily skin, Hyaluronic Acid for hydration, Vitamin C for brightening, and Retinol for anti-aging. Consult our skincare guide or contact support for personalized recommendations."
        },
        {
          question: "Can I use multiple serums together?",
          answer: "Yes, but introduce one at a time. Some combinations work well like Niacinamide + Vitamin C or Niacinamide + Retinol. Avoid using Vitamin C and Retinol together."
        }
      ]
    },
    {
      id: "orders",
      title: "Orders & Shipping",
      icon: "cube",
      items: [
        {
          question: "How can I track my order?",
          answer: "Once your order is shipped, you'll receive a tracking number via email or SMS. You can also check your order status in the app under 'My Orders'."
        },
        {
          question: "What are the shipping charges?",
          answer: "We offer fast shipping across Pakistan. Shipping charges vary by location and order value. Orders above a certain amount qualify for free shipping."
        },
        {
          question: "Can I change or cancel my order?",
          answer: "You can modify or cancel your order within 2 hours of placing it. After that, please contact our support team for assistance."
        }
      ]
    },
    {
      id: "account",
      title: "Account & App",
      icon: "person",
      items: [
        {
          question: "How do I reset my password?",
          answer: "Use the 'Forgot Password' option on the login screen. Enter your email, and we'll send you a verification code to reset your password."
        },
        {
          question: "Can I change my email or phone number?",
          answer: "Yes, you can update your contact information in the app settings. For security purposes, you may need to verify the new information."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team to request account deletion. Please note that this action is irreversible."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      type: "WhatsApp",
      icon: "logo-whatsapp",
      value: "+92 XXX XXXXXXX",
      action: () => Linking.openURL("https://wa.me/92XXXXXXXXX")
    },
    {
      type: "Email",
      icon: "mail",
      value: "support@momdaughts.com",
      action: () => Linking.openURL("mailto:support@momdaughts.com")
    },
    {
      type: "Phone",
      icon: "call",
      value: "+92 XXX XXXXXXX",
      action: () => Linking.openURL("tel:+92XXXXXXXXX")
    }
  ];

  const handleSubmitForm = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    
    // Here you would typically send the form data to your backend
    Alert.alert("Success", "Your message has been sent! We'll get back to you soon.");
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#4a5568" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help & Support</Text>
            <View style={styles.placeholder} />
            {/* <Image
            source={{uri: "https://i.ibb.co/391FfHYS/Layer-1.png"}}
              style={{
                width: 35,
                height: 35
              }}
            /> */}

          </View>

          {/* Quick Contact Methods */}
          <View style={styles.quickContactSection}>
            <Text style={styles.sectionTitle}>Get Quick Help</Text>
            <View style={styles.contactMethodsContainer}>
              {contactMethods.map((method, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.contactMethod}
                  onPress={method.action}
                >
                  <Ionicons name={method.icon} size={24} color="#2c2a6b" />
                  <Text style={styles.contactMethodType}>{method.type}</Text>
                  <Text style={styles.contactMethodValue}>{method.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {helpCategories.map((category) => (
              <View key={category.id} style={styles.categoryContainer}>
                <TouchableOpacity 
                  style={styles.categoryHeader}
                  onPress={() => setSelectedCategory(
                    selectedCategory === category.id ? null : category.id
                  )}
                >
                  <View style={styles.categoryHeaderLeft}>
                    <Ionicons name={category.icon} size={20} color="#2c2a6b" />
                    <Text style={styles.categoryTitle}>{category.title}</Text>
                  </View>
                  <Ionicons 
                    name={selectedCategory === category.id ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#718096" 
                  />
                </TouchableOpacity>
                
                {selectedCategory === category.id && (
                  <View style={styles.categoryContent}>
                    {category.items.map((item, index) => (
                      <View key={index} style={styles.faqItem}>
                        <Text style={styles.faqQuestion}>{item.question}</Text>
                        <Text style={styles.faqAnswer}>{item.answer}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.contactFormSection}>
            <Text style={styles.sectionTitle}>Send us a Message</Text>
            <Text style={styles.sectionSubtitle}>
              Can't find what you're looking for? We're here to help!
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholderTextColor="#9ca3af"
                  placeholder="Your full name"
                  value={contactForm.name}
                  onChangeText={(text) => setContactForm({...contactForm, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="your.email@example.com"
                  
                  value={contactForm.email}
                  onChangeText={(text) => setContactForm({...contactForm, email: text})}
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Brief subject of your inquiry"
                  placeholderTextColor="#9ca3af"
                  value={contactForm.subject}
                  onChangeText={(text) => setContactForm({...contactForm, subject: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message *</Text>
                <TextInput
                  style={[styles.textInput, styles.messageInput]}
                  placeholder="Describe your issue or question in detail..."
                  placeholderTextColor="#9ca3af"
                  value={contactForm.message}
                  onChangeText={(text) => setContactForm({...contactForm, message: text})}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleSubmitForm}
              >
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
  },
  placeholder: {
    width: 40,
  },

  // Help & Support Styles
  quickContactSection: {
    padding: 24,
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: "#2d3748",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 20,
    lineHeight: 20,
  },
  contactMethodsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactMethod: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  contactMethodType: {
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
    color: "#2c2a6b",
    marginTop: 8,
  },
  contactMethodValue: {
    fontSize: 10,
    color: "#718096",
    marginTop: 4,
  },
  faqSection: {
    padding: 24,
    backgroundColor: "#ffffff",
    marginBottom: 8,
  },
  categoryContainer: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
    marginLeft: 12,
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  faqItem: {
    marginBottom: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: "#718096",
    lineHeight: 18,
  },
  contactFormSection: {
    padding: 24,
    backgroundColor: "#ffffff",
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    color: "#4a5568",
    fontFamily: "Outfit-Medium",
  },
  textInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2d3748",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  messageInput: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#2c2a6b",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
  },

  // About Page Styles
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#2c2a6b",
  },
  tabText: {
    fontSize: 14,
    color: "#718096",
    fontFamily: "Outfit-Medium",
  },
  activeTabText: {
    color: "#2c2a6b",
    fontFamily: "Outfit-SemiBold",
  },
  aboutContent: {
    padding: 24,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 24,
  },
  aboutLogo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 32,
    fontFamily: "Outfit-Bold",
    color: "#f596bb",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#718096",
    fontStyle: "italic",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 22,
  },
  valuesContainer: {
    gap: 16,
  },
  valueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  valueIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  valueTextContainer: {
    flex: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 13,
    color: "#718096",
    lineHeight: 18,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  socialButton: {
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  socialText: {
    fontSize: 12,
    fontFamily: "Outfit-SemiBold",
    marginTop: 8,
  },
  companyInfo: {
    gap: 12,
  },
  companyInfoText: {
    fontSize: 14,
    color: "#4a5568",
    lineHeight: 20,
  },
  companyInfoLabel: {
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
  },

  // Terms & Conditions Styles
  termsContent: {
    padding: 24,
  },
  termsHeader: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  termsTitle: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#2d3748",
    marginBottom: 8,
  },
  termsLastUpdated: {
    fontSize: 12,
    color: "#718096",
    marginBottom: 16,
  },
  termsIntro: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: "center",
    lineHeight: 20,
  },
  termsSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  termsSectionTitle: {
    fontSize: 16,
    fontFamily: "Outfit-SemiBold",
    color: "#2d3748",
    marginBottom: 12,
  },
  termsSectionContent: {
    fontSize: 13,
    color: "#4a5568",
    lineHeight: 18,
    marginBottom: 6,
  },
  termsFooter: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  termsFooterText: {
    fontSize: 12,
    color: "#718096",
    textAlign: "center",
    lineHeight: 16,
    fontStyle: "italic",
  },
});