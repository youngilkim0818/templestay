import React, { useState, useCallback, useMemo, memo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions, FlatList, Alert, Animated, Modal } from 'react-native';
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
  { id: 'goods', icon: 'bag-outline' },
  { id: 'food', icon: 'restaurant-outline' },
  { id: 'books', icon: 'book-outline' },
];

// Product data with translation keys
const getProductData = (t: any) => [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
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
    id: 6,
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
    id: 7,
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
    id: 8,
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('popular');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [showModal, setShowModal] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_H = 120; // 헤더 높이

  // 화면 크기 기반 반응형 스타일
  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenHeight < 700;
  const isLargeScreen = screenHeight > 800;
  
  // 동적 크기 계산 (전체적으로 크기 축소)
  const headerFontSize = isSmallScreen ? 20 : (isLargeScreen ? 26 : 22);
  const categoryPadding = isSmallScreen ? 6 : (isLargeScreen ? 10 : 8);
  const categoryFontSize = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
  const categoryIconSize = isSmallScreen ? 12 : (isLargeScreen ? 16 : 14);
  const productImageHeight = isSmallScreen ? 80 : (isLargeScreen ? 120 : 100);
  const productPadding = isSmallScreen ? 6 : (isLargeScreen ? 10 : 8);
  const productTitleSize = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
  const productPriceSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
  const sortIconSize = isSmallScreen ? 10 : (isLargeScreen ? 14 : 12);
  const sortFontSize = isSmallScreen ? 8 : (isLargeScreen ? 12 : 10);
  
  const products = getProductData(t);
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = getProductData(t).filter(product => 
      selectedCategory === 'all' || product.category === selectedCategory
    );

    // Sort based on selected sort option
    if (selectedSort === 'price') {
      // Sort by price (low to high)
      filtered.sort((a, b) => a.price - b.price);
    } else {
      // Sort by popularity (review count and rating)
      filtered.sort((a, b) => {
        const popularityA = (a.reviewCount * a.rating);
        const popularityB = (b.reviewCount * b.rating);
        return popularityB - popularityA; // High to low
      });
    }

    return filtered;
  }, [selectedCategory, selectedSort, t]);

  // 찜하기 추가/제거
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const renderCategory = useCallback(({ item }: { item: typeof CATEGORIES[0] }) => {
    return (
      <TouchableOpacity
        className={`flex-row items-center rounded-3xl border ${
          selectedCategory === item.id 
            ? 'bg-sage-600 border-sage-600' 
            : 'bg-white border-stone-200 active:bg-stone-50'
        }`}
        style={{ 
          paddingHorizontal: categoryPadding + 4, 
          paddingVertical: categoryPadding - 2, 
          marginRight: 8 
        }}
        onPress={() => setSelectedCategory(item.id)}
        activeOpacity={1}
      >
        <Ionicons 
          name={item.icon as any} 
          size={categoryIconSize} 
          color={selectedCategory === item.id ? 'white' : COLORS.neutral[600]} 
        />
        <Text style={{ 
          marginLeft: 6, 
          fontSize: categoryFontSize, 
          fontWeight: '500',
          color: selectedCategory === item.id ? 'white' : '#4B5563'
        }}>
          {getCategoryName(t, item.id)}
        </Text>
      </TouchableOpacity>
    );
  }, [selectedCategory, t, categoryPadding, categoryFontSize, categoryIconSize]);

  const handleProductPress = useCallback((product: ReturnType<typeof getProductData>[0]) => {
    setShowModal(true);
  }, []);

  const renderProduct = useCallback(({ item }: { item: ReturnType<typeof getProductData>[0] }) => {
    return (
      <TouchableOpacity 
        className="bg-white rounded-xl overflow-hidden border border-stone-100"
        onPress={() => handleProductPress(item)}
        activeOpacity={1}
      >
        {/* Product Image */}
        <View className="relative" style={{ padding: productPadding }}>
          <Image 
            source={item.image}
            className="w-full rounded-lg"
            style={{ height: productImageHeight }}
            resizeMode="cover"
          />
        </View>
        
        {/* Product Info */}
        <View style={{ padding: productPadding }}>
          <Text style={{ 
            fontSize: productTitleSize, 
            color: '#111827', 
            marginBottom: 8,
            lineHeight: productTitleSize * 1.2
          }} numberOfLines={2}>
            {t(item.nameKey)}
          </Text>
          
          {/* Price */}
          <Text style={{ 
            fontSize: productPriceSize, 
            fontWeight: 'bold', 
            color: '#111827' 
          }}>
            ₩{item.price.toLocaleString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleProductPress, t, productPadding, productImageHeight, productTitleSize, productPriceSize]);

  return (
    <SafeAreaView className="flex-1 bg-stone-100">
      {/* Header */}
      <View className="px-5 py-4 bg-stone-100">
        <Text style={{ fontSize: headerFontSize, fontWeight: 'bold', color: '#1F2937', marginLeft: 4 }}>
          Temple Market
        </Text>
      </View>
      
      {/* Controls */}
      <View className="px-6 py-3 bg-stone-100">
        <View className="bg-white rounded-4xl border border-stone-200" style={{ padding: isSmallScreen ? 8 : 12 }}>
          <View className="flex-row items-center justify-center">
            {/* Category Filter */}
            {CATEGORIES.map((item) => (
              <View key={item.id} className="mr-0">
                {renderCategory({ item })}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Product List with Beige Section */}
      <View className="flex-1 bg-[#F5F1EB] rounded-t-[30px] px-3 pt-0">
        {/* Sort Filter in Beige Section */}
        <View className="flex-row items-center justify-end px-2" style={{ paddingTop: 4, paddingBottom: 16 }}>
          <TouchableOpacity 
            className="flex-row items-center"
            style={{ paddingHorizontal: 8, paddingVertical: 4 }}
            onPress={() => setSelectedSort(selectedSort === 'popular' ? 'price' : 'popular')}
            activeOpacity={1}
          >
            <Ionicons 
              name={selectedSort === 'popular' ? "trending-up-outline" : "pricetag-outline"} 
              size={sortIconSize} 
              color="#6B7280" 
            />
            <Text style={{ 
              fontSize: sortFontSize + 2, 
              color: '#4B5563', 
              marginLeft: 4, 
              fontWeight: 'bold' 
            }}>
              {selectedSort === 'popular' ? 'Popular' : 'Price'}
            </Text>
            <Ionicons 
              name="chevron-down-outline" 
              size={16} 
              color="#6B7280" 
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={filteredAndSortedProducts}
          renderItem={({ item }) => (
            <View className="w-1/2 px-1 mb-3">
              {renderProduct({ item })}
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View className="items-center justify-center" style={{ paddingVertical: isSmallScreen ? 32 : 40 }}>
              <Text style={{ fontSize: sortFontSize, color: '#6B7280' }}>No products available</Text>
            </View>
          }
        />
      </View>

      {/* Custom Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 justify-center items-center">
          <View className="bg-white rounded-2xl shadow-lg" style={{ 
            padding: productPadding * 3, 
            marginHorizontal: 20, 
            maxWidth: 380 
          }}>
            <View className="items-center" style={{ marginBottom: 16 }}>
              <View className="bg-red-100 rounded-full items-center justify-center" style={{ 
                width: isSmallScreen ? 56 : 72, 
                height: isSmallScreen ? 56 : 72, 
                marginBottom: 16 
              }}>
                <Ionicons name="ban-outline" size={isSmallScreen ? 28 : 36} color="#ef4444" />
              </View>
              <Text style={{ 
                fontSize: productTitleSize + 2, 
                fontWeight: 'bold', 
                color: '#1F2937', 
                marginBottom: 12 
              }}>
                Currently out of stock
              </Text>
            </View>
            
            <TouchableOpacity
              className="bg-gray-400 rounded-xl items-center"
              style={{ paddingVertical: productPadding + 4 }}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ 
                color: 'white', 
                fontWeight: '600', 
                fontSize: productTitleSize + 1 
              }}>
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MarketScreen; 
