import Toast from 'react-native-toast-message';
import pageData from '@/data/content';

interface ErrorOptions {
  title?: string;
  message?: string;
  type?: 'error' | 'success' | 'info';
  languageCode?: string;
}

export const showErrorToast = (
  errorKey: string,
  languageCode: string = 'ar',
  customMessage?: string
) => {
  const content = (pageData as any)[languageCode] || (pageData as any)['ar'];
  const errorTitle = content.errors?.title || 'خطأ';
  const errorMessage = customMessage || content.errors?.[errorKey] || errorKey;

  Toast.show({
    type: 'error',
    text1: errorTitle,
    text2: errorMessage,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showSuccessToast = (
  messageKey: string,
  languageCode: string = 'ar',
  customMessage?: string
) => {
  const content = (pageData as any)[languageCode] || (pageData as any)['ar'];
  const successTitle = content.errors?.success || 'نجاح';
  const message = customMessage || content.toast?.[messageKey] || messageKey;

  Toast.show({
    type: 'success',
    text1: successTitle,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showInfoToast = (
  title: string,
  message: string,
  languageCode: string = 'ar'
) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const handleApiError = (
  error: any,
  languageCode: string = 'ar',
  fallbackMessage?: string
) => {
  const content = (pageData as any)[languageCode] || (pageData as any)['ar'];

  let errorMessage = fallbackMessage || content.errors?.saveFailed || 'حدث خطأ';

  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  if (error?.message?.includes('Network') || error?.code === 'ECONNABORTED') {
    errorMessage = content.errors?.networkError || 'خطأ في الاتصال بالشبكة';
  }

  showErrorToast('', languageCode, errorMessage);
};

export const showAlert = (
  title: string,
  message: string,
  languageCode: string = 'ar'
) => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
  });
};

export const handleGlobalError = (error: Error, errorInfo: any) => {
  console.error('Global Error:', error, errorInfo);

  Toast.show({
    type: 'error',
    text1: 'حدث خطأ غير متوقع',
    text2: 'يرجى إعادة تشغيل التطبيق',
    position: 'top',
    visibilityTime: 5000,
  });
};
