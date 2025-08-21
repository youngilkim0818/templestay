import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const WriteReviewScreen = ({ navigation, route }: any) => {
  const { templeName, reservationDate, programName } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Notice', 'Please select a rating.');
      return;
    }
    if (comment.trim().length === 0) {
      Alert.alert('Notice', 'Please write a review.');
      return;
    }

    // 리뷰 데이터 생성
    const newReview = {
      id: Date.now().toString(), // 임시 ID
      templeName: templeName,
      programName: programName || 'Temple Stay Program',
      rating: rating,
      comment: comment,
      date: new Date().toISOString().split('T')[0], // 오늘 날짜
      reservationDate: reservationDate
    };

    // TODO: 실제 후기 저장 로직 구현 (API 호출 등)
    
    setShowSuccessModal(true);
    
    // 1초 후 마이 리뷰 페이지로 이동
    setTimeout(() => {
      setShowSuccessModal(false);
      navigation.navigate('CommonList', { 
        initialTab: 2, // My Reviews 탭
        newReview: newReview 
      });
    }, 1000);
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          className="mr-2"
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#F59E0B" : "#D1D5DB"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-stone-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-neutral-800 ml-1">
          Write Review
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="h-8" />
        {/* Temple Info */}
        <View className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
          <View className="mb-3">
            <Text className="text-lg font-semibold text-neutral-900">
              {templeName}
            </Text>
          </View>
                     <View className="mb-3">
             <Text className="text-base font-semibold text-neutral-900">
               {programName || 'Temple Stay Program'}
             </Text>
           </View>
          <View>
            <Text className="text-base text-neutral-600">
              Experience Date: {reservationDate}
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
          <Text className="text-lg font-semibold text-neutral-900 mb-3">
            Rate Your Experience
          </Text>
          <View className="flex-row justify-center">
            {renderStars()}
          </View>
        </View>

        {/* Comment Section */}
        <View className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
          <Text className="text-lg font-semibold text-neutral-900 mb-4">
            Share Your Experience
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl p-4 text-base text-neutral-900 min-h-32"
            placeholder="Tell us about your temple stay experience..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
          />
          <Text className="text-sm text-neutral-500 mt-2 text-right">
            {comment.length}/500 characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-sage-600 py-4 rounded-3xl mb-8"
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-semibold text-center">
            Submit Review
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      {showSuccessModal && (
        <View className="absolute inset-0 flex-1 justify-center items-center">
          <View className="bg-white rounded-3xl p-6 mx-12 max-w-xs shadow-2xl border border-stone-200">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark" size={32} color="#059669" />
              </View>
              <Text className="text-xl font-semibold text-neutral-900 text-center">
                Review Submitted!
              </Text>
            </View>
                         <Text className="text-base text-neutral-600 text-center mb-6">
               Thank you for sharing your experience
             </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default WriteReviewScreen;