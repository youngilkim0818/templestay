import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useReservationStore from '../../../store/reservationStore';
import useTempleStore from '../../../store/templeStore';

const CommonListScreen = ({ navigation, route }: any) => {
  const initialTab = route.params?.initialTab || 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // 새로운 리뷰가 전달되었는지 확인
  useEffect(() => {
    if (route.params?.newReview) {
      const newReview = route.params.newReview;
      setMyReviews(prevReviews => [newReview, ...prevReviews]);
      setActiveTab(2); // My Reviews 탭으로 이동
      
      // 파라미터 초기화
      navigation.setParams({ newReview: undefined });
    }
  }, [route.params?.newReview]);
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);
  const [showDeleteReviewModal, setShowDeleteReviewModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  // 스토어 연결
  const { reservations, cancelReservation } = useReservationStore();
  const { favoriteTemples, toggleFavorite, isFavorite } = useTempleStore();
  
  // 스토어의 예약 데이터를 CommonListScreen 형식으로 변환
  const reservationHistory = reservations.map(reservation => {
    const reservationDate = new Date(reservation.reservation_date || '');
    const currentDate = new Date();
    
    // 체험 날짜가 지났으면 'Completed', 아니면 'Upcoming'
    let status = 'Unknown';
    if (reservation.status === 'confirmed') {
      status = reservationDate < currentDate ? 'Completed' : 'Upcoming';
    } else if (reservation.status === 'cancelled') {
      status = 'Cancelled';
    } else if (reservation.status === 'pending') {
      status = 'Pending';
    }
    
    return {
      id: reservation.id,
      templeName: reservation.temple_name || 'Unknown Temple',
      date: reservation.reservation_date || 'Unknown Date',
      participants: reservation.participants || { adults: 0, teenagers: 0, children: 0, preschool: 0 },
      status: status,
             programName: reservation.program_title || 'Temple Stay Program'
    };
  });

  // 실제 예약 데이터만 사용
  const allReservations = reservationHistory;

  // 탭 데이터
  const tabs = [
    { id: 0, title: 'Reservation History', icon: 'calendar-outline' },
    { id: 1, title: 'Favorite Temples', icon: 'heart-outline' },
    { id: 2, title: 'My Reviews', icon: 'star-outline' }
  ];

  // 내가 쓴 리뷰 데이터
  const [myReviews, setMyReviews] = useState<any[]>([]);

  const renderContent = () => {
    switch (activeTab) {
             case 0: // 예약 히스토리
         if (allReservations.length === 0) {
           return (
             <View className="items-center justify-center py-10">
               <Ionicons name="document-text-outline" size={40} color="#A8A29E" />
               <Text className="text-neutral-500 mt-4">No reservation history</Text>
             </View>
           );
         }
         return (
           <View className="px-4">
             {allReservations.map((reservation) => (
              <View key={reservation.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
                                 <TouchableOpacity
                   onPress={() => {
                     if (reservation.status === 'Upcoming') {
                       setSelectedReservation(selectedReservation === reservation.id ? null : reservation.id);
                     } else if (reservation.status === 'Completed') {
                       setSelectedReservation(selectedReservation === reservation.id ? null : reservation.id);
                     }
                   }}
                   activeOpacity={0.7}
                 >
                  <View className="flex-row justify-between items-start mb-2">
                    {reservation.templeName && (
                      <Text className="text-lg font-semibold text-neutral-900">{reservation.templeName}</Text>
                    )}
                    <View className={`px-3 py-1 rounded-full ${
                      reservation.status === 'Completed' ? 'bg-green-100' :
                      reservation.status === 'Upcoming' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <Text className={`text-sm font-medium ${
                        reservation.status === 'Completed' ? 'text-green-700' :
                        reservation.status === 'Upcoming' ? 'text-blue-700' : 'text-red-700'
                      }`}>
                        {reservation.status}
                      </Text>
                    </View>
                  </View>
                  <View className="mb-2">
                    <Text className="text-sm text-neutral-600">
                      Program: {reservation.programName || 'Temple Stay Program'}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {reservation.date && (
                      <Text className="text-sm text-neutral-600">Date: {reservation.date}</Text>
                    )}
                    {reservation.participants && (
                      <Text className="text-sm text-neutral-600 ml-4">
                        Total: {reservation.participants.adults + reservation.participants.teenagers + reservation.participants.children + reservation.participants.preschool} people
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {reservation.status === 'Upcoming' && selectedReservation === reservation.id && (
                  <View className="mt-3 pt-3 border-t border-gray-200">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-neutral-600 flex-1 mr-3">
                        Please check the cancellation policy before canceling your reservation.
                      </Text>
                                             <TouchableOpacity
                         className="bg-red-500 py-2 px-4 rounded-2xl"
                         onPress={() => {
                           setReservationToCancel(reservation.id);
                           setShowCancelModal(true);
                         }}
                       >
                         <Text className="text-white font-medium text-base">Cancel Reservation</Text>
                       </TouchableOpacity>
                    </View>
                  </View>
                )}

                                 {reservation.status === 'Completed' && selectedReservation === reservation.id && (
                   <View className="mt-3 pt-3 border-t border-gray-200">
                     <View className="flex-row items-center justify-between">
                       <Text className="text-sm text-neutral-600 flex-1 mr-3">
                         Experience completed! Please write a review.
                       </Text>
                                               <TouchableOpacity
                          className="bg-green-200 py-2 px-4 rounded-2xl"
                          onPress={() => {
                            // 후기 작성 화면으로 이동
                            navigation.navigate('WriteReview', { 
                              templeId: reservation.id,
                              templeName: reservation.templeName,
                              reservationDate: reservation.date,
                              programName: reservation.programName || 'Temple Stay Program'
                            });
                          }}
                        >
                          <Text className="text-green-700 font-medium text-sm">Write Review</Text>
                        </TouchableOpacity>
                     </View>
                   </View>
                 )}
              </View>
            ))}
          </View>
        );

      case 1: // 찜한 템플
        if (favoriteTemples.length === 0) {
          return (
            <View className="items-center justify-center py-10">
              <Ionicons name="heart-outline" size={40} color="#A8A29E" />
              <Text className="text-neutral-500 mt-4">No favorite temples yet</Text>
            </View>
          );
        }
        return (
          <View className="px-4">
            {favoriteTemples.map((temple) => (
              <View key={temple.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
                                 <TouchableOpacity
                   onPress={() => navigation.navigate('TempleStack', { 
                     screen: 'TempleDetail', 
                     params: { templeId: temple.id } 
                   })}
                   activeOpacity={0.7}
                 >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-semibold text-neutral-900">{temple.name}</Text>
                    <TouchableOpacity
                      className="w-8 h-8 border border-gray-300 rounded-full items-center justify-center"
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleFavorite(temple);
                      }}
                    >
                      <Ionicons
                        name={isFavorite(temple.id) ? "heart" : "heart-outline"}
                        size={16}
                        color={isFavorite(temple.id) ? "#EF4444" : "#9CA3AF"}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-sm text-neutral-600">{temple.region}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

             case 2: // 내가 쓴 리뷰
         if (myReviews.length === 0) {
             return (
               <View className="items-center justify-center py-10">
                 <Ionicons name="star-outline" size={40} color="#A8A29E" />
                 <Text className="text-neutral-500 mt-4">No reviews written yet</Text>
               </View>
             );
         }
         return (
           <View className="px-4">
             {myReviews.map((review) => (
                               <View key={review.id} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-semibold text-neutral-900">{review.templeName}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={16} color="#F59E0B" />
                      <Text className="text-sm text-neutral-600 ml-1">{review.rating}</Text>
                    </View>
                  </View>
                  <Text className="text-sm text-neutral-700 mb-2">{review.comment}</Text>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-neutral-500">Date: {review.date}</Text>
                                          <TouchableOpacity
                        className="p-1"
                        onPress={() => {
                          setReviewToDelete(review.id);
                          setShowDeleteReviewModal(true);
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                  </View>
                </View>
             ))}
           </View>
         );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-stone-100">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1A1B1F" />
        </TouchableOpacity>
                 <Text className="text-3xl font-bold text-neutral-800 ml-1">
           My Activity
         </Text>
        <View className="w-6" />
      </View>

      {/* Tab Buttons */}
      <View className="px-4 py-4">
                 <View className="flex-row bg-white rounded-3xl p-2 border border-gray-200">
           {tabs.map((tab) => (
                          <TouchableOpacity
                key={tab.id}
                                 className={`flex-1 flex-row items-center justify-center py-3 px-2 rounded-3xl ${
                   activeTab === tab.id ? 'bg-sage-600' : 'bg-transparent'
                 }`}
                onPress={() => setActiveTab(tab.id)}
              >
               <Text className={`text-sm font-medium ${
                 activeTab === tab.id ? 'text-white' : 'text-neutral-600'
               }`}>
                 {tab.title}
               </Text>
             </TouchableOpacity>
          ))}
        </View>
      </View>

             {/* Content */}
       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
         {renderContent()}
         <View className="h-20" />
       </ScrollView>

                       {/* Custom Cancel Modal */}
         {showCancelModal && (
           <View className="absolute inset-0 flex-1 justify-center items-center">
                                                                                                        <View className="bg-white rounded-3xl p-6 mx-12 max-w-xs shadow-2xl border border-stone-200">
                            <Text className="text-xl font-semibold text-sage-800 text-center mb-4">
                 Cancel Reservation
               </Text>
                              <View className="w-60 h-0.5 bg-sage-300 self-center mb-4" />
                              <Text className="text-base text-stone-700 text-center mb-6">
                 Are you sure you want to cancel{'\n'}this reservation?
               </Text>
                            <View className="flex-row justify-center">
                 <TouchableOpacity 
                   className="bg-sage-600 py-2 px-6 rounded-2xl w-24"
                   onPress={() => {
                     setShowCancelModal(false);
                     setReservationToCancel(null);
                   }}
                 >
                   <Text className="text-white font-medium text-center">No</Text>
                 </TouchableOpacity>
                                 <TouchableOpacity 
                   className="bg-red-500 py-2 px-6 rounded-3xl ml-6 w-24"
                   onPress={() => {
                     // 예약 취소 로직
                     if (reservationToCancel) {
                       cancelReservation(reservationToCancel);
                       // 모달 닫기
                       setShowCancelModal(false);
                       setReservationToCancel(null);
                       setSelectedReservation(null);
                     }
                   }}
                 >
                   <Text className="text-white font-medium text-center">Cancel</Text>
                 </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Custom Delete Review Modal */}
        {showDeleteReviewModal && (
          <View className="absolute inset-0 flex-1 justify-center items-center">
            <View className="bg-white rounded-3xl p-6 mx-12 max-w-xs shadow-2xl border border-stone-200">
              <Text className="text-xl font-semibold text-sage-800 text-center mb-4">
                Delete Review
              </Text>
              <View className="w-60 h-0.5 bg-sage-300 self-center mb-4" />
              <Text className="text-base text-stone-700 text-center mb-6">
                Are you sure you want to{'\n'}delete this review?
              </Text>
              <View className="flex-row justify-center">
                <TouchableOpacity 
                  className="bg-sage-600 py-2 px-6 rounded-2xl w-24"
                  onPress={() => {
                    setShowDeleteReviewModal(false);
                    setReviewToDelete(null);
                  }}
                >
                  <Text className="text-white font-medium text-center">No</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-red-500 py-2 px-6 rounded-3xl ml-6 w-24"
                  onPress={() => {
                    // 리뷰 삭제 로직
                    if (reviewToDelete) {
                      setMyReviews(prevReviews => 
                        prevReviews.filter(r => r.id !== reviewToDelete)
                      );
                      // 모달 닫기
                      setShowDeleteReviewModal(false);
                      setReviewToDelete(null);
                    }
                  }}
                >
                  <Text className="text-white font-medium text-center">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
    </SafeAreaView>
  );
};

export default CommonListScreen;
