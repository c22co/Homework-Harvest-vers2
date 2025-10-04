import { useCurrency } from '@/components/CurrencyContext';
import DecorTree from '@/components/DecorTree';
import Pumpkin from '@/components/Pumpkin';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type PumpkinItem = { id: string; x: number; y: number };

export default function PlayerController({
  pumpkins,
  setPumpkins,
  outfit = '🧑',
}: {
  pumpkins: PumpkinItem[];
  setPumpkins: (updater: (prev: PumpkinItem[]) => PumpkinItem[]) => void;
  outfit?: string;
}) {
  const CHARACTER_SIZE = 40;
  const PUMPKIN_SIZE = 40;
  const MOVE_SPEED_PX_PER_SEC = 240; // tune this for speed (px/sec)

  const initial = {
    x: SCREEN_WIDTH / 2 - CHARACTER_SIZE / 2,
    y: SCREEN_HEIGHT / 2 - CHARACTER_SIZE / 2,
  };

  // keep a small state only for initialization / occasional reads
  const [position] = useState(initial);
  const positionRef = useRef({ ...initial }); // authoritative per-frame position

  const animatedX = useRef(new Animated.Value(positionRef.current.x)).current;
  const animatedY = useRef(new Animated.Value(positionRef.current.y)).current;
  // use shared outfit from context so the character updates when you equip in the shop
  const { add_currency, currentOutfit } = useCurrency();
  const displayOutfit = currentOutfit ?? outfit;

  // pumpkins ref to avoid stale closure
  const pumpkinsRef = useRef<PumpkinItem[]>(pumpkins);
  useEffect(() => {
    pumpkinsRef.current = pumpkins;
  }, [pumpkins]);

  // key tracking
  const keysPressed = useRef<Record<string, boolean>>({});
  const rafId = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const checkCollision = (px: number, py: number) => {
    const playerRect = {
      left: px,
      right: px + CHARACTER_SIZE,
      top: py,
      bottom: py + CHARACTER_SIZE,
    };

    for (const pumpkin of [...pumpkinsRef.current]) {
      const pRect = {
        left: pumpkin.x,
        right: pumpkin.x + PUMPKIN_SIZE,
        top: pumpkin.y,
        bottom: pumpkin.y + PUMPKIN_SIZE,
      };

      const isColliding =
        playerRect.left < pRect.right &&
        playerRect.right > pRect.left &&
        playerRect.top < pRect.bottom &&
        playerRect.bottom > pRect.top;

      if (isColliding) {
        setPumpkins(prev => prev.filter(p => p.id !== pumpkin.id));
        const reward = Math.floor(Math.random() * 50) + 1;
        add_currency(reward);
      }
    }
  };

  // update visuals immediately (no timing animation each tick)
  const applyPosition = (x: number, y: number) => {
    positionRef.current.x = x;
    positionRef.current.y = y;
    animatedX.setValue(x);
    animatedY.setValue(y);
    checkCollision(x, y);
  };

  // rAF loop for smooth movement
  const loop = (time: number) => {
    if (lastTimeRef.current == null) lastTimeRef.current = time;
    const dtMs = time - lastTimeRef.current;
    lastTimeRef.current = time;
    const dt = dtMs / 1000; // seconds
    let moved = false;

    let newX = positionRef.current.x;
    let newY = positionRef.current.y;
    const delta = MOVE_SPEED_PX_PER_SEC * dt;

    if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
      newX = Math.max(0, newX - delta);
      moved = true;
    }
    if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
      newX = Math.min(SCREEN_WIDTH - CHARACTER_SIZE, newX + delta);
      moved = true;
    }
    if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
      newY = Math.max(0, newY - delta);
      moved = true;
    }
    if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
      newY = Math.min(SCREEN_HEIGHT - CHARACTER_SIZE - 150, newY + delta);
      moved = true;
    }

    if (moved) {
      applyPosition(newX, newY);
      rafId.current = requestAnimationFrame(loop);
    } else {
      // stop loop
      lastTimeRef.current = null;
      rafId.current = null;
    }
  };

  const startLoopIfNeeded = () => {
    if (rafId.current == null) {
      lastTimeRef.current = null;
      rafId.current = requestAnimationFrame(loop);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (!keysPressed.current[k]) {
        keysPressed.current[k] = true;
        startLoopIfNeeded();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = false;
      // loop will stop itself when no keys are pressed
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // on-screen buttons must use positionRef
  const nudge = (dx: number, dy: number) => {
    const px = Math.min(Math.max(0, positionRef.current.x + dx), SCREEN_WIDTH - CHARACTER_SIZE);
    const py = Math.min(Math.max(0, positionRef.current.y + dy), SCREEN_HEIGHT - CHARACTER_SIZE - 150);
    applyPosition(px, py);
  };

  // Example tree positions (adjust or generate dynamically)
  const treePositions = [
    { x: 8, y: SCREEN_HEIGHT - 220, scale: 1.0, flip: false },
    { x: SCREEN_WIDTH - 110, y: SCREEN_HEIGHT - 240, scale: 1.1, flip: true },
    { x: 24, y: 40, scale: 0.8, flip: false },
    { x: SCREEN_WIDTH - 160, y: 60, scale: 0.9, flip: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
        {/* decorative trees (render first so they are behind character) */}
        {treePositions.map((t, i) => (
          <DecorTree key={i} x={t.x} y={t.y} scale={t.scale} flip={t.flip} />
        ))}

        {/* existing character & pumpkins rendering */}
        <Animated.View
          style={[
            styles.character,
            { left: animatedX as any, top: animatedY as any, zIndex: 5 },
          ]}
        >
          <Text style={styles.characterText}>{displayOutfit}</Text>
        </Animated.View>

        {/* keep pumpkin rendering here (pumpkins should have zIndex between trees and player or same layer) */}
        {pumpkins.map(p => (
          <Pumpkin key={p.id} x={p.x} y={p.y} />
        ))}

      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(-20, 0)}>
          <Text>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(20, 0)}>
          <Text>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(0, -20)}>
          <Text>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.arrowButton} onPress={() => nudge(0, 20)}>
          <Text>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // make transparent so global ImageBackground shows through
  container: { flex: 1, backgroundColor: 'transparent' },
  gameArea: { flex: 1, position: 'relative' },
  character: { position: 'absolute', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  characterText: { fontSize: 40 },
  controlsContainer: { position: 'absolute', bottom: 20, left: 20 },
  arrowButton: { width: 45, height: 45, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', margin: 5, borderRadius: 22.5 },
});