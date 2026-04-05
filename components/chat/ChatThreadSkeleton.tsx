import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SkeletonBox } from '@/components/Skeleton';

export default function ChatThreadSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.rowEnd}>
        <SkeletonBox width="72%" height={44} borderRadius={14} />
      </View>
      <View style={styles.rowStart}>
        <SkeletonBox width="65%" height={52} borderRadius={14} />
      </View>
      <View style={styles.rowEnd}>
        <SkeletonBox width="58%" height={40} borderRadius={14} />
      </View>
      <View style={styles.rowStart}>
        <SkeletonBox width="78%" height={36} borderRadius={14} />
      </View>
      <View style={styles.rowEnd}>
        <SkeletonBox width="50%" height={44} borderRadius={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 12, justifyContent: 'center' },
  rowEnd: { alignItems: 'flex-end' },
  rowStart: { alignItems: 'flex-start' },
});
