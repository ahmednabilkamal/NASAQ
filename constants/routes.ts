/**
 * Single source of truth for Expo Router paths (file-based routes under /app).
 * Import here instead of scattering string literals — easier refactors & search.
 */
export const ROUTES = {
    index: '/',
    login: '/pages/login',
    verification: '/pages/verification',

    onboarding: {
        page1: '/pages/onboarding/page1',
        page2: '/pages/onboarding/page2',
        page3: '/pages/onboarding/page3',
        page4: '/pages/onboarding/page4',
        genderSelection: '/pages/onboarding/genderSelection',
        heightSelection: '/pages/onboarding/heightSelection',
        weightSelection: '/pages/onboarding/weightSelection',
        colorSelection: '/pages/onboarding/colorSelection',
        bodyShape: '/pages/onboarding/bodyShape',
        boyMeasurements: '/pages/onboarding/boyMeasurements',
        styleIdentity: '/pages/onboarding/styleIdentity',
        roleSelection: '/pages/onboarding/roleSelection',
        stylistProfile: '/pages/onboarding/stylistProfile',
        stylistDetails: '/pages/onboarding/stylistDetails',
        stylistServices: '/pages/onboarding/stylistServices',
    },

    tabs: {
        homescreen: '/pages/tabs/homescreen',
        stylists: '/pages/tabs/stylists',
        profile: '/pages/tabs/profile',
        chat: '/pages/tabs/chat',
        favorites: '/pages/tabs/favorites',
    },

    stylist: {
        home: '/pages/stylist/home',
        orders: '/pages/stylist/orders',
        services: '/pages/stylist/services',
        earnings: '/pages/stylist/earnings',
        editProfile: '/pages/stylist/edit_profile',
        reviews: '/pages/stylist/reviews',
        pendingVerification: '/pages/stylist/pending_verification',
    },

    client: {
        orders: '/pages/orders',
        stylistDetail: '/pages/stylist_detail',
        checkout: '/pages/checkout',
        chat: '/pages/chat',
        notifications: '/pages/notifications',
        tickets: '/pages/tickets',
        ticketDetail: '/pages/ticket_detail',
        orderDetails: '/pages/order_details',
        contactUs: '/pages/contact_us',
    },

    payment: {
        addCard: '/pages/payment/add_card',
        cards: '/pages/payment/cards',
    },

    profile: {
        edit: '/pages/profile/edit',
        changePassword: '/pages/profile/change_password',
        deleteAccount: '/pages/profile/delete_account',
    },

    /** Legal / platform copy (same for clients and stylists). */
    settings: {
        privacy: '/pages/settings/privacy',
        terms: '/pages/settings/terms',
        notifications: '/pages/settings/notifications',
    },

    stylists: {
        filter: '/pages/stylists/filter',
        filterWizardStep1: '/pages/stylists/filterWizardStep1',
        filterWizardStep2: '/pages/stylists/filterWizardStep2',
    },
} as const;

/** Use when Expo Router types reject a string (legacy screens). */
export function href(path: string): any {
    return path;
}
