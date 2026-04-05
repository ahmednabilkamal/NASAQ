import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SkeletonBox, SkeletonCircle } from '@/components/Skeleton';

export default function ChatListSkeleton() {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.searchBar}>
        <SkeletonBox width={22} height={22} borderRadius={6} />
        <SkeletonBox height={16} style={styles.searchInput} />
      </View>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.row}>
          <SkeletonCircle size={55} />
          <View style={styles.textCol}>
            <SkeletonBox width="55%" height={15} borderRadius={6} />
            <SkeletonBox width="85%" height={13} borderRadius={6} style={styles.mt6} />
          </View>
          <View style={styles.meta}>
            <SkeletonBox width={36} height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, minHeight: 200 },
  content: { paddingBottom: 100 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    gap: 10,
  },
  searchInput: { flex: 1, borderRadius: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F5F5F5',
  },
  textCol: { flex: 1, minWidth: 0, marginStart: 12 },
  mt6: { marginTop: 6 },
  meta: { alignItems: 'center', marginStart: 8 },
});
