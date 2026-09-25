/**
 * Maps a given (X, Y) coordinate in the Valence-Arousal circumplex
 * to a nuanced emotion string based on angle and magnitude.
 * 
 * X (Valence): -1.0 (Negative) to 1.0 (Positive)
 * Y (Arousal): -1.0 (Low) to 1.0 (High)
 */
export function getEmotionFromCoords(x: number, y: number): string {
  // Calculate magnitude (intensity) and angle (emotion type)
  const magnitude = Math.hypot(x, y);
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  
  // Normalize angle to [0, 360) degrees
  if (angle < 0) {
    angle += 360;
  }

  // Handle neutral center
  if (magnitude < 0.15) return "Neutral";
  if (magnitude < 0.30) return "Apathetic";

  // Divide the circumplex into 12 sectors of 30 degrees each.
  // Shift by 15 degrees so sector 0 is centered exactly on the X-axis (0 degrees).
  const sector = Math.floor(((angle + 15) % 360) / 30);
  
  // Determine intensity tier (0: Moderate, 1: High)
  const intensity = magnitude < 0.65 ? 0 : 1;

  // Emotion Dictionary (12 sectors x 2 intensities = 24 words)
  const emotionMap: Record<number, string[]> = {
    0: ["Pleased", "Joyful"],             // Right (Valence +, Arousal 0)
    1: ["Amused", "Excited"],             // (Valence +, Arousal +)
    2: ["Focused", "Euphoric"],           // (Valence +, Arousal ++)
    3: ["Alert", "Frenzied"],             // Top (Valence 0, Arousal +)
    4: ["Tense", "Panicked"],             // (Valence -, Arousal ++)
    5: ["Annoyed", "Enraged"],            // (Valence -, Arousal +)
    6: ["Upset", "Devastated"],           // Left (Valence -, Arousal 0)
    7: ["Sad", "Melancholy"],             // (Valence -, Arousal -)
    8: ["Bored", "Despondent"],           // (Valence -, Arousal --)
    9: ["Tired", "Lethargic"],            // Bottom (Valence 0, Arousal -)
    10: ["Calm", "Tranquil"],             // (Valence +, Arousal --)
    11: ["Relaxed", "Serene"],            // (Valence +, Arousal -)
  };

  return emotionMap[sector][intensity];
}
