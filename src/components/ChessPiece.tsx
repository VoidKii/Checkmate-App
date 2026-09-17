import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

type PieceColor = 'w' | 'b';
type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

const PIECE_URLS: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wP.svg',
    n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wN.svg',
    b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wB.svg',
    r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wR.svg',
    q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wQ.svg',
    k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/wK.svg',
  },
  b: {
    p: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bP.svg',
    n: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bN.svg',
    b: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bB.svg',
    r: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bR.svg',
    q: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bQ.svg',
    k: 'https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/bK.svg',
  },
};

export function ChessPiece({ color, type }: { color: PieceColor; type: PieceType }) {
  return <Image source={{ uri: PIECE_URLS[color][type] }} style={styles.piece} contentFit="contain" cachePolicy="memory-disk" />;
}

const styles = StyleSheet.create({
  piece: {
    width: '88%',
    height: '88%',
  },
});
