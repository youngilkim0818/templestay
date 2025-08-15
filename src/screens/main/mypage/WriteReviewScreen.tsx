import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const WriteReviewScreen = ({ navigation, route }: any) => {
  const { mode = 'create', reviewId, templeId, templeName = '사찰 선택' } = route.params || {};
  
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [selectedTemple, setSelectedTemple] = useState(templeName);
  const [isRecommended, setIsRecommended] = useState(true);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleRatingPress = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!content.trim()) {
      Alert.alert('알림', '리뷰 내용을 입력해주세요.');
      return;
    }

    if (selectedTemple === '사찰 선택') {
      Alert.alert('알림', '사찰을 선택해주세요.');
      return;
    }

    // 여기서 실제 API 호출
    Alert.alert(
      '완료',
      mode === 'create' ? '리뷰가 작성되었습니다.' : '리뷰가 수정되었습니다.',
      [
        {
          text: '확인',
          onPress: () => navigation.goBack()
        }
      ]
    );
  }, [content, selectedTemple, mode, navigation]);

  const handleSelectTemple = useCallback(() => {
    // 사찰 선택 화면으로 이동
    Alert.alert('준비 중', '사찰 선택 기능은 곧 제공될 예정입니다.');
  }, []);

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 5: return '최고예요!';
      case 4: return '좋아요!';
      case 3: return '괜찮아요';
      case 2: return '별로예요';
      case 1: return '최악이에요';
      default: return '';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-white border-b border-stone-200">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full justify-center items-center mr-3"
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back" size={24} color="#4A5D23" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-sage-600 flex-1">
          {mode === 'create' ? '리뷰 쓰기' : '리뷰 수정'}
        </Text>
        <TouchableOpacity 
          className="px-4 py-2 bg-sage-600 rounded-lg"
          onPress={handleSubmit}
        >
          <Text className="text-white font-semibold text-sm">
            {mode === 'create' ? '등록' : '수정'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5 py-4">
        {/* 사찰 선택 */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-stone-200">
          <Text className="text-base font-semibold text-neutral-900 mb-3">사찰 선택</Text>
          <TouchableOpacity 
            className="flex-row justify-between items-center py-3 px-4 bg-stone-100 rounded-xl"
            onPress={handleSelectTemple}
          >
            <Text className={`text-base ${
              selectedTemple === '사찰 선택' ? 'text-neutral-500' : 'text-neutral-900'
            }`}>
              {selectedTemple}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 평점 */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-stone-200">
          <Text className="text-base font-semibold text-neutral-900 mb-3">평점</Text>
          
          <View className="items-center">
            <View className="flex-row mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity 
                  key={star}
                  onPress={() => handleRatingPress(star)}
                  className="mx-2"
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={32}
                    color={star <= rating ? "#FFA500" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text className="text-lg font-semibold text-sage-600">
              {getRatingText(rating)}
            </Text>
          </View>
        </View>

        {/* 리뷰 내용 */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-stone-200">
          <Text className="text-base font-semibold text-neutral-900 mb-3">리뷰 내용</Text>
          <TextInput
            className="bg-stone-100 rounded-xl p-4 text-base text-neutral-900"
            placeholder="이 사찰에서의 경험을 자세히 알려주세요..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            maxLength={500}
          />
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-sm text-neutral-500">최소 10자 이상 작성해주세요</Text>
            <Text className="text-sm text-neutral-500">{content.length}/500</Text>
          </View>
        </View>

        {/* 사진 첨부 */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-stone-200">
          <Text className="text-base font-semibold text-neutral-900 mb-3">사진 첨부</Text>
          <TouchableOpacity className="flex-row items-center justify-center py-6 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300">
            <Ionicons name="camera-outline" size={32} color="#6B7280" />
            <Text className="text-base text-neutral-600 ml-2">사진 추가하기</Text>
          </TouchableOpacity>
          <Text className="text-sm text-neutral-500 mt-2">최대 5장까지 첨부 가능합니다</Text>
        </View>

        {/* 추천 여부 */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-stone-200">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-base font-semibold text-neutral-900">이 사찰을 추천하시나요?</Text>
              <Text className="text-sm text-neutral-600 mt-1">다른 사용자들에게 도움이 됩니다</Text>
            </View>
            <TouchableOpacity
              className={`w-12 h-7 rounded-full ${
                isRecommended ? 'bg-sage-600' : 'bg-stone-300'
              } justify-center`}
              onPress={() => setIsRecommended(!isRecommended)}
            >
              <View className={`w-5 h-5 rounded-full bg-white ${
                isRecommended ? 'self-end mr-1' : 'self-start ml-1'
              }`} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 작성 가이드 */}
        <View className="bg-sage-50 rounded-2xl p-4 border border-sage-200">
          <Text className="text-base font-semibold text-sage-700 mb-2">리뷰 작성 가이드</Text>
          <Text className="text-sm text-sage-600">
            • 방문하신 사찰의 분위기와 경험을 솔직하게 작성해주세요{'\n'}
                            • Please include information about the temple stay program or facilities{'\n'}
            • 다른 방문자들에게 도움이 되는 팁을 공유해주세요{'\n'}
            • 부적절한 내용은 삭제될 수 있습니다
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WriteReviewScreen;