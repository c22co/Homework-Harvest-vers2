import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Vibration,
} from "react-native";
import { Audio } from "expo-av";
import { useTodo } from "@/components/TodoContext";

/** Theme tokens */
const ORANGE_DARK = "#B86519";
const BUTTER = "#FFE086";
const BUTTER_DEEP = "#FFD871";
const INPUT_FILL = "#FFF0BF";
const INPUT_BORDER = "#D28B2F";

/** Compact panel + timer range */
const PANEL_WIDTH = 240;
const PANEL_HEIGHT = 240;
const MIN_MIN = 2;
const MAX_MIN = 120;

/** Adjust this path if your file lives elsewhere */
const BEEP = require("../assets/images/Sounds/beep.mp3");

export default function TaskTimer({ initialTaskName = "" }: { initialTaskName?: string }) {
  const EDGE = 12;
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(PANEL_WIDTH, screenWidth - EDGE * 2);

  const { timerTaskName } = useTodo();

  const [panelVisible, setPanelVisible] = useState(true);
  const [task, setTask] = useState(initialTaskName);
  const [mins, setMins] = useState<number>(2);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const running = secondsLeft !== null;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // allow audio in iOS silent mode
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true }).catch(() => {});
  }, []);

  // when a task is linked from the list: show panel & fill the name if not running
  useEffect(() => {
    if (timerTaskName) {
      setPanelVisible(true);
      if (!running) setTask(timerTaskName);
    }
  }, [timerTaskName, running]);

  // tick loop
  useEffect(() => {
    if (!running) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null) return prev;
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          playBeep().catch(() => Vibration.vibrate(400));
          setPanelVisible(false); // auto hide at 00:00
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running]);

  const playBeep = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(BEEP, {
        volume: 1.0,
        shouldPlay: true,
      });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status?.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch (e) {
      // fall back handled by caller (vibrate)
      throw e;
    }
  };

  const stepMinutes = (delta: number) =>
    setMins(m => Math.max(MIN_MIN, Math.min(MAX_MIN, m + delta)));

  const start = () => {
    setPanelVisible(true);
    setSecondsLeft(mins * 60);
  };

  const cancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setSecondsLeft(null);
  };

  if (!panelVisible) return null;

  const mm = running ? Math.floor(secondsLeft! / 60) : mins;
  const ss = running ? secondsLeft! % 60 : 0;
  const timeStr = running
    ? `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${String(mins).padStart(2, "0")}:00`;

  return (
    <View style={[styles.container, { width: panelWidth, right: EDGE }]}>
      {/* Header */}
      <View style={styles.titlePill}>
        <Text style={styles.titleText}>Timer</Text>
        {running && (
          <TouchableOpacity style={styles.close} onPress={cancel} hitSlop={8}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Task name — EDITABLE while not running; read-only when running */}
      {!running ? (
        <TextInput
          value={task}
          onChangeText={setTask}
          placeholder="Task name…"
          placeholderTextColor="#B56C1B"
          style={styles.taskInput}
        />
      ) : (
        <View style={styles.taskNameWrap}>
          <Text numberOfLines={2} style={styles.taskName}>
            {task || "Task Name Here"}
          </Text>
        </View>
      )}

      {/* Setup / Running */}
      {!running ? (
        <>
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => stepMinutes(-2)}>
              <Text style={styles.stepBtnText}>−2</Text>
            </TouchableOpacity>

            <View style={styles.minutesBox}>
              <Text style={styles.minutesText}>
                {mins} <Text style={styles.minutesUnit}>Minutes</Text>
              </Text>
            </View>

            <TouchableOpacity style={styles.stepBtn} onPress={() => stepMinutes(+2)}>
              <Text style={styles.stepBtnText}>+2</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={start} hitSlop={8}>
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.running}>
          <Text style={styles.bigTime}>{timeStr}</Text>
        </View>
      )}
    </View>
  );
}

/* Styles */
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 16,
    backgroundColor: BUTTER,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 14,
    padding: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 18,
    zIndex: 999,
    minHeight: PANEL_HEIGHT,
  },
  titlePill: {
    alignSelf: "stretch",
    backgroundColor: BUTTER_DEEP,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: { color: ORANGE_DARK, fontSize: 16, fontWeight: "900" },
  close: {
    position: "absolute",
    right: 6,
    top: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: ORANGE_DARK,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BUTTER,
  },
  closeText: { color: ORANGE_DARK, fontSize: 16, fontWeight: "900", lineHeight: 16 },

  taskInput: {
    alignSelf: "stretch",
    backgroundColor: INPUT_FILL,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: ORANGE_DARK,
    fontWeight: "800",
  },
  taskNameWrap: {
    alignSelf: "stretch",
    backgroundColor: INPUT_FILL,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  taskName: { fontSize: 16, fontWeight: "800", color: ORANGE_DARK },

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "stretch",
  },
  stepBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: BUTTER_DEEP,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: ORANGE_DARK, fontWeight: "900", fontSize: 14 },

  minutesBox: {
    flex: 2,
    backgroundColor: INPUT_FILL,
    borderWidth: 2,
    borderColor: INPUT_BORDER,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  minutesText: { color: ORANGE_DARK, fontWeight: "900", fontSize: 16 },
  minutesUnit: { fontWeight: "800", opacity: 0.8 },

  startBtn: {
    alignSelf: "stretch",
    paddingVertical: 10,
    backgroundColor: ORANGE_DARK,
    borderWidth: 3,
    borderColor: ORANGE_DARK,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtnText: { color: BUTTER, fontWeight: "900", fontSize: 15 },

  running: { alignItems: "center", gap: 4, paddingVertical: 6 },
  bigTime: { fontSize: 36, fontWeight: "900", letterSpacing: 0.5, color: ORANGE_DARK },
});




