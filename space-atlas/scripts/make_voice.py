"""
Pre-record every English text with a natural American male voice (Kokoro, Apache-2.0).

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
ap.add_argument("--voice", default="am_michael")
args = ap.parse_args()

kokoro = Kokoro(args.model, args.voices)
items = json.load(open(args.phrases))
os.makedirs(args.out, exist_ok=True)
manifest = {}


def tts_text(t: str) -> str:
    # "SOLAR SYSTEM!" -> "Solar system!" so it is read as words, not letters
    return t.capitalize() if t.upper() == t else t


for it in items:
    text = tts_text(it["text"])
    single = len(text.split()) <= 2
    # espeak gives some British vowels; force General American r-coloured "ur" (Earth, Mercury, Saturn)
    ph = kokoro.tokenizer.phonemize(text, "en-us").replace("ɜː", "ɜɹ").replace("ɹɹ", "ɹ")
    samples, sr = kokoro.create(ph, voice=args.voice, speed=0.82 if single else 0.9, lang="en-us", is_phonemes=True)
    # trim silence, add tiny fade so nothing clicks
    thr = 0.01 * np.max(np.abs(samples))
    idx = np.where(np.abs(samples) > thr)[0]
    samples = samples[max(0, idx[0] - int(0.03 * sr)) : idx[-1] + int(0.12 * sr)]
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
        sf.write(f.name, samples, sr)
        wav = f.name
    mp3 = os.path.join(args.out, it["slug"] + ".mp3")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", wav, "-ac", "1", "-b:a", "64k", mp3], check=True)
    os.unlink(wav)
    manifest[it["slug"]] = it["slug"] + ".mp3"
    print("ok", it["slug"], ph, round(len(samples) / sr, 2), "s")

json.dump({"voice": args.voice, "clips": manifest}, open(os.path.join(args.out, "manifest.json"), "w"), indent=1)
