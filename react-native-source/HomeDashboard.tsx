import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { BrainCircuit, Moon, CheckCircle2, Flame, Plus, Coffee } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// STRICT DESIGN SYSTEM TOKENS
const TOKENS = {
  colors: {
    bg: '#0A0A0A',
    surface: '#141414',
    surface2: '#1E1E1E',
    primary: '#7C6FF7', // Purple
    secondary: '#F7A06F', // Orange
    blue: '#6FBBF7',
    green: '#6FF7A0',
    gold: '#F7D96F',
    text: '#F0F0F0',
    textMuted: '#888888',
    error: '#F76F6F',
    success: '#6FF7A0',
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  radius: {
    card: 20,
    button: 14,
    pill: 999,
  }
};

export default function HomeDashboard() {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [questCompleted, setQuestCompleted] = useState(false);

  // Micro-interaction for pressing the upcoming quest
  const handleQuestPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const handleQuestPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  const completeQuest = () => {
    setQuestCompleted(true);
    // XP float up animation state linkage would execute here via Zustand
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={TOKENS.colors.bg} />
      
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateText}>WEDNESDAY, OCT 24</Text>
            <Text style={styles.greetingText}>Ready, Alex.</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={16} color={TOKENS.colors.secondary} strokeWidth={2.5} />
            <Text style={styles.streakText}>4</Text>
          </View>
        </View>

        {/* ANCHOR TIMELINE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S ANCHORS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
            {/* Active Anchor Block */}
            <View style={[styles.anchorCard, styles.anchorActive]}>
              <Text style={styles.anchorTimeTextActive}>08:00 - 15:00</Text>
              <Text style={styles.anchorTitleTextActive}>High School</Text>
              <View style={styles.fluidBarOuter}>
                <View style={[styles.fluidBarInner, { width: '40%' }]} />
              </View>
            </View>
            
            {/* Upcoming Anchor Block */}
            <View style={styles.anchorCard}>
              <Text style={styles.anchorTimeText}>16:00 - 18:30</Text>
              <Text style={styles.anchorTitleText}>Marching Band</Text>
            </View>
          </ScrollView>
        </View>

        {/* SLEEP INTEL METRICS */}
        <View style={styles.section}>
          <View style={styles.sleepIntelCard}>
            <View style={styles.sleepHeader}>
              <View style={styles.titleRowFlex}>
                <Moon size={20} color={TOKENS.colors.primary} />
                <Text style={styles.cardTitle}>Sleep Battery</Text>
              </View>
              <Text style={styles.sleepDebtText}>-1.2h debt</Text>
            </View>
            <View style={styles.batteryContainer}>
              <View style={[styles.batterySegment, { backgroundColor: TOKENS.colors.primary }]} />
              <View style={[styles.batterySegment, { backgroundColor: TOKENS.colors.primary }]} />
              <View style={[styles.batterySegment, { backgroundColor: TOKENS.colors.primary }]} />
              <View style={[styles.batterySegment, { backgroundColor: TOKENS.colors.primary, opacity: 0.5 }]} />
              <View style={[styles.batterySegment, { backgroundColor: TOKENS.colors.surface2 }]} />
            </View>
            <Text style={styles.sleepSubtext}>Phone down target: 10:30 PM</Text>
          </View>
        </View>

        {/* UPCOMING GAP TASKS / NUDGES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPCOMING GAP (15:00 - 16:00)</Text>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable 
              onPressIn={handleQuestPressIn}
              onPressOut={handleQuestPressOut}
              onPress={completeQuest}
              style={[
                styles.questCard, 
                questCompleted && styles.questCardCompleted
              ]}
            >
              <View style={styles.questContent}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(247,160,111,0.1)' }]}>
                  <Coffee size={24} color={TOKENS.colors.secondary} />
                </View>
                <View style={styles.questTextContent}>
                  <Text style={[styles.questTitle, questCompleted && styles.textStrike]}>
                    Fuel Up (Snack)
                  </Text>
                  <Text style={styles.questSubtext}>10 mins • Earn +10 XP</Text>
                </View>
              </View>
              <CheckCircle2 
                size={28} 
                color={questCompleted ? TOKENS.colors.success : TOKENS.colors.surface2} 
              />
            </Pressable>
          </Animated.View>
        </View>
        
        {/* Spacer for Floating Action Button avoiding lower notch area */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* QUICK CAPTURE 'BRAIN DUMP' FAB */}
      <Pressable style={styles.fab}>
        <Plus size={32} color={TOKENS.colors.text} />
      </Pressable>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TOKENS.colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: TOKENS.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: TOKENS.spacing.xl,
    marginBottom: TOKENS.spacing.lg,
  },
  dateText: {
    color: TOKENS.colors.textMuted,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: TOKENS.spacing.xs,
  },
  greetingText: {
    color: TOKENS.colors.text,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 28,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247,160,111,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: TOKENS.radius.pill,
    gap: 4,
  },
  streakText: {
    color: TOKENS.colors.secondary,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
  },
  section: {
    marginTop: TOKENS.spacing.xl,
  },
  sectionTitle: {
    color: TOKENS.colors.textMuted,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: TOKENS.spacing.md,
  },
  timelineScroll: {
    overflow: 'visible',
  },
  anchorCard: {
    backgroundColor: TOKENS.colors.surface,
    borderRadius: TOKENS.radius.card,
    padding: TOKENS.spacing.lg,
    marginRight: TOKENS.spacing.md,
    width: width * 0.65,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  anchorActive: {
    borderColor: TOKENS.colors.primary,
    backgroundColor: TOKENS.colors.surface2,
  },
  anchorTimeText: {
    color: TOKENS.colors.textMuted,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
  },
  anchorTitleText: {
    color: TOKENS.colors.text,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 18,
  },
  anchorTimeTextActive: {
    color: TOKENS.colors.primary,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 4,
  },
  anchorTitleTextActive: {
    color: TOKENS.colors.text,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: TOKENS.spacing.md,
  },
  fluidBarOuter: {
    height: 6,
    backgroundColor: TOKENS.colors.bg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fluidBarInner: {
    height: '100%',
    backgroundColor: TOKENS.colors.primary,
  },
  sleepIntelCard: {
    backgroundColor: TOKENS.colors.surface,
    borderRadius: TOKENS.radius.card,
    padding: TOKENS.spacing.lg,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: TOKENS.spacing.md,
  },
  titleRowFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: TOKENS.colors.text,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 16,
  },
  sleepDebtText: {
    color: TOKENS.colors.error,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
  },
  batteryContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 16,
    marginBottom: TOKENS.spacing.md,
  },
  batterySegment: {
    flex: 1,
    borderRadius: 4,
  },
  sleepSubtext: {
    color: TOKENS.colors.textMuted,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
  },
  questCard: {
    backgroundColor: TOKENS.colors.surface,
    borderRadius: TOKENS.radius.card,
    padding: TOKENS.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  questCardCompleted: {
    opacity: 0.6,
    borderColor: TOKENS.colors.success,
  },
  questContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questTextContent: {
    justifyContent: 'center',
  },
  questTitle: {
    color: TOKENS.colors.text,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  textStrike: {
    textDecorationLine: 'line-through',
    color: TOKENS.colors.textMuted,
  },
  questSubtext: {
    color: TOKENS.colors.gold,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: TOKENS.spacing.xxl,
    right: TOKENS.spacing.lg,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: TOKENS.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: TOKENS.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  }
});
