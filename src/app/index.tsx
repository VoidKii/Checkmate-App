import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#07111f';
const CARD = '#0d1b2a';
const MUTED = '#8ea0b8';
const WHITE = '#f7f9fc';
const ACCENT = '#39d98a';

export default function HomeScreen() {
  const desktop = Platform.OS === 'web';
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0b1d31', BG, '#050b14']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={[styles.content, desktop && styles.desktopContent]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View><Text style={styles.logo}>CHECKMATE</Text><Text style={styles.tagline}>Play. Think. Conquer.</Text></View>
            <Pressable style={styles.avatar} onPress={() => router.push('/profile')}><Text style={styles.avatarText}>S</Text></Pressable>
          </View>
          <View style={styles.hero}>
            <Text style={styles.kicker}>YOUR NEXT MOVE</Text><Text style={styles.heroTitle}>Ready to play?</Text>
            <Text style={styles.heroText}>Challenge friends, find opponents, and sharpen your chess.</Text>
            <Pressable style={styles.primary} onPress={() => router.push('/play')}><Text style={styles.primaryText}>♟  Play Chess</Text></Pressable>
          </View>
          <Text style={styles.sectionTitle}>Play</Text>
          <View style={styles.grid}>
            <ActionCard icon="⚡" title="Quick Match" subtitle="Find an opponent" onPress={() => router.push('/play')} />
            <ActionCard icon="♟" title="Play a Friend" subtitle="Private room" onPress={() => router.push('/play')} />
            <ActionCard icon="🤖" title="Play Bots" subtitle="Practice offline" onPress={() => router.push('/game')} />
            <ActionCard icon="🧩" title="Puzzles" subtitle="Train your tactics" onPress={() => router.push('/puzzles')} />
          </View>
          <View style={styles.statsCard}><Text style={styles.statsLabel}>RAPID RATING</Text><Text style={styles.rating}>1200</Text><View style={styles.statRow}><Stat label="Games" value="0" /><Stat label="Wins" value="0" /><Stat label="Win rate" value="—" /></View></View>
        </ScrollView>
        {!desktop && <View style={styles.nav}><NavItem icon="⌂" label="Home" active /><NavItem icon="♟" label="Play" onPress={() => router.push('/play')} /><NavItem icon="🧩" label="Puzzles" onPress={() => router.push('/puzzles')} /><NavItem icon="●" label="Profile" onPress={() => router.push('/profile')} /></View>}
      </SafeAreaView>
    </View>
  );
}

function ActionCard({ icon, title, subtitle, onPress }: { icon: string; title: string; subtitle: string; onPress: () => void }) { return <Pressable style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]} onPress={onPress}><Text style={styles.actionIcon}>{icon}</Text><Text style={styles.actionTitle}>{title}</Text><Text style={styles.actionSubtitle}>{subtitle}</Text></Pressable>; }
function Stat({ label, value }: { label: string; value: string }) { return <View><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>; }
function NavItem({ icon, label, active, onPress }: { icon: string; label: string; active?: boolean; onPress?: () => void }) { return <Pressable onPress={onPress} style={styles.navItem}><Text style={[styles.navIcon, active && styles.active]}>{icon}</Text><Text style={[styles.navLabel, active && styles.active]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG }, safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 110 },
  desktopContent: { paddingHorizontal: 42, paddingTop: 30, paddingBottom: 40, maxWidth: 1180, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  logo: { color: WHITE, fontSize: 21, fontWeight: '900', letterSpacing: 3 }, tagline: { color: MUTED, fontSize: 12, marginTop: 4 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#152b40', borderWidth: 1, borderColor: '#29425c', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: WHITE, fontWeight: '800', fontSize: 17 },
  hero: { backgroundColor: CARD, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#183149', marginBottom: 28 }, kicker: { color: ACCENT, fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },
  heroTitle: { color: WHITE, fontSize: 36, fontWeight: '900', marginTop: 8 }, heroText: { color: MUTED, fontSize: 14, lineHeight: 21, marginTop: 8, marginBottom: 20 },
  primary: { backgroundColor: ACCENT, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 24, alignItems: 'center', alignSelf: 'flex-start', minWidth: 180 }, primaryText: { color: '#03140c', fontSize: 16, fontWeight: '900' },
  sectionTitle: { color: WHITE, fontSize: 20, fontWeight: '800', marginBottom: 12 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { flex: 1, minWidth: 190, minHeight: 128, backgroundColor: CARD, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#183149' }, pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  actionIcon: { fontSize: 25, marginBottom: 10 }, actionTitle: { color: WHITE, fontSize: 15, fontWeight: '800' }, actionSubtitle: { color: MUTED, fontSize: 12, marginTop: 5 },
  statsCard: { backgroundColor: CARD, borderRadius: 20, padding: 20, marginTop: 28, borderWidth: 1, borderColor: '#183149' }, statsLabel: { color: MUTED, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }, rating: { color: WHITE, fontSize: 38, fontWeight: '900', marginTop: 3 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#183149' }, statValue: { color: WHITE, fontSize: 16, fontWeight: '800' }, statLabel: { color: MUTED, fontSize: 11, marginTop: 3 },
  nav: { position: 'absolute', left: 14, right: 14, bottom: 10, height: 68, backgroundColor: '#0b1827', borderRadius: 22, borderWidth: 1, borderColor: '#183149', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }, navItem: { alignItems: 'center', minWidth: 60 }, navIcon: { color: MUTED, fontSize: 20 }, navLabel: { color: MUTED, fontSize: 10, marginTop: 3 }, active: { color: ACCENT },
});
