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
import { scale, scaleVertical, wp } from '@/utils/responsive';
import { Spacing, BorderRadius } from '@/utils/spacing';
import { FontSizes } from '@/utils/typography';

const { width } = Dimensions.get('window');

const OrderDetailsScreen = () => {
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  const measurements = [
    { label: 'الطول', value: '160 cm' },
    { label: 'الوزن', value: '65 kg' },
    { label: 'حجم الصدرية', value: 'M' },
    { label: 'الوسط', value: '160 cm' },
    { label: 'الطول', value: '160 cm' },
    { label: 'الطول', value: '92 cm' },
    { label: 'الطول', value: '70 cm' },
    { label: 'الطول', value: '50 cm' },
    { label: 'الطول', value: '98 cm' },
    { label: 'الطول', value: '56 cm' },
    { label: 'الطول', value: '38 cm' },
  ];

  const handleAddToOrder = () => {
    setShowError(!showError);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timeText}>9:41</Text>
        <View style={styles.statusBar}>
          <Text>📶</Text>
          <Text>📡</Text>
          <Text>🔋</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>→</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <View style={styles.greenHeader}>
          <View style={styles.orderInfo}>
            <View style={styles.orderLabel}>
              <Text style={styles.labelText}>طقم</Text>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderTitle}>طقم محدود الصيفية</Text>
              <Text style={styles.orderSubtitle}>قطع محدود الجودة عالية</Text>
            </View>
            <Text style={styles.orderPrice}>150.00 ريال</Text>
          </View>
          <Image
            source={require('../../assets/mirroimagewomen.png')}
            style={styles.headerImage}
          />
        </View>

        <View style={styles.sizeGuideSection}>
          <View style={styles.sizeGuideHeader}>
            <Image
              source={require('../../assets/female.png')}
              style={styles.measurementImage}
            />
            <Text style={styles.sizeGuideTitle}>دليل المقاسات</Text>
          </View>

          <View style={styles.measurementsContainer}>
            {measurements.map((item, index) => (
              <View key={index} style={styles.measurementItem}>
                <Text style={styles.measurementValue}>{item.value}</Text>
                <Text style={styles.measurementLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomSection}>
        {showError ? (
          <View style={styles.errorMessage}>
            <Text style={styles.errorText}>لم تُملأ المقاسات المطلوبة</Text>
          </View>
        ) : null}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>عودة للخلف</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleAddToOrder}
          >
            <Text style={styles.primaryButtonText}>إضافة للطلبات</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: Spacing.verticalXs,
    backgroundColor: '#1B5E20',
  },
  timeText: {
    fontSize: FontSizes.bodySmall,
    color: '#FFF',
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    gap: Spacing.gapXs,
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.verticalMd,
  },
  backArrow: {
    fontSize: scale(20),
    color: '#1B5E20',
  },
  content: {
    flex: 1,
    marginBottom: scaleVertical(140),
  },
  greenHeader: {
    backgroundColor: '#1B5E20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.cardPadding,
    borderRadius: BorderRadius.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.verticalMd,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.verticalXs,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    marginBottom: Spacing.verticalSm,
  },
  labelText: {
    color: '#FFF',
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: Spacing.verticalSm,
  },
  orderTitle: {
    color: '#FFF',
    fontSize: FontSizes.body,
    fontWeight: '600',
    marginBottom: Spacing.verticalXs,
  },
  orderSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSizes.bodySmall,
  },
  orderPrice: {
    color: '#FFF',
    fontSize: FontSizes.bodySmall,
    fontWeight: '600',
  },
  headerImage: {
    width: scale(60),
    height: scale(60),
    borderRadius: BorderRadius.round,
  },
  sizeGuideSection: {
    backgroundColor: '#FFF',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.verticalMd,
    borderRadius: BorderRadius.sm,
    padding: Spacing.cardPadding,
    paddingBottom: scaleVertical(20),
  },
  sizeGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.verticalMd,
  },
  measurementImage: {
    width: scale(40),
    height: scale(40),
    marginRight: Spacing.md,
    borderRadius: BorderRadius.round,
  },
  sizeGuideTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: '#333',
  },
  measurementsContainer: {
    flexDirection: 'column',
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.verticalMd,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  measurementLabel: {
    fontSize: FontSizes.label,
    color: '#666',
    fontWeight: '500',
  },
  measurementValue: {
    fontSize: FontSizes.label,
    color: '#333',
    fontWeight: '600',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.verticalMd,
  },
  errorMessage: {
    backgroundColor: '#FFE0E0',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.verticalMd,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.verticalMd,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: FontSizes.label,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    paddingVertical: Spacing.verticalMd,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: Spacing.verticalMd,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: FontSizes.body,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;
