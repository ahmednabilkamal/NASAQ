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
import { scale, scaleVertical } from '@/utils/responsive';
import { Spacing, BorderRadius, IconSizes } from '@/utils/spacing';
import { FontSizes, LineHeights } from '@/utils/typography';
import { InputSizes, ButtonSizes } from '@/utils/spacing';

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
          <Text style={styles.nextIcon}>›</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.verticalSm,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeIcon: {
    fontSize: FontSizes.h4,
    color: '#333',
    fontWeight: '600',
  },
  headerDots: {
    fontSize: FontSizes.body,
    color: '#999',
    letterSpacing: 2,
  },
  nextIcon: {
    fontSize: FontSizes.h4,
    color: '#333',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingBottom: scaleVertical(100),
  },
  titleSection: {
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.verticalMd,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  mainTitle: {
    fontSize: FontSizes.h4,
    fontWeight: '600',
    color: '#333',
    marginBottom: Spacing.verticalXs,
  },
  description: {
    fontSize: FontSizes.bodySmall,
    color: '#666',
    lineHeight: LineHeights.bodySmall,
  },
  imageGallery: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.verticalSm,
    backgroundColor: '#FFF',
  },
  galleryImage: {
    width: (width - scale(60)) / 3,
    height: (width - scale(60)) / 3,
    borderRadius: BorderRadius.sm,
  },
  sectionsContainer: {
    backgroundColor: '#FFF',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.verticalMd,
  },
  sectionTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    fontSize: FontSizes.caption,
    color: '#999',
  },
  sectionContent: {
    paddingBottom: Spacing.verticalSm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.verticalXs,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#F9F9F9',
    marginBottom: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  itemText: {
    fontSize: FontSizes.bodySmall,
    color: '#333',
  },
  checkbox: {
    width: scale(18),
    height: scale(18),
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: BorderRadius.xs,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.verticalSm,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  actionButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: Spacing.verticalMd,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
});

export default FilterModalScreen;
