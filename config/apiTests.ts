/**
 * API Integration Test & Verification
 * 
 * This file contains test functions to verify that all three APIs are working correctly.
 * Run these tests to ensure the integration is successful.
 */

import apiService from '@/config/apiService';

// ============================================
// TEST FUNCTIONS
// ============================================

/**
 * Test 1: Recommended Services API
 */
export const testRecommendedServices = async () => {
    console.log('🧪 Testing Recommended Services API...');

    try {
        // Test without parameters
        const response1 = await apiService.getRecommendedServices();
        console.log('✅ Recommended Services (no params):', response1);

        // Test with pagination
        const response2 = await apiService.getRecommendedServices({ per_page: 10 });
        console.log('✅ Recommended Services (per_page=10):', response2);

        // Test with page parameter
        const response3 = await apiService.getRecommendedServices({ per_page: 5, page: 2 });
        console.log('✅ Recommended Services (per_page=5, page=2):', response3);

        return { success: true, message: 'Recommended Services API working!' };
    } catch (error) {
        console.error('❌ Recommended Services API Error:', error);
        return { success: false, error };
    }
};

/**
 * Test 2: Banners API
 */
export const testBanners = async () => {
    console.log('🧪 Testing Banners API...');

    try {
        const response = await apiService.getBanners();
        console.log('✅ Banners:', response);

        if (response.data && response.data.length > 0) {
            console.log(`✅ Found ${response.data.length} banners`);
        } else {
            console.log('⚠️ No banners found (this might be expected)');
        }

        return { success: true, message: 'Banners API working!' };
    } catch (error) {
        console.error('❌ Banners API Error:', error);

        // Check if it's an auth error
        if ((error as any).response?.status === 401) {
            console.error('⚠️ Authentication required - make sure user is logged in');
        }

        return { success: false, error };
    }
};

/**
 * Test 3: Fashion Styles API
 */
export const testFashionStyles = async () => {
    console.log('🧪 Testing Fashion Styles API...');

    try {
        // Test without parameters
        const response1 = await apiService.getFashionStyles();
        console.log('✅ Fashion Styles (no params):', response1);

        // Test with pagination
        const response2 = await apiService.getFashionStyles({ per_page: 10 });
        console.log('✅ Fashion Styles (per_page=10):', response2);

        if (response1.data && response1.data.length > 0) {
            console.log(`✅ Found ${response1.data.length} fashion styles`);
        } else {
            console.log('⚠️ No fashion styles found (this might be expected)');
        }

        return { success: true, message: 'Fashion Styles API working!' };
    } catch (error) {
        console.error('❌ Fashion Styles API Error:', error);

        // Check if it's an auth error
        if ((error as any).response?.status === 401) {
            console.error('⚠️ Authentication required - make sure user is logged in');
        }

        return { success: false, error };
    }
};

/**
 * Run all API tests
 */
export const runAllApiTests = async () => {
    console.log('\n🚀 Starting API Integration Tests...\n');

    const results = {
        recommendedServices: await testRecommendedServices(),
        banners: await testBanners(),
        fashionStyles: await testFashionStyles(),
    };

    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log('Recommended Services:', results.recommendedServices.success ? '✅ PASS' : '❌ FAIL');
    console.log('Banners:', results.banners.success ? '✅ PASS' : '❌ FAIL');
    console.log('Fashion Styles:', results.fashionStyles.success ? '✅ PASS' : '❌ FAIL');
    console.log('========================\n');

    const allPassed = results.recommendedServices.success &&
        results.banners.success &&
        results.fashionStyles.success;

    if (allPassed) {
        console.log('🎉 All API tests passed! Integration is successful.');
    } else {
        console.log('⚠️ Some tests failed. Check the errors above.');
    }

    return results;
};

// ============================================
// HOW TO USE THESE TESTS
// ============================================

/**
 * To test the APIs in your app:
 * 
 * 1. Import this file in any component:
 *    import { runAllApiTests } from '@/config/apiTests';
 * 
 * 2. Call the test function (e.g., in useEffect or a button press):
 *    useEffect(() => {
 *        runAllApiTests();
 *    }, []);
 * 
 * 3. Check the console for results
 * 
 * Or test individual APIs:
 *    import { testRecommendedServices, testBanners, testFashionStyles } from '@/config/apiTests';
 *    
 *    const handleTest = async () => {
 *        await testRecommendedServices();
 *    };
 */

// ============================================
// DEBUGGING HELPERS
// ============================================

/**
 * Check if API base URL is configured correctly
 */
export const checkApiConfiguration = () => {
    console.log('🔍 Checking API Configuration...');
    console.log('Environment:', process.env.EXPO_NODE_ENV);
    console.log('Local Base URL:', process.env.EXPO_PUBLIC_LOCAL_BASE_URL);
    console.log('Server URL:', process.env.EXPO_PUBLIC_SERVER_URL);

    // Check .env file
    const baseUrl = process.env.EXPO_NODE_ENV === "production"
        ? process.env.EXPO_PUBLIC_LOCAL_BASE_URL
        : process.env.EXPO_PUBLIC_SERVER_URL;

    console.log('Active Base URL:', baseUrl);

    if (!baseUrl) {
        console.error('❌ Base URL is not configured! Check your .env file.');
        return false;
    }

    console.log('✅ API Configuration looks good!');
    return true;
};

/**
 * Test authentication token
 */
export const checkAuthToken = () => {
    console.log('🔍 Checking Authentication Token...');

    // This would need to import getAccessToken from authToken.ts
    // For now, just log instructions
    console.log('To check auth token:');
    console.log('1. Import: import { getAccessToken } from "@/config/authToken";');
    console.log('2. Call: const token = getAccessToken();');
    console.log('3. Check if token exists for authenticated endpoints');
};

export default {
    testRecommendedServices,
    testBanners,
    testFashionStyles,
    runAllApiTests,
    checkApiConfiguration,
    checkAuthToken,
};
