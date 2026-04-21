import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { SkeletonBox } from '@/components/Skeleton';

const { width } = Dimensions.get('window');
const BANNER_H = Math.min(220, Math.max(140, Math.round(width * 0.42)));

export default function HomeScreenSkeleton() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <SkeletonBox width={width} height={BANNER_H} borderRadius={0} style={styles.banner} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonBox width="35%" height={20} borderRadius={8} />
          <SkeletonBox width={56} height={16} borderRadius={6} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {[0, 1, 2].map((i) => (
            <View key={`why-${i}`} style={styles.whyCardSk}>
              <SkeletonBox width={40} height={40} borderRadius={20} />
              <SkeletonBox width="70%" height={13} style={styles.mt10} />
              <SkeletonBox width="100%" height={10} style={styles.mt6} />
              <SkeletonBox width="85%" height={10} style={styles.mt4} />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonBox width="45%" height={20} borderRadius={8} />
          <SkeletonBox width={56} height={16} borderRadius={6} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.cardSk}>
              <SkeletonBox width={170} height={160} borderRadius={20} />
              <SkeletonBox width="80%" height={14} style={styles.mt8} />
              <SkeletonBox width="55%" height={11} style={styles.mt6} />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonBox width="38%" height={20} borderRadius={8} />
          <SkeletonBox width={56} height={16} borderRadius={6} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {[0, 1, 2].map((i) => (
            <View key={`rv-${i}`} style={styles.reviewCardSk}>
              <SkeletonBox width={40} height={40} borderRadius={20} />
              <View style={styles.reviewTextSk}>
                <SkeletonBox width="70%" height={12} borderRadius={6} />
                <SkeletonBox width="100%" height={10} borderRadius={6} style={styles.mt6} />
                <SkeletonBox width="92%" height={10} borderRadius={6} style={styles.mt4} />
                <SkeletonBox width="60%" height={10} borderRadius={6} style={styles.mt4} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SkeletonBox width="40%" height={20} borderRadius={8} />
          <SkeletonBox width={56} height={16} borderRadius={6} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.cardSk}>
              <SkeletonBox width={170} height={160} borderRadius={20} />
              <SkeletonBox width="75%" height={14} style={styles.mt8} />
              <SkeletonBox width="50%" height={11} style={styles.mt6} />
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 20 },
  banner: { alignSelf: 'stretch' },
  section: { marginTop: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
  },
  cardSk: { width: 170 },
  whyCardSk: {
    width: 170,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },
  reviewCardSk: {
    width: 268,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },
  reviewTextSk: { flex: 1 },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  mt6: { marginTop: 6 },
  mt4: { marginTop: 4 },
});
