import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ChangePasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // 에러 상태들
    const [emailError, setEmailError] = useState(false);
    const [showInvalidEmail, setShowInvalidEmail] = useState(false);
    const [currentPasswordError, setCurrentPasswordError] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [showPasswordMismatch, setShowPasswordMismatch] = useState(false);
    const [showPasswordTooShort, setShowPasswordTooShort] = useState(false);
    const [showSamePassword, setShowSamePassword] = useState(false);
    const [showCurrentPasswordWrong, setShowCurrentPasswordWrong] = useState(false);
    const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);

    // 패스워드 강도 체크
    const checkPasswordStrength = (password: string) => {
        const hasLength = password.length >= 6;
        const hasNumberAndLetter = /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        // 만족하는 조건의 개수 계산
        const satisfiedCount = [hasLength, hasNumberAndLetter, hasSpecialChar].filter(Boolean).length;
        
        return {
            hasLength,
            hasNumberAndLetter,
            hasSpecialChar,
            satisfiedCount,
            isComplete: hasLength && hasNumberAndLetter && hasSpecialChar
        };
    };

    const passwordStrength = checkPasswordStrength(newPassword);

    const handleChangePassword = () => {
        // 에러 상태 초기화
        setEmailError(false);
        setCurrentPasswordError(false);
        setNewPasswordError(false);
        setConfirmPasswordError(false);
        setShowPasswordMismatch(false);
        setShowPasswordTooShort(false);
        setShowSamePassword(false);
        setShowCurrentPasswordWrong(false);
        
        // 입력값 검증
        let hasError = false;
        
        if (!email.trim()) {
            setEmailError(true);
            hasError = true;
        }
        
        if (!currentPassword.trim()) {
            setCurrentPasswordError(true);
            hasError = true;
        }
        
        if (!newPassword.trim()) {
            setNewPasswordError(true);
            hasError = true;
        }
        
        if (!confirmPassword.trim()) {
            setConfirmPasswordError(true);
            hasError = true;
        }
        
        // 비밀번호 불일치 검사 (빈 필드가 아닐 때만)
        if (newPassword.trim() && confirmPassword.trim() && newPassword !== confirmPassword) {
            setShowPasswordMismatch(true);
            hasError = true;
        }
        
        // 현재 비밀번호와 새 비밀번호가 같은지 검사
        if (currentPassword.trim() && newPassword.trim() && currentPassword === newPassword) {
            setShowSamePassword(true);
            hasError = true;
        }
        
        // 비밀번호 길이 검사 (빈 필드가 아닐 때만)
        if (newPassword.trim() && !passwordStrength.isComplete) {
            setShowPasswordTooShort(true);
            hasError = true;
        }
        
        if (hasError) {
            return;
        }

        // TODO: 실제 비밀번호 변경 API 호출
        // 여기서 현재 비밀번호가 맞는지 확인하는 로직이 들어갈 예정
        // 현재는 임시로 "123456"을 올바른 비밀번호로 가정
        if (currentPassword !== "123456") {
            setShowCurrentPasswordWrong(true);
            return;
        }

        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-stone-100">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 bg-stone-100">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
                </TouchableOpacity>
                <Text className="text-2xl font-semibold text-neutral-900">
                    Change Password
                </Text>
                <View className="w-6" />
            </View>

            <KeyboardAvoidingView 
                className="flex-1" 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    className="flex-1 bg-stone-100" 
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="px-6 py-24">
                        {/* 이메일 */}
                        <View className="mb-6">
                            <Text className="text-lg font-semibold text-neutral-900 mb-3 ml-2">Email</Text>
                            <View className={`bg-white rounded-4xl p-4 border-2 ${emailError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: 60 }}>
                                <TextInput
                                    className="flex-1 text-lg pr-12 pt-0"
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
                                    value={email}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        if (emailError) setEmailError(false);
                                    }}
                                    multiline={false}
                                    textAlignVertical="center"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    style={{ backgroundColor: 'transparent', height: 25 }}
                                    onFocus={() => {
                                        setEmailError(false);
                                        setCurrentPasswordError(false);
                                        setNewPasswordError(false);
                                        setConfirmPasswordError(false);
                                        setShowPasswordMismatch(false);
                                        setShowPasswordTooShort(false);
                                        setShowCurrentPasswordWrong(false);
                                        setShowSamePassword(false);
                                    }}
                                />
                            </View>
                            

                        </View>

                        {/* 현재 비밀번호 */}
                        <View className="mb-6">
                            <Text className="text-lg font-semibold text-neutral-900 mb-3 ml-2">Current Password</Text>
                            <View className={`bg-white rounded-4xl p-4 border-2 ${currentPasswordError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: 60 }}>
                                <TextInput
                                    className="flex-1 text-lg pr-12 pt-0"
                                    placeholder="Enter your current password"
                                    placeholderTextColor="#9CA3AF"
                                    value={currentPassword}
                                    onChangeText={(text) => {
                                        setCurrentPassword(text);
                                        if (currentPasswordError) setCurrentPasswordError(false);
                                        if (showCurrentPasswordWrong) setShowCurrentPasswordWrong(false);
                                    }}
                                    multiline={false}
                                    textAlignVertical="center"

                                    style={{ backgroundColor: 'transparent', height: 25 }}
                                    onFocus={() => {
                                        setCurrentPasswordError(false);
                                        setNewPasswordError(false);
                                        setConfirmPasswordError(false);
                                        setShowPasswordMismatch(false);
                                        setShowPasswordTooShort(false);
                                        setShowCurrentPasswordWrong(false);
                                        setShowSamePassword(false);
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-4"
                                >
                                    <Ionicons
                                        name={showCurrentPassword ? "eye" : "eye-off"}
                                        size={24}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            {/* 현재 비밀번호 틀림 경고문 */}
                            {showCurrentPasswordWrong && (
                                <View className="mt-2">
                                    <Text className="text-red-500 text-sm">
                                        Current password is incorrect
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* 새 비밀번호 */}
                        <View className="mb-6">
                            <Text className="text-lg font-semibold text-neutral-900 mb-3 ml-2">New Password</Text>
                            <View className={`bg-white rounded-4xl p-4 border-2 ${newPasswordError ? 'border-red-500' : 'border-stone-200'}`} style={{ height: 60 }}>
                                <TextInput
                                    className="flex-1 text-lg pr-12 pt-0"
                                    placeholder="Enter your new password"
                                    placeholderTextColor="#9CA3AF"
                                    value={newPassword}
                                    onChangeText={(text) => {
                                        setNewPassword(text);
                                        if (newPasswordError) setNewPasswordError(false);
                                        if (showPasswordTooShort) setShowPasswordTooShort(false);
                                        if (showSamePassword) setShowSamePassword(false);
                                    }}
                                    multiline={false}
                                    textAlignVertical="center"

                                    style={{ backgroundColor: 'transparent', height: 25 }}
                                    onFocus={() => {
                                        setCurrentPasswordError(false);
                                        setNewPasswordError(false);
                                        setConfirmPasswordError(false);
                                        setShowPasswordMismatch(false);
                                        setShowPasswordTooShort(false);
                                        setShowCurrentPasswordWrong(false);
                                        setShowSamePassword(false);
                                        setIsNewPasswordFocused(true);
                                    }}
                                    onBlur={() => setIsNewPasswordFocused(false)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-4"
                                >
                                    <Ionicons
                                        name={showNewPassword ? "eye" : "eye-off"}
                                        size={24}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            {/* 패스워드 강도 게이지 */}
                            {isNewPasswordFocused && (
                                <View className="mt-3 ml-4">
                                    <View className="flex-row mb-2">
                                        <View className={`w-28 h-2 rounded-l-full ${
                                            passwordStrength.satisfiedCount >= 1
                                                ? (passwordStrength.isComplete ? 'bg-green-500' : 'bg-red-500')
                                                : 'bg-gray-400'
                                        }`} />
                                        <View className={`w-28 h-2 ${
                                            passwordStrength.satisfiedCount >= 2
                                                ? (passwordStrength.isComplete ? 'bg-green-500' : 'bg-red-500')
                                                : 'bg-gray-400'
                                        }`} />
                                        <View className={`w-28 h-2 rounded-r-full ${
                                            passwordStrength.satisfiedCount >= 3
                                                ? (passwordStrength.isComplete ? 'bg-green-500' : 'bg-red-500')
                                                : 'bg-gray-400'
                                        }`} />
                                    </View>
                                    <View className="flex-row space-x-4">
                                        <Text className="text-xs text-gray-500">
                                            Password must be 6+ characters,
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            with numbers
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            and special symbols
                                        </Text>
                                    </View>
                                </View>
                            )}
                            
                            {/* 비밀번호 길이 경고문 */}
                            {showPasswordTooShort && (
                                <View className="mt-2">
                                    <Text className="text-red-500 text-sm">
                                        Please check the password requirements
                                    </Text>
                                </View>
                            )}
                            
                            {/* 현재 비밀번호와 동일한 비밀번호 경고문 */}
                            {showSamePassword && (
                                <View className="mt-2">
                                    <Text className="text-red-500 text-sm">
                                        New password must be different from current password
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* 새 비밀번호 확인 */}
                        <View className="mb-6">
                            <Text className="text-lg font-semibold text-neutral-900 mb-3 ml-2">Confirm New Password</Text>
                            <View className={`bg-white rounded-4xl p-4 border-2 ${confirmPasswordError ? 'border-red-500' : 'border-stone-200'} ${!passwordStrength.isComplete ? 'opacity-50' : ''}`} style={{ height: 60 }}>
                                <TextInput
                                    className="flex-1 text-lg pr-12 pt-0"
                                    placeholder={passwordStrength.isComplete ? "Re-enter your new password" : "Complete password requirements first"}
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        if (confirmPasswordError) setConfirmPasswordError(false);
                                    }}
                                    multiline={false}
                                    textAlignVertical="center"

                                    style={{ backgroundColor: 'transparent', height: 25 }}
                                    editable={passwordStrength.isComplete}
                                    onFocus={() => {
                                        setCurrentPasswordError(false);
                                        setNewPasswordError(false);
                                        setConfirmPasswordError(false);
                                        setShowPasswordMismatch(false);
                                        setShowPasswordTooShort(false);
                                        setShowCurrentPasswordWrong(false);
                                        setShowSamePassword(false);
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-4"
                                    disabled={!passwordStrength.isComplete}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? "eye" : "eye-off"}
                                        size={24}
                                        color={passwordStrength.isComplete ? "#6B7280" : "#D1D5DB"}
                                    />
                                </TouchableOpacity>
                            </View>
                            
                            {/* 비밀번호 불일치 경고문 */}
                            {showPasswordMismatch && (
                                <View className="mt-2">
                                    <Text className="text-red-500 text-sm">
                                        Password mismatch
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* 변경하기 버튼 */}
                        <View className="mt-8">
                            <TouchableOpacity 
                                className="py-5 rounded-4xl items-center"
                                style={{ backgroundColor: '#5A4636' }}
                                onPress={handleChangePassword}
                            >
                                <Text className="text-white text-lg font-semibold">Change Password</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ChangePasswordScreen;
