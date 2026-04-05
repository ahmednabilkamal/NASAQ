import React from 'react';
import { LegalContentScreen } from '@/components/settings/LegalContentScreen';

export default function SettingsPrivacyScreen() {
    return (
        <LegalContentScreen
            title="سياسة الخصوصية"
            field="privacy"
            emptyMessage="لم يتم نشر سياسة الخصوصية بعد. يمكن للمسؤول إضافتها من لوحة التحكم → إعدادات المنصة."
        />
    );
}
