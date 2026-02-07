import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const Marker = () => null;

const MapView = ({ style, children }: any) => {
    return (
        <View style={[style, styles.placeholder]}>
            <Text style={styles.text}>Map is not available on Web yet.</Text>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    text: {
        color: '#64748b',
        fontWeight: '600',
    }
});

export default MapView;
