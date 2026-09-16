import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#07111f';
const CARD = '#0d1b2a';
const WHITE = '#f7f9fc';
const MUTED = '#8ea0b8';
const ACCENT = '#39d98a';

export default function PlayScreen() {
  return <View style={styles.root}>
    <LinearGradient colors={['#0b1d31', BG, '#050b14']} style={StyleSheet.absoluteFill} />
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable><Text style={styles.title}>Play Chess</Text><View style={{ width: 30 }} /></View>
      <Text style={styles.subtitle}>Choose how you want to play</Text>
      <Mode title="⚡  Quick Match" text="Find a real opponent automatically" button="Find Match" onPress={() => router.push('/game')} />
      <Mode title="♟  Play a Friend" text="Create a private room and invite someone" button="Create Room" onPress={() => router.push('/game')} />
      <Mode title="🤖  Play Bots" text="Practice against a computer" button="Play Bot" onPress={() => router.push('/game')} />
    </SafeAreaView>
  </View>;
}

function Mode({ title, text, button, onPress }: { title: string; text: string; button: string; onPress: () => void }) {
  return <View style={styles.card}><Text style={styles.modeTitle}>{title}</Text><Text style={styles.text}>{text}</Text><Pressable style={styles.button} onPress={onPress}><Text style={styles.buttonText}>{button}</Text></Pressable></View>;
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: BG }, safe: { flex: 1, padding: 20 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, back: { color: WHITE, fontSize: 38, lineHeight: 38 }, title: { color: WHITE, fontSize: 22, fontWeight: '900' }, subtitle: { color: MUTED, fontSize: 14, marginBottom: 22 }, card: { backgroundColor: CARD, borderRadius: 20, borderWidth: 1, borderColor: '#183149', padding: 20, marginBottom: 14 }, modeTitle: { color: WHITE, fontSize: 18, fontWeight: '800' }, text: { color: MUTED, fontSize: 13, marginTop: 7, marginBottom: 17 }, button: { backgroundColor: ACCENT, borderRadius: 12, padding: 13, alignItems: 'center' }, buttonText: { color: '#03140c', fontWeight: '900' } });