import React, { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { COLORS } from '../../constants/colors';
import Button from '../../components/common/Button';

// Styled components for NativeWind

const { width } = Dimensions.get('window');

// Market categories
const getCategoryName = (t: any, id: string) => {
  const categoryMap: { [key: string]: string } = {
    'all': t('market.categories.all'),
    'experience': t('market.categories.experience'),
    'goods': t('market.categories.goods'),
    'food': t('market.categories.food'),
    'books': t('market.categories.books')
  };
  return categoryMap[id] || id;
};

const CATEGORIES = [
  { id: 'all', icon: 'grid-outline' },
  { id: 'experience', icon: 'flower-outline' },
  { id: 'goods', icon: 'bag-outline' },
  { id: 'food', icon: 'restaurant-outline' },
  { id: 'books', icon: 'book-outline' },
];

// Product data with translation keys
const getProductData = (t: any) => [
  {
    id: 1,
    nameKey: 'market.products.templestayExperience',
    price: 120000,
    originalPrice: 150000,
    image: require('../../../assets/templestayExperience.jpg'),
    category: 'experience',
    rating: 4.8,
    reviewCount: 324,
    descriptionKey: 'market.products.templestayDescription',
    badgeKey: 'market.badges.popular'
  },
  {
    id: 2,
    nameKey: 'market.products.incenseSet',
    price: 45000,
    originalPrice: null,
    image: require('../../../assets/incenseSet.jpg'),
    category: 'goods',
    rating: 4.6,
    reviewCount: 89,
    descriptionKey: 'market.products.incenseDescription',
    badgeKey: null
  },
  {
    id: 3,
    nameKey: 'market.products.cookingClass',
    price: 80000,
    originalPrice: 100000,
    image: require('../../../assets/cookingClass.jpg'),
    category: 'experience',
    rating: 4.9,
    reviewCount: 156,
    descriptionKey: 'market.products.cookingDescription',
    badgeKey: 'market.badges.new'
  },
  {
    id: 4,
    nameKey: 'market.products.meditationCushion',
    price: 35000,
    originalPrice: null,
    image: require('../../../assets/meditationCushion.jpg'),
    category: 'goods',
    rating: 4.7,
    reviewCount: 267,
    descriptionKey: 'market.products.meditationDescription',
    badgeKey: null
  },
  {
    id: 5,
    nameKey: 'market.products.teaSet',
    price: 60000,
    originalPrice: 75000,
    image: require('../../../assets/teaSet.jpg'),
    category: 'food',
    rating: 4.5,
    reviewCount: 123,
    descriptionKey: 'market.products.teaDescription',
    badgeKey: null
  },
  {
    id: 6,
    nameKey: 'market.products.buddhismBook',
    price: 42000,
    originalPrice: 54000,
    image: require('../../../assets/buddhismBook.jpg'),
    category: 'books',
    rating: 4.8,
    reviewCount: 445,
    descriptionKey: 'market.products.bookDescription',
    badgeKey: 'market.badges.bestseller'
  },
  {
    id: 7,
    nameKey: 'meditationMusic',
    price: 25000,
    originalPrice: 30000,
    image: require('../../../assets/meditationMusic.jpg'),
    category: 'goods',
    rating: 4.9,
    reviewCount: 178,
    descriptionKey: 'Meditation music to find peace of mind',
    badgeKey: 'market.badges.new'
  },
  {
    id: 8,
    nameKey: 'buddhistClothing',
    price: 50000,
    originalPrice: null,
    image: require('../../../assets/buddhistClothing.jpg'),
    category: 'goods',
    rating: 4.7,
    reviewCount: 95,
    descriptionKey: 'a traditional temple robe set',
    badgeKey: null
  },
  {
    id: 9,
    nameKey: 'amulet',
    price: 10000,
    originalPrice: null,
    image: require('../../../assets/amulet.jpg'),
    category: 'goods',
    rating: 4.8,
    reviewCount: 156,
    descriptionKey: 'a traditional amulet for good luck and protection',
    badgeKey: 'market.badges.popular'
  },
  {
    id: 10,
    nameKey: 'prayerBeads',
    price: 40000,
    originalPrice: 50000,
    image: require('../../../assets/prayerBeads.jpg'),
    category: 'goods',
    rating: 4.9,
    reviewCount: 203,
    descriptionKey: 'Traditional temple beads set',
    badgeKey: 'market.badges.bestseller'
  }
];

const MarketScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  
  const products = getProductData(t);
  const filteredAndSortedProducts = (selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory)
  ).sort((a, b) => {
    if (sortBy === 'price') {
      return a.price - b.price;
    }
    return t(a.nameKey).localeCompare(t(b.nameKey));
  });


  // 찜하기 추가/제거
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);


  const renderCategory = useCallback(({ item }: { item: typeof CATEGORIES[0] }) => (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-2 mr-3 rounded-2xl border ${
        selectedCategory === item.id 
          ? 'bg-sage-600 border-sage-600' 
          : 'bg-white border-stone-200 active:bg-stone-50'
      }`}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={18} 
        color={selectedCategory === item.id ? 'white' : COLORS.neutral[600]} 
      />
      <Text className={`ml-2 text-sm font-medium ${
        selectedCategory === item.id ? 'text-white font-semibold' : 'text-neutral-600'
      }`}>
        {getCategoryName(t, item.id)}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory, t]);

  const handleProductPress = useCallback((product: ReturnType<typeof getProductData>[0]) => {
    Alert.alert(
      '서비스 준비 중',
      '상품 상세 페이지는 서비스 준비 중입니다.\n곧 만나보실 수 있습니다!',
      [{ text: '확인' }]
    );
  }, []);

  const renderProduct = useCallback(({ item }: { item: ReturnType<typeof getProductData>[0] }) => {
    return (
      <TouchableOpacity 
        className="bg-white mb-1 border-b border-stone-200 flex-row items-center p-6"
        onPress={() => handleProductPress(item)}
      >
        {/* Product Image */}
        <View className="w-32 h-32 bg-stone-100 rounded-xl overflow-hidden mr-5">
          <Image 
            source={item.image}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        
        {/* Product Info */}
        <View className="flex-1 justify-between" style={{ minHeight: 120 }}>
          <View>
            <Text className="text-lg font-bold text-neutral-900 mb-2">
              {t(item.nameKey)}
            </Text>
            
            <Text className="text-base text-neutral-600" numberOfLines={3}>
              {t(item.descriptionKey)}
            </Text>
          </View>
          
          {/* Price at bottom right */}
          <View className="self-end mt-3">
            <Text className="text-lg font-medium text-black">
              ₩{item.price.toLocaleString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleProductPress, t]);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header */}
      <View className="px-5 py-4 bg-white">
        <Text className="text-2xl font-bold text-sage-600 text-center">
          Temple Market
        </Text>
      </View>
      
      {/* Controls */}
      <View className="px-5 py-3 bg-white border-b border-stone-200">
        <View className="flex-row items-center justify-between">
          {/* Category Filter - Left */}
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-1 mr-4"
          />
          
          {/* Sort Button - Right */}
          <TouchableOpacity 
            className="flex-row items-center px-3 py-2 bg-sage-50 rounded-2xl border border-sage-200 active:bg-sage-100"
            onPress={() => setSortBy(sortBy === 'name' ? 'price' : 'name')}
          >
            <Ionicons name="swap-vertical" size={16} color="#4A5D23" />
            <Text className="text-sm font-medium text-sage-600 ml-1">
              {sortBy === 'name' ? '이름순' : '가격순'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredAndSortedProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      />
    </SafeAreaView>
  );
};

export default MarketScreen; 
