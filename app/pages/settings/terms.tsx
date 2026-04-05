import React from 'react';
import { LegalContentScreen } from '@/components/settings/LegalContentScreen';

export default function SettingsTermsScreen() {
    return (
        <LegalContentScreen
            title="الشروط والأحكام"
            field="terms"
            emptyMessage="لم يتم نشر الشروط والأحكام بعد. يمكن للمسؤول إضافتها من لوحة التحكم → إعدادات المنصة."
        />
    );
}
