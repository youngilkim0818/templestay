import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../../../store/userStore';

// 임시 리뷰 데이터
const MY_REVIEWS = [
  {
    id: '1',
    templeId: '1',
    templeName: '불국사',
    location: '경주시 진현동',
    visitDate: '2024-12-15',
    rating: 5,
    content: '정말 아름다운 사찰이었습니다. 템플스테이 프로그램도 알차고 스님들이 친절하셨어요. 특히 새벽 예불 시간이 인상 깊었습니다.',
    images: ['image1.jpg', 'image2.jpg'],
    likes: 12,
    isRecommended: true,
  },
  {
    id: '2',
    templeId: '2',
    templeName: '석굴암',
    location: '경주시 진현동',
    visitDate: '2024-11-28',
    rating: 4,
    content: '일출이 정말 장관이었습니다. 다만 사람이 너무 많아서 조용한 명상은 어려웠어요.',
    images: ['image3.jpg'],
    likes: 8,
    isRecommended: true,
  },
  {
    id: '3',
    templeId: '3',
    templeName: '해인사',
    location: '합천군 가야면',
    visitDate: '2024-10-10',
    rating: 5,
    content: '대장경 보관고를 직접 볼 수 있어서 감동이었습니다. 역사의 무게감을 느낄 수 있었어요.',
    images: [],
    likes: 15,
    isRecommended: true,
  },
];

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={16}
          color={star <= rating ? "#FFA500" : "#D1D5DB"}
        />
      ))}
    </View>
  );
};

const ReviewCard = ({ review, onEdit, onDelete, onPress }: any) => {
  return (
    <TouchableOpacity 
      className="bg-white rounded-2xl p-4 mb-4 border border-stone-200"
      onPress={onPress}
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-neutral-900">{review.templeName}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text className="text-sm text-neutral-600 ml-1">{review.location}</Text>
          </View>
        </View>
        <View className="items-end">
          <StarRating rating={review.rating} />
          <Text className="text-xs text-neutral-500 mt-1">{review.visitDate}</Text>
        </View>
      </View>

      {/* Content */}
      <Text 
        className="text-sm text-neutral-700 mb-3" 
        numberOfLines={3}
      >
        {review.content}
      </Text>

      {/* Images indicator */}
      {review.images.length > 0 && (
        <View className="flex-row items-center mb-3">
          <Ionicons name="image-outline" size={16} color="#6B7280" />
          <Text className="text-xs text-neutral-600 ml-1">사진 {review.images.length}장</Text>
        </View>
      )}

      {/* Footer */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-4">
            <Ionicons name="heart-outline" size={16} color="#6B7280" />
            <Text className="text-sm text-neutral-600 ml-1">{review.likes}</Text>
          </View>
          {review.isRecommended && (
            <View className="bg-sage-50 rounded-lg px-2 py-1 border border-sage-200">
              <Text className="text-xs text-sage-600 font-medium">추천</Text>
            </View>
          )}
        </View>
        
        <View className="flex-row">
          <TouchableOpacity 
            className="px-3 py-1 bg-stone-100 rounded-lg mr-2"
            onPress={() => onEdit(review)}
          >
            <Text className="text-sm text-neutral-600">수정</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="px-3 py-1 bg-coral-50 rounded-lg"
            onPress={() => onDelete(review.id)}
          >
            <Text className="text-sm text-coral-600">삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const MyReviewsScreen = ({ navigation }: any) => {
  const { user } = useUserStore();
  const [reviews, setReviews] = useState(MY_REVIEWS);
  const [filter, setFilter] = useState<'all' | 'recommended'>('all');

  const filteredReviews = reviews.filter(review => 
    filter === 'all' || (filter === 'recommended' && review.isRecommended)
  );

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleReviewPress = useCallback((review: any) => {
    navigation.navigate('ReviewDetail', { reviewId: review.id });
  }, [navigation]);

  const handleEditReview = useCallback((review: any) => {
    navigation.navigate('WriteReview', { 
      mode: 'edit', 
      reviewId: review.id,
      templeId: review.templeId,
      templeName: review.templeName 
    });
  }, [navigation]);

  const handleDeleteReview = useCallback((reviewId: string) => {
    Alert.alert(
      '리뷰 삭제',
      '정말 이 리뷰를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setReviews(prev => prev.filter(review => review.id !== reviewId));
          }
        }
      ]
    );
  }, []);

  const handleWriteReview = useCallback(() => {
    navigation.navigate('WriteReview', { mode: 'create' });
  }, [navigation]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

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
        <Text className="text-xl font-bold text-sage-600 flex-1">내 리뷰</Text>
        <TouchableOpacity 
          className="px-4 py-2 bg-sage-600 rounded-lg"
          onPress={handleWriteReview}
        >
          <Text className="text-white font-semibold text-sm">리뷰 쓰기</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View className="bg-white px-5 py-4 border-b border-stone-200">
        <View className="flex-row justify-between items-center">
          <View className="items-center">
            <Text className="text-2xl font-bold text-sage-600">{reviews.length}</Text>
            <Text className="text-sm text-neutral-600">작성한 리뷰</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <Text className="text-2xl font-bold text-sage-600 mr-1">{averageRating}</Text>
              <Ionicons name="star" size={20} color="#FFA500" />
            </View>
            <Text className="text-sm text-neutral-600">평균 평점</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-sage-600">
              {reviews.filter(r => r.isRecommended).length}
            </Text>
            <Text className="text-sm text-neutral-600">추천 리뷰</Text>
          </View>
        </View>
      </View>

      {/* Filter */}
      <View className="bg-white px-5 py-3 border-b border-stone-200">
        <View className="flex-row">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg mr-2 ${
              filter === 'all' ? 'bg-sage-600' : 'bg-stone-100'
            }`}
            onPress={() => setFilter('all')}
          >
            <Text className={`text-sm font-semibold ${
              filter === 'all' ? 'text-white' : 'text-neutral-600'
            }`}>
              전체 ({reviews.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              filter === 'recommended' ? 'bg-sage-600' : 'bg-stone-100'
            }`}
            onPress={() => setFilter('recommended')}
          >
            <Text className={`text-sm font-semibold ${
              filter === 'recommended' ? 'text-white' : 'text-neutral-600'
            }`}>
              추천 ({reviews.filter(r => r.isRecommended).length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-5 py-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              onPress={() => handleReviewPress(review)}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="star-outline" size={64} color="#6B7280" />
            <Text className="text-lg font-semibold text-neutral-900 mt-4 mb-2">
              {filter === 'all' ? '작성한 리뷰가 없습니다' : '추천 리뷰가 없습니다'}
            </Text>
            <Text className="text-sm text-neutral-600 text-center">
              {filter === 'all' 
                ? '첫 번째 리뷰를 작성해보세요!' 
                : '추천받은 리뷰가 없습니다.'
              }
            </Text>
            
            {filter === 'all' && (
              <TouchableOpacity 
                className="mt-6 px-6 py-3 bg-sage-600 rounded-xl"
                onPress={handleWriteReview}
              >
                <Text className="text-white font-semibold">리뷰 쓰기</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyReviewsScreen;