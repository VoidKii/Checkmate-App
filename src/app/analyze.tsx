import { useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Chess } from 'chess.js';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#07111f';
const CARD = '#0d1b2a';
const WHITE = '#f7f9fc';
const MUTED = '#8ea0b8';
const ACCENT = '#39d98a';
const LIGHT = '#e8edf2';
const DARK = '#78909c';
const PIECES: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

type Frame = { fen: string; san: string };
type BestMove = { from: string; to: string; san: string; uci: string };

export default function AnalyzeScreen() {
  const engineRef = useRef<WebView>(null);
  const [pgn, setPgn] = useState('');
  const [frames, setFrames] = useState<Frame[]>([]);
  const [index, setIndex] = useState(0);
  const [engineReady, setEngineReady] = useState(false);
  const [engineStatus, setEngineStatus] = useState('Starting offline engine…');
  const [best, setBest] = useState<BestMove | null>(null);
  const [evaluation, setEvaluation] = useState('—');
  const [depth, setDepth] = useState(0);

  const current = frames[index];
  const game = useMemo(() => new Chess(current?.fen || undefined), [current?.fen]);
  const board = game.board();
  const canReview = frames.length > 0;

  const loadPgn = () => {
    if (!pgn.trim()) {
      Alert.alert('Paste a game first', 'Copy the PGN of a finished game and paste it here.');
      return;
    }
    try {
      const parsed = new Chess();
      parsed.loadPgn(pgn.trim());
      const header = parsed.header();
      const startFen = header.FEN || new Chess().fen();
      const replay = new Chess(startFen);
      const sans = parsed.history();
      const nextFrames: Frame[] = [{ fen: startFen, san: 'Start position' }];
      for (const san of sans) {
        const move = replay.move(san);
        if (!move) throw new Error('The PGN contains an invalid move.');
        nextFrames.push({ fen: replay.fen(), san: move.san });
      }
      setFrames(nextFrames);
      setIndex(nextFrames.length - 1);
      setBest(null);
      setEvaluation('—');
      setDepth(0);
      setEngineStatus(`Loaded ${sans.length} moves. Ready to review.`);
      setPgn('');
    } catch (error) {
      Alert.alert('Could not load PGN', error instanceof Error ? error.message : 'Check that the copied PGN is complete.');
    }
  };

  const analyze = () => {
    if (!current || !engineReady) return;
    setBest(null);
    setEvaluation('Calculating…');
    setDepth(0);
    setEngineStatus('Analyzing this position locally…');
    engineRef.current?.postMessage(JSON.stringify({
      type: 'analyze',
      fen: current.fen,
      depth: 12,
    }));
  };

  const onEngineMessage = (event: WebViewMessageEvent) => {
    const raw = event.nativeEvent.data;
    if (raw === 'READY') {
      setEngineReady(true);
      setEngineStatus('Stockfish ready · Offline');
      return;
    }
    try {
      const message = JSON.parse(raw);
      if (message.type === 'error') {
        setEngineStatus(message.message || 'Engine error');
        return;
      }
      if (message.type !== 'line' || typeof message.line !== 'string') return;
      const line: string = message.line;
      const d = line.match(/\bdepth (\d+)/);
      const cp = line.match(/\bscore cp (-?\d+)/);
      const mate = line.match(/\bscore mate (-?\d+)/);
      if (d) setDepth(Number(d[1]));
      if (cp && current) {
        const score = Number(cp[1]) / 100 * (game.turn() === 'w' ? 1 : -1);
        setEvaluation(`${score >= 0 ? '+' : ''}${score.toFixed(2)}`);
      } else if (mate) {
        const moves = Number(mate[1]) * (game.turn() === 'w' ? 1 : -1);
        setEvaluation(`M${moves > 0 ? '+' : ''}${moves}`);
      }
      const bestMatch = line.match(/^bestmove\s+([a-h][1-8][a-h][1-8][qrbn]?)/);
      if (bestMatch && current) {
        const uci = bestMatch[1];
        const probe = new Chess(current.fen);
        const move = probe.move({
          from: uci.slice(0, 2),
          to: uci.slice(2, 4),
          ...(uci[4] ? { promotion: uci[4] } : {}),
        });
        if (move) {
          setBest({ from: uci.slice(0, 2), to: uci.slice(2, 4), san: move.san, uci });
          setEngineStatus('Analysis complete · Stored only on this device');
        } else {
          setEngineStatus('No legal move in this position.');
        }
      }
    } catch {
      // Ignore non-JSON engine chatter.
    }
  };

  const goTo = (next: number) => {
    setIndex(Math.max(0, Math.min(frames.length - 1, next)));
    setBest(null);
    setEvaluation('—');
    setDepth(0);
  };

  const bestLabel = best ? `${best.san}  ·  ${best.from} → ${best.to}` : 'No move analyzed yet';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}><Text style={styles.back}>‹</Text></Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Game Analysis</Text>
            <Text style={styles.subtitle}>Private · Offline · Post-game review</Text>
          </View>
          <View style={styles.engineDotWrap}><View style={[styles.engineDot, engineReady && styles.engineDotOn]} /></View>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.importCard}>
            <Text style={styles.cardTitle}>Import a finished game</Text>
            <Text style={styles.helper}>Paste the PGN from a completed game. Analysis runs on your phone; nothing is uploaded.</Text>
            <TextInput
              value={pgn}
              onChangeText={setPgn}
              placeholder={'[Event "Casual Game"]\n\n1. e4 e5 2. Nf3 Nc6 ...'}
              placeholderTextColor="#61758b"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.pgnInput}
              textAlignVertical="top"
            />
            <Pressable onPress={loadPgn} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Load game</Text>
            </Pressable>
          </View>

          {canReview ? (
            <>
              <View style={styles.boardHeader}>
                <Text style={styles.boardTitle}>POSITION</Text>
                <Text style={styles.moveCount}>{index === 0 ? 'Start' : `Move ${Math.ceil(index / 2)} · ${current?.san}`}</Text>
              </View>
              <View style={styles.board}>
                {board.map((row, r) => row.map((piece, c) => {
                  const square = `${'abcdefgh'[c]}${8 - r}`;
                  const isFrom = best?.from === square;
                  const isTo = best?.to === square;
                  return (
                    <View key={square} style={[styles.square, { backgroundColor: isFrom ? '#7aa65a' : isTo ? '#d9b84d' : (r + c) % 2 === 0 ? LIGHT : DARK }]}>
                      {piece ? <Text style={[styles.piece, { color: piece.color === 'w' ? '#fffdf5' : '#18212a' }]}>{PIECES[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}</Text> : null}
                      {r === 7 ? <Text style={styles.fileLabel}>{'abcdefgh'[c]}</Text> : null}
                      {c === 0 ? <Text style={styles.rankLabel}>{8 - r}</Text> : null}
                    </View>
                  );
                }))}
              </View>

              <View style={styles.navigation}>
                <Pressable disabled={index === 0} onPress={() => goTo(0)} style={[styles.navButton, index === 0 && styles.disabled]}><Text style={styles.navText}>|‹</Text></Pressable>
                <Pressable disabled={index === 0} onPress={() => goTo(index - 1)} style={[styles.navButton, index === 0 && styles.disabled]}><Text style={styles.navText}>‹</Text></Pressable>
                <Text style={styles.positionCount}>{index} / {frames.length - 1}</Text>
                <Pressable disabled={index >= frames.length - 1} onPress={() => goTo(index + 1)} style={[styles.navButton, index >= frames.length - 1 && styles.disabled]}><Text style={styles.navText}>›</Text></Pressable>
                <Pressable disabled={index >= frames.length - 1} onPress={() => goTo(frames.length - 1)} style={[styles.navButton, index >= frames.length - 1 && styles.disabled]}><Text style={styles.navText}>›|</Text></Pressable>
              </View>

              <View style={styles.analysisCard}>
                <View style={styles.analysisTop}>
                  <View>
                    <Text style={styles.cardEyebrow}>STOCKFISH 19 LITE</Text>
                    <Text style={styles.bestMove}>{best ? best.san : 'Ready to analyze'}</Text>
                    <Text style={styles.helper}>{bestLabel}</Text>
                  </View>
                  <View style={styles.evalBox}>
                    <Text style={styles.eval}>{evaluation}</Text>
                    <Text style={styles.evalCaption}>WHITE POV</Text>
                  </View>
                </View>
                <View style={styles.analysisMeta}>
                  <Text style={styles.metaText}>Depth {depth || '—'}</Text>
                  <Text style={styles.metaText}>{engineReady ? 'On-device engine' : engineStatus}</Text>
                </View>
                <Pressable disabled={!engineReady} onPress={analyze} style={[styles.primaryButton, !engineReady && styles.disabledButton]}>
                  <Text style={styles.primaryButtonText}>{engineReady ? 'Analyze position' : 'Loading engine…'}</Text>
                </Pressable>
                <Text style={styles.disclaimer}>For reviewing completed games and learning. This screen does not connect to Chess.com or play moves.</Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>♟</Text>
              <Text style={styles.emptyTitle}>Your board appears here</Text>
              <Text style={styles.helper}>Import a completed game to step through every position and ask Stockfish for its strongest continuation.</Text>
            </View>
          )}
          <Text style={styles.engineStatus}>{engineStatus}</Text>
        </ScrollView>

        {Platform.OS === 'android' ? (
          <WebView
            ref={engineRef}
            source={{ uri: 'file:///android_asset/stockfish/index.html' }}
            originWhitelist={['*']}
            javaScriptEnabled
            domStorageEnabled
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            onMessage={onEngineMessage}
            onError={() => setEngineStatus('Could not load the offline engine assets.')}
            style={styles.hiddenEngine}
          />
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  safe: { flex: 1 },
  header: { minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#14263a' },
  back: { color: WHITE, fontSize: 38, lineHeight: 42, width: 34 },
  headerCopy: { flex: 1, marginLeft: 8 },
  title: { color: WHITE, fontSize: 18, fontWeight: '900' },
  subtitle: { color: MUTED, fontSize: 10, marginTop: 3 },
  engineDotWrap: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#22354a', alignItems: 'center', justifyContent: 'center' },
  engineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#77899b' },
  engineDotOn: { backgroundColor: ACCENT },
  content: { padding: 16, paddingBottom: 36 },
  importCard: { backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: '#183149', padding: 16, marginBottom: 18 },
  cardTitle: { color: WHITE, fontSize: 16, fontWeight: '900' },
  helper: { color: MUTED, fontSize: 11, lineHeight: 17, marginTop: 6 },
  pgnInput: { minHeight: 94, maxHeight: 160, marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#07111f', borderWidth: 1, borderColor: '#20364d', color: WHITE, fontSize: 12, lineHeight: 18 },
  primaryButton: { backgroundColor: ACCENT, borderRadius: 12, minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingHorizontal: 14 },
  primaryButtonText: { color: '#03140c', fontSize: 13, fontWeight: '900' },
  boardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 },
  boardTitle: { color: MUTED, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 },
  moveCount: { color: WHITE, fontSize: 11, fontWeight: '700' },
  board: { width: '100%', aspectRatio: 1, flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden', borderRadius: 5, borderWidth: 1, borderColor: '#25384b' },
  square: { width: '12.5%', height: '12.5%', alignItems: 'center', justifyContent: 'center' },
  piece: { fontSize: 34, lineHeight: 39, textShadowColor: '#00000044', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  fileLabel: { position: 'absolute', bottom: 1, right: 3, fontSize: 8, color: '#24313b', fontWeight: '900' },
  rankLabel: { position: 'absolute', top: 1, left: 3, fontSize: 8, color: '#24313b', fontWeight: '900' },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, marginBottom: 16 },
  navButton: { width: 40, height: 36, backgroundColor: CARD, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1c3349' },
  navText: { color: WHITE, fontSize: 18, fontWeight: '800' },
  positionCount: { color: MUTED, minWidth: 70, textAlign: 'center', fontSize: 11, fontWeight: '800' },
  disabled: { opacity: 0.3 },
  analysisCard: { backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: '#183149', padding: 16 },
  analysisTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardEyebrow: { color: ACCENT, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  bestMove: { color: WHITE, fontSize: 25, fontWeight: '900', marginTop: 5 },
  evalBox: { minWidth: 72, padding: 10, backgroundColor: '#07111f', borderRadius: 12, alignItems: 'center' },
  eval: { color: WHITE, fontSize: 19, fontWeight: '900' },
  evalCaption: { color: MUTED, fontSize: 8, marginTop: 2, letterSpacing: 1 },
  analysisMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 2 },
  metaText: { color: MUTED, fontSize: 10 },
  disabledButton: { opacity: 0.45 },
  disclaimer: { color: '#74869a', fontSize: 9, lineHeight: 14, marginTop: 10, textAlign: 'center' },
  emptyCard: { alignItems: 'center', backgroundColor: CARD, borderRadius: 18, borderWidth: 1, borderColor: '#183149', padding: 24, marginTop: 8 },
  emptyIcon: { color: ACCENT, fontSize: 32 },
  emptyTitle: { color: WHITE, fontSize: 15, fontWeight: '900', marginTop: 10 },
  engineStatus: { color: MUTED, fontSize: 10, textAlign: 'center', marginTop: 14 },
  hiddenEngine: { position: 'absolute', width: 1, height: 1, opacity: 0.01, bottom: 0, left: 0 },
});
