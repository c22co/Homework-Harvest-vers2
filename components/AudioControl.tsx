import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAudio } from './AudioManager';

export default function AudioControl() {
  const { isMuted, toggleMute } = useAudio();

  return (
    <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
      <Text style={styles.muteButtonText}>{isMuted ? '🔇' : '🔊'}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  muteButton: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -25, // Center cluster: UI(-75), Audio(-25), Shop(+25)
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  muteButtonText: {
    fontSize: 24,
  },
});