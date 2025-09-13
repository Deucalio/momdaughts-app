import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Text from "../../components/Text";
import { useAuthStore } from "../utils/authStore";
const COLORS = {
  primary: '#007AFF',
  gray: '#8E8E93',
  lightGray: '#F2F2F7',
  darkGray: '#3C3C43',
  white: '#FFFFFF',
  border: '#E5E5EA',
};

const ProfilePage = () => {
  const {user} = useAuthStore();
  console.log("u:", user)
  const [userProfile, setUserProfile] = useState({
    name: `${user.firstName} ${user.lastName}`,
    email: `${user.email}`,
    phone: `${user.phone || "0315-1234567"} `,
    password: '••••••••',
    avatar: null,
  });
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [editingField, setEditingField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [otp, setOtp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // New states for name editing
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // New states for password editing
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const profileFields = [
    { key: 'name', label: 'Name', icon: 'person-outline', value: userProfile.name },
    { key: 'email', label: 'Email', icon: 'mail-outline', value: userProfile.email },
    { key: 'phone', label: 'Phone', icon: 'call-outline', value: userProfile.phone },
    { key: 'password', label: 'Password', icon: 'lock-closed-outline', value: userProfile.password },
  ];

  const openEditModal = (field, value) => {
    setEditingField(field);
    setEditValue(value === '••••••••' ? '' : value);
    
    if (field === 'email') {
      setNewEmail(value);
      setOtpModalVisible(true);
    } else if (field === 'name') {
      // Split the current name into first and last name
      const nameParts = value.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setModalVisible(true);
    } else if (field === 'password') {
      setNewPassword('');
      setConfirmPassword('');
      setModalVisible(true);
    } else {
      setModalVisible(true);
    }
  };

  const saveField = async () => {
    // Validation
    if (editingField === 'name') {
      if (!firstName.trim() || !lastName.trim()) {
        Alert.alert('Error', 'Please enter both first name and last name');
        return;
      }
    } else if (editingField === 'password') {
      if (newPassword.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
    } else if (editingField === 'phone') {
      if (!editValue.trim()) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let updatedValue = editValue;
      if (editingField === 'name') {
        updatedValue = `${firstName.trim()} ${lastName.trim()}`;
      } else if (editingField === 'password') {
        updatedValue = '••••••••';
      }
      
      setUserProfile(prev => ({
        ...prev,
        [editingField]: updatedValue
      }));
      
      setModalVisible(false);
      setEditingField('');
      setEditValue('');
      setFirstName('');
      setLastName('');
      setNewPassword('');
      setConfirmPassword('');
      
      Alert.alert('Success', `${editingField.charAt(0).toUpperCase() + editingField.slice(1)} updated successfully`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsOtpLoading(true);
    
    try {
      // Simulate API call for sending OTP
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsOtpSent(true);
      setOtpTimer(60);
      
      Alert.alert('OTP Sent', `Verification code sent to ${newEmail}`);
      
      // Start countdown
      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }
    
    setIsOtpLoading(true);
    
    try {
      // Simulate API call for OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUserProfile(prev => ({ ...prev, email: newEmail }));
      setOtpModalVisible(false);
      setOtp('');
      setNewEmail('');
      setIsOtpSent(false);
      setOtpTimer(0);
      Alert.alert('Success', 'Email updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const closeOtpModal = () => {
    setOtpModalVisible(false);
    setOtp('');
    setNewEmail('');
    setIsOtpSent(false);
    setOtpTimer(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userProfile?.avatar ? (
              <Image
                source={{ uri: userProfile.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={30} color={COLORS.gray} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{userProfile.name}</Text>
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsContainer}>
          {profileFields.map((field, index) => (
            <TouchableOpacity
              key={field.key}
              style={[
                styles.fieldRow,
                index === profileFields.length - 1 && styles.lastFieldRow
              ]}
              onPress={() => openEditModal(field.key, field.value)}
            >
              <View style={styles.fieldLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={field.icon} size={20} color={COLORS.gray} />
                </View>
                <View style={styles.fieldInfo}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{field.value}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit {editingField}</Text>
              <TouchableOpacity onPress={saveField} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.modalSave}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {editingField === 'name' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>First Name</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={firstName}
                      onChangeText={setFirstName}
                      autoFocus={true}
                      editable={!isLoading}
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Last Name</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={lastName}
                      onChangeText={setLastName}
                      placeholderTextColor="#9ca3af"
                      editable={!isLoading}
                    />
                  </View>
                </>
              ) : editingField === 'password' ? (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={true}
                      autoFocus={true}
                      placeholderTextColor="#9ca3af"
                      editable={!isLoading}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={true}
                      placeholderTextColor="#9ca3af"
                      editable={!isLoading}
                    />
                  </View>
                </>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    {editingField === 'phone' ? 'Phone Number' : editingField.charAt(0).toUpperCase() + editingField.slice(1)}
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editValue}
                    onChangeText={setEditValue}
                    autoFocus={true}
                    editable={!isLoading}
                    placeholderTextColor="#9ca3af"
                    keyboardType={editingField === 'phone' ? 'phone-pad' : 'default'}
                  />
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* OTP Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={otpModalVisible}
        onRequestClose={closeOtpModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeOtpModal}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Change Email</Text>
              <TouchableOpacity onPress={isOtpSent ? verifyOTP : sendOTP} disabled={isOtpLoading}>
                {isOtpLoading ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.modalSave}>
                    {isOtpSent ? 'Verify' : 'Send OTP'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              {!isOtpSent ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>New Email Address</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    placeholderTextColor="#9ca3af"
                    autoFocus={true}
                    editable={!isOtpLoading}
                  />
                </View>
              ) : (
                <>
                  <Text style={styles.otpText}>
                    Enter the 6-digit code sent to {newEmail}
                  </Text>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Verification Code</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      placeholderTextColor="#9ca3af"
                      
                      maxLength={6}
                      autoFocus={true}
                      editable={!isOtpLoading}
                    />
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.resendButton,
                      (otpTimer > 0 || isOtpLoading) && styles.resendButtonDisabled
                    ]}
                    onPress={sendOTP}
                    disabled={otpTimer > 0 || isOtpLoading}
                  >
                    <Text style={[
                      styles.resendButtonText,
                      otpTimer > 0 && styles.resendButtonTextDisabled
                    ]}>
                      {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.darkGray,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 24,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.darkGray,
  },
  fieldsContainer: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastFieldRow: {
    borderBottomWidth: 0,
  },
  fieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontFamily: "Outfit-Regular",
  
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Outfit-SemiBold",
    color: COLORS.darkGray,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.gray,
  },
  modalSave: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: "Outfit-SemiBold",
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Outfit-Medium",
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.lightGray,
  },
  otpText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontFamily: "Outfit-Medium",
  },
  resendButtonTextDisabled: {
    color: COLORS.gray,
  },
});

export default ProfilePage;