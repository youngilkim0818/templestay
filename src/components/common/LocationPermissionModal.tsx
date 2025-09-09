import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface LocationPermissionModalProps {
  visible: boolean;
  onRequestPermission: () => void;
  onCancel: () => void;
}

const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  visible,
  onRequestPermission,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="location-outline" size={32} color={COLORS.brand.sage} />
            </View>
            <Text style={styles.title}>
              Location Permission Required
            </Text>
            <Text style={styles.description}>
              We need your location to help you find nearby temples and attractions in Gyeongbuk, and provide accurate information based on your current location.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onRequestPermission}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Allow Location Access
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onCancel}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                Not Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 27, 31, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: COLORS.shadow.lg,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 16,
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.brand.sage,
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: COLORS.text.inverse,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  secondaryButtonText: {
    color: COLORS.text.secondary,
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default LocationPermissionModal;
