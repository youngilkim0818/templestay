import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const WriteReviewScreen = ({ navigation, route }: any) => {
  const { templeName, reservationDate, programName } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 화면 크기 기반 반응형 스타일
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenHeight < 700;
  const isLargeScreen = screenHeight > 800;
  
  // 동적 크기 계산
  const headerFontSize = isSmallScreen ? 18 : (isLargeScreen ? 24 : 20);
  const cardPadding = isSmallScreen ? 12 : (isLargeScreen ? 18 : 16);
  const cardMargin = isSmallScreen ? 12 : (isLargeScreen ? 20 : 16);
  const titleFontSize = isSmallScreen ? 14 : (isLargeScreen ? 18 : 16);
  const textFontSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
  const starSize = isSmallScreen ? 24 : (isLargeScreen ? 36 : 32);
  const buttonPadding = isSmallScreen ? 12 : (isLargeScreen ? 18 : 16);
  const inputMinHeight = isSmallScreen ? 100 : (isLargeScreen ? 140 : 120);

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
          style={{ marginRight: isSmallScreen ? 6 : 8 }}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={starSize}
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
          <Ionicons name="arrow-back" size={isSmallScreen ? 20 : (isLargeScreen ? 28 : 24)} color="#1A1B1F" />
        </TouchableOpacity>
        <Text style={{ fontSize: headerFontSize, fontWeight: 'bold', color: '#1F2937', marginLeft: 4 }}>
          Write Review
        </Text>
        <View style={{ width: isSmallScreen ? 20 : (isLargeScreen ? 28 : 24) }} />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <View className="h-8" />
        {/* Temple Info */}
        <View className="bg-white rounded-xl border border-gray-200" style={{ padding: cardPadding, marginBottom: cardMargin }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: titleFontSize, fontWeight: '600', color: '#111827' }}>
              {templeName}
            </Text>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: textFontSize, fontWeight: '600', color: '#111827' }}>
              {programName || 'Temple Stay Program'}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: textFontSize, color: '#4B5563' }}>
              Experience Date: {reservationDate}
            </Text>
          </View>
        </View>

        {/* Rating Section */}
        <View className="bg-white rounded-xl border border-gray-200" style={{ padding: cardPadding, marginBottom: cardMargin }}>
          <Text style={{ fontSize: titleFontSize, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
            Rate Your Experience
          </Text>
          <View className="flex-row justify-center">
            {renderStars()}
          </View>
        </View>

        {/* Comment Section */}
        <View className="bg-white rounded-xl border border-gray-200" style={{ padding: cardPadding, marginBottom: cardMargin }}>
          <Text style={{ fontSize: titleFontSize, fontWeight: '600', color: '#111827', marginBottom: 16 }}>
            Share Your Experience
          </Text>
          <TextInput
            className="border border-gray-300 rounded-xl text-neutral-900"
            style={{ 
              padding: cardPadding, 
              fontSize: textFontSize, 
              minHeight: inputMinHeight,
              textAlignVertical: 'top'
            }}
            placeholder="Tell us about your temple stay experience..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
          />
          <Text style={{ fontSize: isSmallScreen ? 9 : 11, color: '#6B7280', marginTop: 8, textAlign: 'right' }}>
            {comment.length}/500 characters
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="bg-sage-600 rounded-3xl"
          style={{ paddingVertical: buttonPadding, marginBottom: isSmallScreen ? 24 : 32 }}
          onPress={handleSubmit}
        >
          <Text style={{ color: 'white', fontSize: titleFontSize, fontWeight: '600', textAlign: 'center' }}>
            Submit Review
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      {showSuccessModal && (
        <View className="absolute inset-0 flex-1 justify-center items-center">
          <View className="bg-white rounded-3xl shadow-2xl border border-stone-200" style={{ padding: cardPadding, marginHorizontal: 48, maxWidth: 320 }}>
            <View className="items-center" style={{ marginBottom: 16 }}>
              <View className="bg-green-100 rounded-full items-center justify-center" style={{ 
                width: isSmallScreen ? 48 : 64, 
                height: isSmallScreen ? 48 : 64, 
                marginBottom: 12 
              }}>
                <Ionicons name="checkmark" size={isSmallScreen ? 24 : 32} color="#059669" />
              </View>
              <Text style={{ fontSize: titleFontSize, fontWeight: '600', color: '#111827', textAlign: 'center' }}>
                Review Submitted!
              </Text>
            </View>
            <Text style={{ fontSize: textFontSize, color: '#4B5563', textAlign: 'center', marginBottom: 24 }}>
              Thank you for sharing your experience
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default WriteReviewScreen;