import React, { useState, useEffect } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import useUserStore from '../../../store/userStore';
import CustomInput from '../../../components/common/Input';
import CustomButton from '../../../components/common/Button';
import { COLORS } from '../../../constants/colors';

// Styled components for NativeWind

const EditProfileScreen = ({ navigation }: any) => {
    const { t } = useTranslation();
    const { user, updateUser } = useUserStore();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phoneNumber || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter your name.');
            return;
        }
        
        if (!phone.trim()) {
            Alert.alert('Error', 'Please enter your phone number.');
            return;
        }

        setLoading(true);
        try {
            await updateUser({ 
                name: name.trim(), 
                phoneNumber: phone.trim(), 
                email: email.trim() 
            });
            Alert.alert(
                'Success', 
                'Profile updated successfully.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert('Error', 'An error occurred while updating profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-stone-100">
                <View className="flex-1 justify-center items-center px-6">
                    <View className="bg-white rounded-2xl p-8 items-center">
                        <Ionicons name="person-outline" size={64} color="#9AA0A6" />
                        <Text className="text-xl font-semibold text-neutral-600 mt-6 text-center">
                            Unable to load user information
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-stone-100">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-stone-200">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-neutral-900">
                    Edit Profile
                </Text>
                <View className="w-6" />
            </View>

            <KeyboardAvoidingView 
                className="flex-1" 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView 
                    className="flex-1" 
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="px-6 py-8">
                        {/* Profile Avatar Section */}
                        <View className="items-center mb-10">
                            <View className="w-24 h-24 bg-sage-600 rounded-full justify-center items-center mb-4">
                                <Ionicons name="person" size={48} color="white" />
                            </View>
                            <TouchableOpacity className="px-4 py-2 bg-sage-50 rounded-2xl border border-sage-200 active:bg-sage-100">
                                <Text className="text-sm font-semibold text-sage-600">
                                    Change Profile Photo
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Section */}
                        <View className="space-y-6">
                            {/* Name Input */}
                            <View>
                                <Text className="text-base font-semibold text-neutral-700 mb-2">
                                    {t('onboarding.profile.name')}
                                </Text>
                                <CustomInput 
                                    value={name} 
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    className="bg-white border-stone-200 rounded-2xl"
                                />
                            </View>

                            {/* Phone Input */}
                            <View>
                                <Text className="text-base font-semibold text-neutral-700 mb-2">
                                    {t('reservation.phoneNumber')}
                                </Text>
                                <CustomInput 
                                    value={phone} 
                                    onChangeText={setPhone} 
                                    keyboardType="phone-pad"
                                    placeholder="Enter your phone number"
                                    className="bg-white border-stone-200 rounded-2xl"
                                />
                            </View>

                            {/* Email Input (Read-only) */}
                            <View>
                                <Text className="text-base font-semibold text-neutral-700 mb-2">
                                    {t('reservation.email')}
                                </Text>
                                <View className="bg-stone-100 rounded-2xl p-4 border border-stone-200">
                                    <Text className="text-base text-neutral-600 font-medium">
                                        {email}
                                    </Text>
                                </View>
                                <Text className="text-sm text-neutral-500 mt-2 font-medium">
                                    Email cannot be changed for security reasons
                                </Text>
                            </View>
                        </View>

                        {/* Info Section */}
                        <View className="bg-sage-50 rounded-2xl p-4 mt-8 border border-sage-200">
                            <View className="flex-row items-start">
                                <Ionicons name="information-circle-outline" size={20} color="#4A5D23" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-sm font-semibold text-sage-600 mb-1">
                                        Profile Information
                                    </Text>
                                    <Text className="text-sm text-sage-600 leading-5">
                                        • Name and phone number are used for reservations{'\n'}
                                        • Please enter accurate information{'\n'}
                                        • For email changes, contact customer service
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                {/* Save Button */}
                <View className="p-6 border-t border-stone-200 bg-white">
                    <CustomButton 
                        title={loading ? 'Saving...' : 'Save Profile'} 
                        onPress={handleSave}
                        disabled={loading}
                        className={`rounded-2xl py-4 ${
                            loading ? 'bg-neutral-300' : 'bg-sage-600'
                        }`}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;