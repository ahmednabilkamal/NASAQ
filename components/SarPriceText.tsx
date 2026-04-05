import React from 'react';
import { View, Text, StyleSheet, TextStyle, StyleProp } from 'react-native';
import SaudiRiyalSymbol from '@/components/SaudiRiyalSymbol';
import { formatSarAmount } from '@/utils/formatSarPrice';

type Props = {
    value: unknown;
    textStyle?: StyleProp<TextStyle>;
    /** Symbol height; defaults from flattened fontSize when possible */
    symbolSize?: number;
    gap?: number;
};

export default function SarPriceText({ value, textStyle, symbolSize, gap = 3 }: Props) {
    const amount = formatSarAmount(value);
    const flat = StyleSheet.flatten(textStyle) as TextStyle | undefined;
    const color = flat?.color ?? '#111';
    const fontSize = typeof flat?.fontSize === 'number' ? flat.fontSize : 16;
    const symH = symbolSize ?? Math.max(12, Math.round(fontSize * 0.82));

    if (amount === '—') {
        return <Text style={textStyle}>—</Text>;
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>
            <Text style={textStyle}>{amount}</Text>
            <SaudiRiyalSymbol size={symH} color={String(color)} />
        </View>
    );
}
