import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../../store/userStore';
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
            
            console.log('Loaded userName:', userName);
            console.log('Loaded userProfileImage:', userProfileImage);
            
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
            Alert.alert('Error', 'Please enter your name.');
            return;
        }
        
        if (!phone.trim()) {
            Alert.alert('Error', 'Please enter your phone number.');
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

    // 프로필 이미지 선택
    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your photo library');
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
            Alert.alert('Error', 'Failed to pick image');
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
            
            // userStore도 업데이트
            if (user) {
                await updateUser({ 
                    ...user, 
                    name: tempName.trim() 
                });
            }
        } else {
            Alert.alert('Error', '이름을 입력해주세요.');
        }
    };

    // 이름 편집 취소
    const cancelEditingName = () => {
        setTempName(name);
        setIsEditingName(false);
    };

    // 비밀번호 변경
    const handlePasswordChange = () => {
        navigation.navigate('ChangePassword');
    };

    // 로그아웃
    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '로그아웃', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // TODO: 로그인 구현 후 실제 로그아웃 로직 추가
                            // - 토큰 삭제
                            // - 사용자 정보 초기화
                            // - 로그인 화면으로 이동
                            console.log('로그아웃 처리 중...');
                            Alert.alert('로그아웃', '로그아웃 기능은 로그인 구현 후 활성화됩니다.');
                        } catch (error) {
                            console.error('로그아웃 오류:', error);
                            Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
                        }
                    }
                }
            ]
        );
    };

    // 회원탈퇴
    const handleWithdrawal = () => {
        Alert.alert(
            '회원탈퇴',
            '정말 회원을 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
            [
                { text: '취소', style: 'cancel' },
                { 
                    text: '탈퇴', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // TODO: 로그인 구현 후 실제 회원탈퇴 로직 추가
                            // - 사용자 계정 삭제
                            // - 관련 데이터 정리
                            // - 로그인 화면으로 이동
                            console.log('회원탈퇴 처리 중...');
                            Alert.alert('회원탈퇴', '회원탈퇴 기능은 로그인 구현 후 활성화됩니다.');
                        } catch (error) {
                            console.error('회원탈퇴 오류:', error);
                            Alert.alert('오류', '회원탈퇴 중 오류가 발생했습니다.');
                        }
                    }
                }
            ]
        );
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
                                <Text className="text-sm text-stone-500">프로필 사진 삭제</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Account Details Section */}
                        <View className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
                            {/* 이름 */}
                            {isEditingName ? (
                                <View className="p-6 border-b border-gray-100">
                                    <Text className="text-lg font-semibold text-neutral-900 mb-3">이름</Text>
                                    <View className="flex-row items-center">
                                        <TextInput
                                            value={tempName}
                                            onChangeText={setTempName}
                                            className="flex-1 text-lg font-medium text-neutral-900 mr-3"
                                            placeholder="이름을 입력하세요"
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
                                    <Text className="text-lg text-neutral-900 flex-1">이름</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-lg font-medium text-neutral-900 mr-2">{name || 'User'}</Text>
                                        <Ionicons name="chevron-forward" size={18} color="#6b7280" />
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* 대표 이메일 */}
                            <TouchableOpacity className="flex-row items-center p-6 border-b border-gray-100">
                                <Text className="text-lg text-neutral-900 flex-1">대표 이메일</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-lg font-medium text-neutral-900 mr-2">{email || 'user@example.com'}</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#6b7280" />
                                </View>
                            </TouchableOpacity>

                            {/* 비밀번호 변경 */}
                            <TouchableOpacity className="flex-row items-center p-6" onPress={handlePasswordChange}>
                                <Text className="text-lg text-neutral-900 flex-1">비밀번호 변경</Text>
                                <Ionicons name="chevron-forward" size={18} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* 로그아웃/회원탈퇴 */}
                        <View className="mt-8 flex-row justify-center items-center">
                            <TouchableOpacity onPress={handleLogout}>
                                <Text className="text-base text-stone-600">로그아웃</Text>
                            </TouchableOpacity>
                            <Text className="text-base text-stone-400 mx-4">|</Text>
                            <TouchableOpacity onPress={handleWithdrawal}>
                                <Text className="text-base text-stone-600">회원탈퇴</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfileScreen;