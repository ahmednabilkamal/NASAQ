import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { userScreenDirection, stylistScreenDirection } from '@/config/rtlLayout';
import { rtlText } from '@/config/rtlText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBackChevron } from '@/config/directionalIcons';
import { useAuth } from '@/config/authContext';
import { isStylistUser } from '@/config/navigationFlow';
import apiService, { Ticket } from '@/config/apiService';

const STATUS_COLOR: Record<string, string> = {
  open: '#3B82F6',
  in_progress: '#F59E0B',
  closed: '#9CA3AF',
};

export default function TicketsScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const isStylist = isStylistUser(user);
  const screenDir = isStylist ? stylistScreenDirection : userScreenDirection;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/pages/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await apiService.listTickets();
      const raw = res?.data;
      const list = Array.isArray(raw) ? raw : [];
      setTickets(list);
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchTickets();
  }, [isAuthenticated, fetchTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  const renderItem = ({ item }: { item: Ticket }) => {
    const st = String(item.status ?? 'open').toLowerCase();
    const dot = STATUS_COLOR[st] ?? '#6B7280';
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({ pathname: '/pages/ticket_detail' as any, params: { id: String(item.id) } })
        }
      >
        <View style={styles.cardTop}>
          <Text style={[styles.subject, rtlText.alignStart]} numberOfLines={2}>
            {item.subject}
          </Text>
          <View style={[styles.badge, { backgroundColor: dot + '22' }]}>
            <Text style={[styles.badgeText, { color: dot }]}>{item.status ?? 'open'}</Text>
          </View>
        </View>
        {item.order_report ? (
          <Text style={[styles.meta, rtlText.alignStart]}>بلاغ طلب · {item.order_report.category}</Text>
        ) : null}
        {item.order?.id != null ? (
          <Text style={[styles.meta, rtlText.alignStart]}>طلب #{item.order.id}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, screenDir]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name={getBackChevron()} size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تذاكر الدعم</Text>
        <TouchableOpacity
          onPress={() => router.push('/pages/ticket_new' as any)}
          hitSlop={12}
          accessibilityLabel="تذكرة جديدة"
        >
          <Ionicons name="add-circle-outline" size={26} color="#064E3B" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#064E3B" />
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          contentContainerStyle={tickets.length === 0 ? styles.emptyList : styles.listPad}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={[styles.empty, rtlText.alignCenter]}>لا توجد تذاكر بعد.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Cairo_700Bold', color: '#111' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listPad: { padding: 16, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  empty: { color: '#6B7280', fontSize: 15, fontFamily: 'Cairo_400Regular' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E7EB',
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  subject: { flex: 1, fontSize: 16, fontFamily: 'Cairo_700Bold', color: '#111' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: 'Cairo_700Bold', textTransform: 'capitalize' },
  meta: { marginTop: 6, fontSize: 13, color: '#6B7280', fontFamily: 'Cairo_400Regular' },
});
