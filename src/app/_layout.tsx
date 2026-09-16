import { DarkTheme, ThemeProvider, Stack, router } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

const BG = '#07111f';
const PANEL = '#0a1726';
const BORDER = '#183149';
const MUTED = '#8ea0b8';
const WHITE = '#f7f9fc';
const ACCENT = '#39d98a';

const items = [
  ['⌂', 'Home', '/'],
  ['♟', 'Play', '/play'],
  ['🧩', 'Puzzles', '/puzzles'],
  ['🏆', 'Tournaments', '/tournaments'],
  ['👥', 'Friends', '/friends'],
  ['📊', 'Leaderboard', '/leaderboard'],
  ['👤', 'Profile', '/profile'],
  ['⚙', 'Settings', '/settings'],
] as const;

export default function RootLayout() {
  const desktop = Platform.OS === 'web';

  return (
    <ThemeProvider value={DarkTheme}>
      <View style={styles.root}>
        {desktop && (
          <View style={styles.sidebar}>
            <Pressable style={styles.brand} onPress={() => router.push('/')}>
              <Text style={styles.brandMark}>♞</Text>
              <View><Text style={styles.brandName}>CHECKMATE</Text><Text style={styles.brandTag}>Play. Think. Conquer.</Text></View>
            </Pressable>
            <Text style={styles.menuLabel}>MENU</Text>
            <View style={styles.menu}>
              {items.map(([icon, label, path]) => (
                <Pressable key={path} onPress={() => router.push(path as any)} style={({ hovered, pressed }) => [styles.menuItem, hovered && styles.menuHover, pressed && styles.menuPressed]}>
                  <Text style={styles.menuIcon}>{icon}</Text><Text style={styles.menuText}>{label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.sidebarBottom}>
              <View style={styles.userCard}><View style={styles.userAvatar}><Text style={styles.userAvatarText}>S</Text></View><View><Text style={styles.userName}>Player S</Text><Text style={styles.userRating}>1200 Rapid</Text></View></View>
              <Text style={styles.version}>CHECKMATE • WEB</Text>
            </View>
          </View>
        )}
        <View style={desktop ? styles.mainDesktop : styles.mainMobile}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row', backgroundColor: BG },
  sidebar: { width: 238, backgroundColor: PANEL, borderRightWidth: 1, borderRightColor: BORDER, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 18 },
  mainDesktop: { flex: 1, minWidth: 0 },
  mainMobile: { flex: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, marginBottom: 34 },
  brandMark: { color: ACCENT, fontSize: 32, marginRight: 10 },
  brandName: { color: WHITE, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  brandTag: { color: MUTED, fontSize: 9, marginTop: 3 },
  menuLabel: { color: '#526781', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, paddingHorizontal: 12, marginBottom: 8 },
  menu: { gap: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10 },
  menuHover: { backgroundColor: '#10253a' },
  menuPressed: { opacity: 0.7 },
  menuIcon: { width: 27, color: MUTED, fontSize: 17, textAlign: 'center', marginRight: 8 },
  menuText: { color: '#c5d0dd', fontSize: 13, fontWeight: '700' },
  sidebarBottom: { marginTop: 'auto' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1b2a', borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 10 },
  userAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#152b40', alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  userAvatarText: { color: WHITE, fontWeight: '900' },
  userName: { color: WHITE, fontSize: 12, fontWeight: '800' },
  userRating: { color: MUTED, fontSize: 10, marginTop: 2 },
  version: { color: '#40546b', fontSize: 8, textAlign: 'center', marginTop: 12, letterSpacing: 1 },
});
