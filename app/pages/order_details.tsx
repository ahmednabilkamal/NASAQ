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
import { getBackChevron } from '@/config/directionalIcons';

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.timeText}>9:41</Text>
        <View style={styles.statusBar}>
          <Text>📶</Text>
          <Text>📡</Text>
          <Text>🔋</Text>
        </View>
      </View>

      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name={getBackChevron()} size={24} color="#1B5E20" />
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        {/* Green Header Section */}
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

        {/* Size Guide Section */}
        <View style={styles.sizeGuideSection}>
          <View style={styles.sizeGuideHeader}>
            <Image
              source={require('../../assets/female.png')}
              style={styles.measurementImage}
            />
            <Text style={styles.sizeGuideTitle}>دليل المقاسات</Text>
          </View>

          {/* Measurements Grid */}
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

      {/* Bottom Action Buttons */}
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
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#1B5E20',
  },
  timeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    gap: 4,
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    marginBottom: 140,
  },
  greenHeader: {
    backgroundColor: '#1B5E20',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
  },
  orderInfo: {
    flex: 1,
  },
  orderLabel: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  labelText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 8,
  },
  orderTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  orderPrice: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  sizeGuideSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
    padding: 16,
    paddingBottom: 20,
  },
  sizeGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  measurementImage: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  sizeGuideTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  measurementsContainer: {
    flexDirection: 'column',
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  measurementLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  measurementValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  errorMessage: {
    backgroundColor: '#FFE0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1B5E20',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrderDetailsScreen;
