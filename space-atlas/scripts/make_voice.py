"""
Pre-record every English text with a natural American voice (Kokoro af_heart, Apache-2.0).

    pip install kokoro-onnx soundfile
    # model files: github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)
    npx tsx scripts/phrases.ts > phrases.json
    python scripts/make_voice.py phrases.json public/audio/en --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin

Writes <slug>.mp3 files plus manifest.json. Needs ffmpeg.
"""
import argparse, json, os, subprocess, tempfile
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ap = argparse.ArgumentParser()
ap.add_argument("phrases")
ap.add_argument("out")
ap.add_argument("--model", required=True)
ap.add_argument("--voices", required=True)
ap.add_argument("--voice", default="af_heart")
args = ap.parse_args()

kokoro = Kokoro(args.model, args.voices)
items = json.load(open(args.phrases))
os.makedirs(args.out, exist_ok=True)
# keep clips that are already there (lets you record only the new lines)
manifest_path = os.path.join(args.out, "manifest.json")
manifest = json.load(open(manifest_path)).get("clips", {}) if os.path.exists(manifest_path) else {}


# Words the voice should spell out or say in a special way
SAY_AS = {"UFO!": "U. F. O."}


def tts_text(t: str) -> str:
    """How the line is fed to the voice.

    Single shouted words ("EARTH!") get odd intonation from TTS models trained on sentences,
    so they are read as a calm short statement: "Earth."  ALL-CAPS is lower-cased so it is not
    spelled out letter by letter.
    """
    if t in SAY_AS:
        return SAY_AS[t]
    if t.upper() == t:
        t = t.capitalize()
        if len(t.split()) <= 2:
            t = t.rstrip("!") + "."
    return t


for it in items:
    text = tts_text(it["text"])
    single = len(text.split()) <= 2
    # espeak gives some British vowels; force General American r-coloured "ur" (Earth, Mercury, Saturn)
    ph = kokoro.tokenizer.phonemize(text, "en-us").replace("ɜː", "ɜɹ").replace("iəɹ", "ɪɹ").replace("ɹɹ", "ɹ")
    # Near-natural speed keeps consonants crisp; slowing the model below ~0.9 smears vowels.
    samples, sr = kokoro.create(ph, voice=args.voice, speed=0.92 if single else 0.95, lang="en-us", is_phonemes=True)
    # trim silence, add tiny fade so nothing clicks
    thr = 0.01 * np.max(np.abs(samples))
    idx = np.where(np.abs(samples) > thr)[0]
    samples = samples[max(0, idx[0] - int(0.03 * sr)) : idx[-1] + int(0.12 * sr)]
    # same loudness for every clip, with headroom (no clipping on iPad speakers)
    samples = samples * (0.89 / max(1e-6, float(np.max(np.abs(samples)))))
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        sf.write(f.name, samples, sr)
        wav = f.name
    mp3 = os.path.join(args.out, it["slug"] + ".mp3")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-b:a", "64k", mp3], check=True)
    os.unlink(wav)
    manifest[it["slug"]] = it["slug"] + ".mp3"
    print("ok", it["slug"], ph, round(len(samples) / sr, 2), "s")

json.dump({"voice": args.voice, "clips": dict(sorted(manifest.items()))}, open(manifest_path, "w"), indent=1)
