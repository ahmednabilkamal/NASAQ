import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getForwardChevron } from '@/config/directionalIcons';

const { width } = Dimensions.get('window');

const FilterModalScreen = () => {
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    section1: false,
    section2: false,
    section3: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filterSections = [
    {
      id: 'section1',
      title: 'الفئات',
      items: ['الفئة الأولى', 'اللغة المحددة', 'النص هنا', 'النص هنا'],
    },
    {
      id: 'section2',
      title: 'الحجم الثانية',
      items: ['الحجم الأول', 'اللغة المحددة', 'النص هنا', 'النص هنا'],
    },
    {
      id: 'section3',
      title: 'الفئة الثالثة',
      items: ['الفئة الأولى', 'اللغة المحددة', 'النص هنا', 'النص هنا'],
    },
  ];

  const images = [
    require('../../assets/mirroimagewomen.png'),
    require('../../assets/stylewomen1.png'),
    require('../../assets/stylewomen2.png'),
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerDots}>━ ━</Text>
        <TouchableOpacity onPress={() => router.push('/pages/filter_modal_2')}>
          <Ionicons name={getForwardChevron()} size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            {expandedSections.section1 ? 'طقم ملابس وإكسسوارات' : 'صغيرة ومتنوعة'}
          </Text>
          <Text style={styles.description}>
            {expandedSections.section1 
              ? 'أضف جسوب اكثر وتصرف واريح على أنواع مختلفة من الملابس الصيفية'
              : 'قطع صغيرة متنوعة تضيف جمال خاص وتتناسب مع جميع الأذواق والأطقام'}
          </Text>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {images.map((image, index) => (
            <Image
              key={index}
              source={image}
              style={styles.galleryImage}
            />
          ))}
        </View>

        {/* Filter Sections */}
        <View style={styles.sectionsContainer}>
          {filterSections.map((section) => (
            <View key={section.id} style={styles.filterSection}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggleSection(section.id)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.expandIcon}>
                  {expandedSections[section.id] ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {expandedSections[section.id] && (
                <View style={styles.sectionContent}>
                  {section.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemText}>{item}</Text>
                      <View style={styles.checkbox} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/pages/filter_modal_2')}>
          <Text style={styles.actionButtonText}>اضف واحد منهم</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeIcon: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  headerDots: {
    fontSize: 14,
    color: '#999',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  titleSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  imageGallery: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  galleryImage: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    borderRadius: 8,
  },
  sectionsContainer: {
    backgroundColor: '#FFF',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    fontSize: 12,
    color: '#999',
  },
  sectionContent: {
    paddingBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    marginBottom: 6,
    borderRadius: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#333',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FilterModalScreen;
