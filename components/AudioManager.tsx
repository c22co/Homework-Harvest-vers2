import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AudioContextType {
  playBackgroundMusic: () => Promise<void>;
  stopBackgroundMusic: () => Promise<void>;
  playWalkingSound: () => Promise<void>;
  stopWalkingSound: () => Promise<void>;
  playPickupSound: () => Promise<void>;
  isMuted: boolean;
  toggleMute: () => void;
}

const AudioContext = createContext<AudioContextType>({} as AudioContextType);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const backgroundSound = useRef<Audio.Sound | null>(null);
  const walkingSound = useRef<Audio.Sound | null>(null);
  const pickupSound = useRef<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isWalking, setIsWalking] = useState(false);

  // Initialize audio when component mounts
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Configure audio mode for better performance
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        // Load background music
        const { sound: bgSound } = await Audio.Sound.createAsync(
          require('@/assets/images/Sounds/Background.mp3'),
          {
            isLooping: true,
            volume: 0.3, // Lower volume for background music
          }
        );
        backgroundSound.current = bgSound;

        // Load walking sound
        const { sound: walkSound } = await Audio.Sound.createAsync(
          require('@/assets/images/Sounds/Walking.mp3'),
          {
            isLooping: true,
            volume: 0.5,
          }
        );
        walkingSound.current = walkSound;

        // Load pickup sound
        const { sound: pickSound } = await Audio.Sound.createAsync(
          require('@/assets/images/Sounds/Pick-Up.mp3'),
          {
            volume: 0.7,
          }
        );
        pickupSound.current = pickSound;

        // Start background music automatically
        if (!isMuted) {
          await bgSound.playAsync();
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initializeAudio();

    // Cleanup function
    return () => {
      backgroundSound.current?.unloadAsync();
      walkingSound.current?.unloadAsync();
      pickupSound.current?.unloadAsync();
    };
  }, []);

  const playBackgroundMusic = async () => {
    try {
      if (backgroundSound.current && !isMuted) {
        await backgroundSound.current.playAsync();
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  };

  const stopBackgroundMusic = async () => {
    try {
      if (backgroundSound.current) {
        await backgroundSound.current.pauseAsync();
      }
    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  };

  const playWalkingSound = async () => {
    try {
      if (walkingSound.current && !isMuted && !isWalking) {
        setIsWalking(true);
        await walkingSound.current.playAsync();
      }
    } catch (error) {
      console.error('Error playing walking sound:', error);
    }
  };

  const stopWalkingSound = async () => {
    try {
      if (walkingSound.current && isWalking) {
        setIsWalking(false);
        await walkingSound.current.pauseAsync();
        await walkingSound.current.setPositionAsync(0); // Reset to beginning
      }
    } catch (error) {
      console.error('Error stopping walking sound:', error);
    }
  };

  const playPickupSound = async () => {
    try {
      if (pickupSound.current && !isMuted) {
        // Reset position to beginning and play
        await pickupSound.current.setPositionAsync(0);
        await pickupSound.current.playAsync();
      }
    } catch (error) {
      console.error('Error playing pickup sound:', error);
    }
  };

  const toggleMute = async () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    try {
      if (newMutedState) {
        // Mute all sounds
        await backgroundSound.current?.pauseAsync();
        await walkingSound.current?.pauseAsync();
      } else {
        // Unmute background music
        await backgroundSound.current?.playAsync();
      }
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        playBackgroundMusic,
        stopBackgroundMusic,
        playWalkingSound,
        stopWalkingSound,
        playPickupSound,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};