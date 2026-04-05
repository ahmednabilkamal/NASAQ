import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Modal,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Pressable,
    Animated,
    Keyboard,
    Easing,
} from 'react-native';
import { SafeAreaView } from '@/components/RTLSafeAreaView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/config/authContext';
import { isStylistUser } from '@/config/navigationFlow';
import apiService, { StylistService, Category } from '@/config/apiService';
import { stylistScreenDirection } from '@/config/rtlLayout';
import { rtlInput, rtlText, rtlWritingMode } from '@/config/rtlText';
import StylistBottomNav from '@/components/StylistBottomNav';
import { StylistScreenHeader, STYLIST_GREEN } from '@/components/StylistScreenHeader';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SarPriceText from '@/components/SarPriceText';
import SaudiRiyalSymbol from '@/components/SaudiRiyalSymbol';

export default function StylistServicesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [services, setServices] = useState<StylistService[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Add service modal
    const [showModal, setShowModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
    const [saving, setSaving] = useState(false);

    const openAddModal = () => {
        setNewTitle('');
        setNewPrice('');
        setSelectedCategoryId(null);
        setCategoryPickerVisible(false);
        setShowModal(true);
    };

    const closeAddModal = () => {
        setCategoryPickerVisible(false);
        setShowModal(false);
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace('/pages/login');
        } else if (!authLoading && isAuthenticated && !isStylistUser(user)) {
            router.replace('/pages/tabs/homescreen' as any);
        }
    }, [isAuthenticated, authLoading, user]);

    const fetchServices = useCallback(async () => {
        try {
            const [servicesRes, catsRes] = await Promise.allSettled([
                apiService.listStylistServices(),
                apiService.getCategories(),
            ]);
            if (servicesRes.status === 'fulfilled') {
                setServices(Array.isArray(servicesRes.value.data) ? servicesRes.value.data : []);
            }
            if (catsRes.status === 'fulfilled') {
                setCategories(Array.isArray(catsRes.value.data) ? catsRes.value.data : []);
            }
        } catch (error) {
            console.error('Services fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchServices();
    }, [isAuthenticated, fetchServices]);

    const selectableCategories = useMemo(
        () => categories.filter((c) => Number.isFinite(Number(c.id))),
        [categories]
    );

    const selectedCategory = useMemo(
        () => selectableCategories.find((c) => Number(c.id) === selectedCategoryId) ?? null,
        [selectableCategories, selectedCategoryId]
    );

    const sheetTranslateY = useRef(new Animated.Value(400)).current;

    useEffect(() => {
        if (!categoryPickerVisible) {
            sheetTranslateY.setValue(400);
            return;
        }
        Keyboard.dismiss();
        sheetTranslateY.setValue(400);
        Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: 280,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [categoryPickerVisible, sheetTranslateY]);

    const handleAddService = async () => {
        if (selectedCategoryId == null || selectableCategories.length === 0) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى اختيار التصنيف' });
            return;
        }
        if (!newTitle.trim() || !newPrice.trim()) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى ملء اسم الخدمة والسعر' });
            return;
        }
        const price = parseFloat(newPrice);
        if (isNaN(price) || price <= 0) {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'يرجى إدخال سعر صحيح' });
            return;
        }

        setSaving(true);
        try {
            await apiService.createStylistService({
                title: newTitle.trim(),
                price,
                category_id: selectedCategoryId,
                available: true,
            });
            Toast.show({ type: 'success', text1: 'تم', text2: 'تم إضافة الخدمة بنجاح' });
            closeAddModal();
            setNewTitle('');
            setNewPrice('');
            setSelectedCategoryId(null);
            fetchServices();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'فشل في إضافة الخدمة';
            Toast.show({ type: 'error', text1: 'خطأ', text2: msg });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteService = async (id: number | string) => {
        try {
            await apiService.deleteStylistService(id);
            setServices((prev) => prev.filter((s) => s.id !== id));
            Toast.show({ type: 'success', text1: 'تم', text2: 'تم حذف الخدمة' });
        } catch {
            Toast.show({ type: 'error', text1: 'خطأ', text2: 'فشل في حذف الخدمة' });
        }
    };

    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={STYLIST_GREEN} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, stylistScreenDirection]} edges={['top']}>
            <StylistScreenHeader
                title="خدماتي"
                rightAccessory={
                    <TouchableOpacity
                        onPress={openAddModal}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="add-circle" size={28} color={STYLIST_GREEN} />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={STYLIST_GREEN} />
                </View>
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => { setRefreshing(true); fetchServices(); }}
                            tintColor={STYLIST_GREEN}
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="grid-outline" size={48} color="#CCC" />
                            <Text style={styles.emptyText}>لا توجد خدمات بعد</Text>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={openAddModal}
                            >
                                <Text style={styles.addButtonText}>إضافة خدمة</Text>
                            </TouchableOpacity>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.serviceCard}>
                            <View style={styles.serviceInfo}>
                                <Text style={styles.serviceTitle}>{item.title}</Text>
                                <SarPriceText value={item.price} textStyle={styles.servicePrice} />
                                {item.category?.name && (
                                    <Text style={styles.serviceCategory}>{item.category.name}</Text>
                                )}
                            </View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeleteService(item.id)}
                            >
                                <Ionicons name="trash-outline" size={18} color="#E11D48" />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}

            {/* Add Service Modal */}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
                statusBarTranslucent
                onRequestClose={() => {
                    if (categoryPickerVisible) setCategoryPickerVisible(false);
                    else closeAddModal();
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalRoot, stylistScreenDirection]}
                >
                    <View style={[styles.modalOverlay, stylistScreenDirection]}>
                        <Pressable
                            style={styles.modalBackdrop}
                            onPress={() => {
                                if (categoryPickerVisible) setCategoryPickerVisible(false);
                                else closeAddModal();
                            }}
                        />
                        <View style={[styles.modalSheet, stylistScreenDirection]}>
                            <ScrollView
                                keyboardShouldPersistTaps="handled"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.modalScrollContent}
                            >
                                <View style={styles.modalHandle} />
                                <Text style={styles.modalTitle}>إضافة خدمة جديدة</Text>

                                <Text style={styles.modalLabel}>اسم الخدمة</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="اكتب هنا.."
                                    placeholderTextColor="#B0B0B0"
                                    value={newTitle}
                                    onChangeText={setNewTitle}
                                />

                                <Text style={styles.modalLabel}>التصنيف</Text>
                                {selectableCategories.length === 0 ? (
                                    <Text style={styles.modalEmptyCats}>
                                        لا تتوفر تصنيفات حالياً. يرجى المحاولة لاحقاً أو التواصل مع الدعم.
                                    </Text>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.selectTrigger}
                                        onPress={() => setCategoryPickerVisible(true)}
                                        activeOpacity={0.75}
                                    >
                                        <Text
                                            style={[
                                                styles.selectTriggerText,
                                                !selectedCategory && styles.selectTriggerPlaceholder,
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {selectedCategory ? selectedCategory.name : 'اختر التصنيف'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={22} color="#64748B" />
                                    </TouchableOpacity>
                                )}

                                <View style={styles.modalLabelWithSymbol}>
                                    <Text style={[styles.modalLabel, styles.modalLabelInline]}>السعر</Text>
                                    <SaudiRiyalSymbol size={15} color="#333" />
                                </View>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="0"
                                    placeholderTextColor="#B0B0B0"
                                    value={newPrice}
                                    onChangeText={setNewPrice}
                                    keyboardType="decimal-pad"
                                />

                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        (saving ||
                                            selectableCategories.length === 0 ||
                                            selectedCategoryId == null) && {
                                            opacity: 0.55,
                                        },
                                    ]}
                                    onPress={handleAddService}
                                    disabled={
                                        saving ||
                                        selectableCategories.length === 0 ||
                                        selectedCategoryId == null
                                    }
                                >
                                    {saving ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.modalButtonText}>إضافة</Text>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalCancel} onPress={closeAddModal}>
                                    <Text style={styles.modalCancelText}>إلغاء</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>

                        {categoryPickerVisible ? (
                            <>
                                <Pressable
                                    style={styles.categoryPickerScrim}
                                    onPress={() => setCategoryPickerVisible(false)}
                                />
                                <Animated.View
                                    style={[
                                        styles.categoryBottomSheet,
                                        stylistScreenDirection,
                                        {
                                            paddingBottom: Math.max(insets.bottom, 16),
                                            transform: [{ translateY: sheetTranslateY }],
                                        },
                                    ]}
                                >
                                    <View style={styles.pickerHandle} />
                                    <Text style={styles.pickerSheetTitle}>اختر التصنيف</Text>
                                    <FlatList
                                        data={selectableCategories}
                                        keyExtractor={(item) => String(item.id)}
                                        keyboardShouldPersistTaps="handled"
                                        style={[styles.pickerList, stylistScreenDirection]}
                                        contentContainerStyle={styles.pickerListContent}
                                        renderItem={({ item }) => {
                                            const id = Number(item.id);
                                            const chosen = selectedCategoryId === id;
                                            return (
                                                <TouchableOpacity
                                                    style={[
                                                        styles.pickerItem,
                                                        chosen && styles.pickerItemChosen,
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedCategoryId(id);
                                                        setCategoryPickerVisible(false);
                                                    }}
                                                    activeOpacity={0.65}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.pickerItemText,
                                                            chosen && styles.pickerItemTextChosen,
                                                        ]}
                                                        numberOfLines={2}
                                                    >
                                                        {item.name}
                                                    </Text>
                                                    {chosen ? (
                                                        <Ionicons
                                                            name="checkmark-circle"
                                                            size={22}
                                                            color={STYLIST_GREEN}
                                                        />
                                                    ) : null}
                                                </TouchableOpacity>
                                            );
                                        }}
                                    />
                                </Animated.View>
                            </>
                        ) : null}
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <StylistBottomNav />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 100,
    },
    serviceCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    serviceInfo: {
        flex: 1,
        alignItems: 'flex-start',
    },
    serviceTitle: {
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
        color: '#111',
        ...rtlText.alignStart,
    },
    servicePrice: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#064E3B',
        marginTop: 4,
        ...rtlText.alignStart,
    },
    serviceCategory: {
        fontSize: 12,
        fontFamily: 'Cairo_400Regular',
        color: '#888',
        marginTop: 2,
        ...rtlText.alignStart,
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF1F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 10,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#999',
        ...rtlText.alignStart,
    },
    addButton: {
        backgroundColor: '#064E3B',
        borderRadius: 20,
        paddingHorizontal: 24,
        paddingVertical: 10,
        marginTop: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
    },
    // Modal
    modalRoot: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        position: 'relative',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 0,
    },
    modalSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        maxHeight: '92%',
        width: '100%',
        zIndex: 1,
        elevation: 6,
    },
    categoryPickerScrim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10,
        elevation: 10,
    },
    categoryBottomSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 8,
        maxHeight: '70%',
        width: '100%',
        zIndex: 11,
        elevation: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
    },
    modalScrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 28,
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
        alignSelf: 'center',
        marginBottom: 14,
    },
    selectTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        height: 50,
        paddingHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    selectTriggerText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#111',
        marginEnd: 8,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    selectTriggerPlaceholder: {
        color: '#B0B0B0',
    },
    pickerHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#E5E7EB',
        alignSelf: 'center',
        marginBottom: 12,
    },
    pickerSheetTitle: {
        fontSize: 17,
        fontFamily: 'Cairo_700Bold',
        color: '#0F172A',
        textAlign: 'center',
        marginBottom: 8,
        ...rtlWritingMode,
    },
    pickerList: {
        maxHeight: 320,
    },
    pickerListContent: {
        flexGrow: 1,
        paddingBottom: 4,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#EEF2F7',
        gap: 12,
        direction: 'rtl',
    },
    pickerItemChosen: {
        backgroundColor: '#F0FDF4',
    },
    pickerItemText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Cairo_400Regular',
        color: '#334155',
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    pickerItemTextChosen: {
        fontFamily: 'Cairo_700Bold',
        color: STYLIST_GREEN,
    },
    modalEmptyCats: {
        fontSize: 14,
        fontFamily: 'Cairo_400Regular',
        color: '#B45309',
        marginBottom: 16,
        lineHeight: 22,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Cairo_700Bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 16,
        ...rtlWritingMode,
    },
    modalLabel: {
        fontSize: 14,
        fontFamily: 'Cairo_700Bold',
        color: '#333',
        marginBottom: 8,
        ...rtlText.alignStart,
        ...rtlWritingMode,
    },
    modalLabelWithSymbol: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
        ...rtlText.alignStart,
    },
    modalLabelInline: {
        marginBottom: 0,
    },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        height: 50,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'Cairo_400Regular',
        color: '#000',
        marginBottom: 16,
        ...rtlInput,
    },
    modalButton: {
        backgroundColor: STYLIST_GREEN,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Cairo_700Bold',
    },
    modalCancel: {
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 4,
    },
    modalCancelText: {
        fontSize: 15,
        fontFamily: 'Cairo_600SemiBold',
        color: '#64748B',
    },
});
