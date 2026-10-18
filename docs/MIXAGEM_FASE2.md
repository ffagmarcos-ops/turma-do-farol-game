# Mixagem da Fase 2 (luta do polvo), v3.3

Cadeia: fonte → ganho da faixa → barramento → master (mudo) → **limitador** (DynamicsCompressor: limiar -3 dB, razão 20:1, ataque 3 ms, release 150 ms) → saída.
Barramentos base: música 0,6 · ambiente 0,45 · efeitos 0,8 · UI 0,5, multiplicados pelas preferências MÚSICA / EFEITOS do jogador (tela SOM).

| Camada | Arquivo (LUFS medido) | Ganho no jogo | Nível na mistura (aprox.) |
|---|---|---|---|
| Música de chefe (abertura + loop) | -16,4 / -16,5 | 1,0 × bus 0,6 | **≈ -20,4 LUFS** |
| Pirate's Orchestra (≤ 28% de vida, até o fim) | -16,4 | 1,0 × bus 0,6 | **≈ -20,4 LUFS** |
| Tambor sintetizado (só na fúria final, ≤ 5%) | pico 0,11 | no barramento de música | sutil, ≈ -19 dB abaixo do pico da música |
| Chuva (loop) | -29,9 | 0,32 × 0,45 | ≈ -47 LUFS (fundo, não mascara nada) |
| Mar (loop) | -23,8 | 0,30 × 0,45 | ≈ -41 LUFS |
| Trovão | -20,5 | 1,0 × 0,8 | ≈ -22 LUFS em picos curtos |
| Splash | -26,5 | 1,6 a 2,2 (×1,6 de ajuste) × 0,8 | ≈ -20 a -23 LUFS |
| Pancadas no barco | -11,8 | 0,6 de ajuste × 0,8 | ≈ -18 LUFS (antes ≈ -14, estourava) |
| Aparelho sônico, golpes, rugido, tinta (sintetizados) | n/a | 0,25 a 1,3 × 0,8 | acima da música |

## O que foi corrigido
- **Tambor fora do tempo:** antes, 150 bpm fixos (setInterval de 400 ms, ganho 0,32) contra a orquestra em ~72 bpm (0,836 s, medido por autocorrelação). Agora ele é agendado no relógio de áudio, no pulso da orquestra, com ganho 0,11.
- **Crossfade que pulava:** antes era linear, 2,5 s, com queda de ~3 dB no meio, e a abertura não entrava no fade (se os 28% chegassem durante a abertura, as duas músicas tocavam juntas). Agora o fade é de 4 s em curva seno/cosseno (potência constante) e a abertura também sai.
- **Clipping:** limitador no master. A chuva e o mar ficaram mais baixos e os trovões e splashes mais altos, para os efeitos ficarem acima da música.
