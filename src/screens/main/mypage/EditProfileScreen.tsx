import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../../store/userStore';
import { supabase } from '../../../lib/supabase';
import CustomInput from '../../../components/common/Input';
import CustomButton from '../../../components/common/Button';
import { COLORS } from '../../../constants/colors';

// Styled components for NativeWind

const EditProfileScreen = ({ navigation }: any) => {
    // 네비게이션 헤더 숨기기
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false,
            header: () => null,
            headerStyle: { height: 0 },
            headerTitle: '',
        });
    }, [navigation]);
    
    const { t } = useTranslation();
    const { user, updateUser } = useUserStore();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState('');

    useEffect(() => {
        // AsyncStorage에서 사용자 정보를 먼저 불러오기
        loadUserInfo();
        
        // user store에서 정보가 있으면 추가로 설정
        if (user) {
            setName(user.name || '');
            setPhone(user.phoneNumber || '');
            setEmail(user.email || '');
        }
    }, []);

    // AsyncStorage에서 사용자 정보 불러오기
    const loadUserInfo = async () => {
        try {
            const userName = await AsyncStorage.getItem('userName');
            const userProfileImage = await AsyncStorage.getItem('userProfileImage');
            
            if (__DEV__) {
              console.log('Loaded userName:', userName);
            }
            if (__DEV__) {
              console.log('Loaded userProfileImage:', userProfileImage);
            }
            
            if (userName) {
                setName(userName);
            }
            if (userProfileImage) {
                setProfileImage(userProfileImage);
            }
        } catch (error) {
            console.error('Failed to load user info:', error);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Error', t('onboarding.enterName'));
            return;
        }
        
        if (!phone.trim()) {
            Alert.alert('Error', t('profile.phoneNumberRequired'));
            return;
        }

        setLoading(true);
        try {
            // AsyncStorage에 사용자 정보 저장
            if (name.trim() !== '') {
                await AsyncStorage.setItem('userName', name.trim());
            }
            if (profileImage) {
                await AsyncStorage.setItem('userProfileImage', profileImage);
            }
            
            // userStore 업데이트
            await updateUser({ 
                name: name.trim(), 
                phoneNumber: phone.trim(), 
                email: email.trim() 
            });
            
            // Supabase 프로필 업데이트
            if (user?.id) {
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            name: name.trim(),
                            email: email.trim(),
                            profile_image: profileImage,
                            updated_at: new Date().toISOString()
                        });
                    
                    if (!error && __DEV__) {
                        console.log('✅ Supabase 전체 프로필 업데이트 성공');
                    }
                } catch (error) {
                    // Supabase 오류는 무시하고 로컬 저장소 사용 (정상 동작)
                    if (__DEV__) {
                        console.log('Supabase 전체 프로필 업데이트 실패, 로컬 저장소만 사용');
                    }
                }
            }
            
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

    // 프로필 이미지 선택
    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert(t('onboarding.permissionNeeded'), t('onboarding.photoLibraryPermission'));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const newImageUri = result.assets[0].uri;
                setProfileImage(newImageUri);
                
                // AsyncStorage에 저장
                await AsyncStorage.setItem('userProfileImage', newImageUri);
                
                // userStore도 업데이트
                if (user) {
                    await updateUser({ 
                        ...user, 
                        profileImage: newImageUri 
                    });
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', t('onboarding.failedToPickImage'));
        }
    };

    // 이름 편집 시작
    const startEditingName = () => {
        setTempName(name);
        setIsEditingName(true);
    };

    // 이름 편집 완료
    const finishEditingName = async () => {
        if (tempName.trim()) {
            setName(tempName.trim());
            await AsyncStorage.setItem('userName', tempName.trim());
            setIsEditingName(false);
            
            // userStore 업데이트
            if (user) {
                await updateUser({ 
                    ...user, 
                    name: tempName.trim() 
                });
            }
            
            // Supabase 프로필 업데이트
            if (user?.id) {
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .upsert({
                            id: user.id,
                            name: tempName.trim(),
                            updated_at: new Date().toISOString()
                        });
                    
                    if (!error && __DEV__) {
                        console.log('✅ Supabase 프로필 이름 업데이트 성공:', tempName.trim());
                    }
                } catch (error) {
                    // Supabase 오류는 무시하고 로컬 저장소 사용 (정상 동작)
                    if (__DEV__) {
                        console.log('Supabase 프로필 업데이트 실패, 로컬 저장소만 사용');
                    }
                }
            }
        } else {
            Alert.alert('Error', t('onboarding.enterName'));
        }
    };

    // 이름 편집 취소
    const cancelEditingName = () => {
        setTempName(name);
        setIsEditingName(false);
    };






    // user가 없어도 AsyncStorage에서 정보를 불러올 수 있도록 수정
    // if (!user) 조건 제거

    return (
        <SafeAreaView className="flex-1 bg-stone-100">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-4 bg-stone-100">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
                </TouchableOpacity>
                <Text className="text-2xl font-semibold text-neutral-900">
                    Edit Profile
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
                    <View className="px-6 py-8">
                        {/* Profile Avatar Section */}
                        <View className="items-center mb-8">
                            <View className="relative">
                                <View className="w-32 h-32 bg-stone-100 rounded-full justify-center items-center mb-4 overflow-hidden border-2 border-stone-300">
                                    {profileImage ? (
                                        <Image source={{ uri: profileImage }} className="w-full h-full" />
                                    ) : (
                                        <Ionicons name="sunny" size={64} color="#F59E0B" />
                                    )}
                                </View>
                                
                                {/* 카메라 아이콘 */}
                                <TouchableOpacity 
                                    className="absolute bottom-2 right-2 w-8 h-8 bg-sage-600 rounded-full items-center justify-center border-2 border-white"
                                    onPress={pickImage}
                                >
                                    <Ionicons name="camera" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                            
                            {/* 프로필 사진 삭제 텍스트 */}
                            <TouchableOpacity onPress={async () => {
                                setProfileImage(null);
                                
                                // AsyncStorage에서 제거
                                await AsyncStorage.removeItem('userProfileImage');
                                
                                // userStore도 업데이트
                                if (user) {
                                    await updateUser({ 
                                        ...user, 
                                        profileImage: undefined 
                                    });
                                }
                            }}>
                                <Text className="text-sm text-stone-500">Delete Profile Photo</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Account Details Section */}
                        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                            {/* 이름 */}
                            {isEditingName ? (
                                <View className="p-6 border-b border-gray-100">
                                    <Text className="text-lg font-semibold text-neutral-900 mb-3">Name</Text>
                                    <View className="flex-row items-center">
                                        <TextInput
                                            value={tempName}
                                            onChangeText={setTempName}
                                            className="flex-1 text-lg font-medium text-neutral-900 mr-3"
                                            placeholder="Enter your name"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                        <TouchableOpacity onPress={finishEditingName} className="mr-2">
                                            <Ionicons name="checkmark" size={20} color="#10B981" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={cancelEditingName}>
                                            <Ionicons name="close" size={20} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity className="flex-row items-center p-6 border-b border-gray-100" onPress={startEditingName}>
                                    <Text className="text-lg text-neutral-900 flex-1">Name</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-lg font-medium text-neutral-900 mr-2">{name || 'User'}</Text>
                                        <Ionicons name="chevron-forward" size={18} color="#6b7280" />
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* 대표 이메일 */}
                            <View className="flex-row items-center p-6 border-b border-gray-100">
                                <Text className="text-lg text-neutral-900 flex-1">Email</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-lg font-medium text-neutral-900 mr-2">{email || 'user@example.com'}</Text>
                                </View>
                            </View>


                        </View>



                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;