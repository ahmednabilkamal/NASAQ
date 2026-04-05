import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { SkeletonBox } from '@/components/Skeleton';

const W = Dimensions.get('window').width;
const HERO_H = Math.round((W * 4) / 3);

export default function StylistDetailSkeleton() {
  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox height={18} style={styles.headerTitle} />
        <SkeletonBox width={40} height={40} borderRadius={20} />
      </View>

      <SkeletonBox width="100%" height={HERO_H} borderRadius={0} />

      <View style={styles.body}>
        <View style={styles.tabs}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonBox key={i} width={64} height={28} borderRadius={6} />
          ))}
        </View>
        <SkeletonBox width="30%" height={18} style={styles.mb12} />
        <View style={styles.grid}>
          <SkeletonBox width="48%" height={160} borderRadius={20} />
          <SkeletonBox width="48%" height={160} borderRadius={20} />
        </View>
        <View style={styles.grid}>
          <SkeletonBox width="48%" height={160} borderRadius={20} />
          <SkeletonBox width="48%" height={160} borderRadius={20} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { flex: 1, marginHorizontal: 12, height: 20, borderRadius: 8 },
  body: { paddingHorizontal: 20, paddingTop: 20 },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  mb12: { marginBottom: 12 },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});
