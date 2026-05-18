import { ByondClient } from ".";

export type VolumeMode = "normal" | "yell" | "whisper" | "radio";

interface VoiceProfile {
	pitch: number;
	rate: number;
	effects: EffectType[];
}

type EffectType =
	| "buzz"
	| "flutter"
	| "bandpass"
	| "robotic"
	| "bitcrush"
	| "lowpass"
	| "distortion"
	| "rumble";

const VOICE_PROFILES: Record<string, VoiceProfile> = {
	"says":      { pitch: 1.0,  rate: 1.0,  effects: [] },
	"hisses":    { pitch: 0.6,  rate: 0.85, effects: ["rumble"] },
	"buzzes":    { pitch: 1.4,  rate: 1.0,  effects: ["buzz"] },
	"flutters":  { pitch: 1.5,  rate: 1.0,  effects: ["flutter"] },
	"rattles":   { pitch: 0.9,  rate: 0.8,  effects: ["bandpass"] },
	"states":    { pitch: 1.0,  rate: 0.9,  effects: ["robotic"] },
	"beep boops":{ pitch: 1.0,  rate: 0.9,  effects: ["robotic", "bitcrush"] },
	"honks":     { pitch: 1.0,  rate: 1.1,  effects: [] }, // special handling per-word
	"moans":     { pitch: 0.4,  rate: 0.6,  effects: ["distortion", "rumble"] },
	"chirps":    { pitch: 1.6,  rate: 1.3,  effects: [] },
	"blurbles":  { pitch: 0.7,  rate: 0.9,  effects: ["lowpass"] },
	"poofs":     { pitch: 0.7,  rate: 0.85, effects: ["lowpass"] },
	"slurs":     { pitch: 0.7,  rate: 0.5,  effects: [] },
	"grunts":    { pitch: 0.35, rate: 0.8,  effects: ["rumble"] },
	"intones":   { pitch: 0.8,  rate: 0.85, effects: ["bandpass"] },
	"declares":  { pitch: 1.05, rate: 0.95, effects: [] },
	"gibbers":   { pitch: 2.0,  rate: 1.8,  effects: [] },
	"clicks":    { pitch: 0.75, rate: 0.7,  effects: ["robotic"] },
	"screeches": { pitch: 1.7,  rate: 1.2,  effects: [] },
};

// Tile size in world units
const TILE_SIZE = 1.0;

// Range configs per volume mode (in tiles)
const RANGE_CONFIG: Record<VolumeMode, { full: number; max: number; gain: number }> = {
	normal:  { full: 2, max: 7,  gain: 1.0 },
	yell:    { full: 4, max: 14, gain: 1.3 },
	whisper: { full: 0, max: 1,  gain: 0.5 },
	radio:   { full: 7, max: 7,  gain: 0.8 },
};

export class TTSManager {
	ctx: AudioContext;
	enabled = true;
	private speaking = new Map<number, SpeechSynthesisUtterance>();
	voices: SpeechSynthesisVoice[] = [];
	male_voice: SpeechSynthesisVoice | null = null;
	female_voice: SpeechSynthesisVoice | null = null;

	constructor(public client: ByondClient) {
		this.ctx = client.sound_player.ctx;
		this.init_voices();
		speechSynthesis.addEventListener("voiceschanged", () => this.init_voices());
	}

	private init_voices() {
		this.voices = speechSynthesis.getVoices();
		if (this.voices.length === 0) return;

		// Google US English respects pitch/rate; Google UK voices do not.
		this.male_voice =
			this.voices.find(v => v.name.includes("Google US English")) ??
			this.voices.find(v => v.name.includes("Microsoft David")) ??
			this.voices.find(v => v.name.includes("Google UK English Male")) ??
			this.voices[0];

		this.female_voice =
			this.voices.find(v => v.name.includes("Google US English")) ??
			this.voices.find(v => v.name.includes("Microsoft Zira")) ??
			this.voices.find(v => v.name.includes("Google UK English Female")) ??
			this.voices[0];
	}

	toggle() {
		this.enabled = !this.enabled;
		if (!this.enabled) {
			speechSynthesis.cancel();
			this.speaking.clear();
		}
		return this.enabled;
	}

	speak(speaker_ref: number, say_mod: string, volume_mod: VolumeMode, gender: "male" | "female", message: string) {
		if (!this.enabled) return;
		if (!message.trim()) return;

		// Cancel any existing speech from this speaker
		let existing = this.speaking.get(speaker_ref);
		if (existing) {
			speechSynthesis.cancel();
			this.speaking.clear();
		}

		let profile = VOICE_PROFILES[say_mod] || VOICE_PROFILES["says"];
		let voice = gender === "female" ? this.female_voice : this.male_voice;

		// Honks get special per-word random pitch treatment
		if (say_mod === "honks") {
			this.speak_honk(speaker_ref, volume_mod, voice, message);
			return;
		}

		let text = this.clean_message(message);
		if (!text) return;

		let utter = new SpeechSynthesisUtterance(text);
		if (voice) utter.voice = voice;

		// Count exclamation marks in raw message — each extra ! past 1 raises pitch/rate.
		// Capped at 5 extra to prevent screech. Counted before clean_message collapses them.
		let exclaim_bonus = Math.min(5, Math.max(0, (message.match(/!/g) || []).length - 1)) * 0.05;
		utter.pitch = this.clamp_pitch(profile.pitch + exclaim_bonus);
		utter.rate = this.clamp_rate(profile.rate + exclaim_bonus * 0.5);

		// Apply volume_mod adjustments
		if (volume_mod === "yell") {
			utter.rate *= 1.1;
			utter.volume = 1.0;
		} else if (volume_mod === "whisper") {
			utter.rate *= 0.85;
			utter.volume = 0.3;
		} else if (volume_mod === "radio") {
			utter.volume = 0.7;
		} else {
			utter.volume = this.calc_proximity_volume(speaker_ref, volume_mod);
		}

		this.speaking.set(speaker_ref, utter);
		utter.onend = () => this.speaking.delete(speaker_ref);
		utter.onerror = () => this.speaking.delete(speaker_ref);

		// For effect voices, route through Web Audio API
		if (profile.effects.length > 0 || volume_mod === "radio" || volume_mod === "yell") {
			this.speak_with_effects(utter, profile.effects, volume_mod, speaker_ref);
		} else {
			// Apply proximity volume for plain voices
			utter.volume = this.calc_proximity_volume(speaker_ref, volume_mod);
			console.log("TTS DEBUG:", say_mod, "pitch:", utter.pitch, "rate:", utter.rate, "voice:", utter.voice?.name);
			speechSynthesis.speak(utter);
		}
	}

	private speak_honk(speaker_ref: number, volume_mod: VolumeMode, voice: SpeechSynthesisVoice | null, message: string) {
		let text = this.clean_message(message);
		if (!text) return;

		// Split into sentences (by . ! ? or fallback to full message)
		let sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 0);
		if (sentences.length === 0) sentences = [text];

		let base_volume = this.calc_proximity_volume(speaker_ref, volume_mod);

		// Delirium style: each sentence gets a different random pitch
		for (let i = 0; i < sentences.length; i++) {
			let utter = new SpeechSynthesisUtterance(sentences[i]);
			if (voice) utter.voice = voice;
			utter.pitch = this.clamp_pitch(0.3 + Math.random() * 1.7);
			utter.rate = this.clamp_rate(1.0 + Math.random() * 0.4);
			utter.volume = base_volume;
			if (i === sentences.length - 1) {
				utter.onend = () => this.speaking.delete(speaker_ref);
			}
			utter.onerror = () => this.speaking.delete(speaker_ref);
			this.speaking.set(speaker_ref, utter);
			speechSynthesis.speak(utter);
		}
	}

	private speak_with_effects(utter: SpeechSynthesisUtterance, effects: EffectType[], volume_mod: VolumeMode, speaker_ref: number) {
		// Web Audio API effects require a MediaStreamDestination approach
		// Since SpeechSynthesis doesn't natively route through Web Audio,
		// we use the utterance directly but apply pitch/rate manipulation
		// to simulate the effects. True audio graph routing would require
		// a media stream source which isn't available from SpeechSynthesis
		// in most browsers. Instead we approximate with pitch/rate/volume.

		let pitch_mod = 1.0;
		let rate_mod = 1.0;
		let vol_mod = 1.0;

		for (let effect of effects) {
			switch (effect) {
				case "buzz":
					// Simulate buzzing with slightly varied pitch
					pitch_mod *= 1.1;
					rate_mod *= 1.05;
					break;
				case "flutter":
					// Lighter, more wavering
					pitch_mod *= 1.15;
					rate_mod *= 0.95;
					break;
				case "bandpass":
					// Thinned out, muffled-ish: lower volume slightly
					vol_mod *= 0.75;
					break;
				case "robotic":
					// Flatten: force pitch toward 1.0, slow rate slightly
					pitch_mod = 1.0 / utter.pitch;
					rate_mod *= 0.9;
					break;
				case "bitcrush":
					// More extreme robotic
					rate_mod *= 0.85;
					vol_mod *= 0.9;
					break;
				case "lowpass":
					// Muffled: reduce volume
					vol_mod *= 0.65;
					break;
				case "distortion":
					// Grittier: pitch down, louder
					pitch_mod *= 0.85;
					vol_mod *= 1.1;
					break;
				case "rumble":
					// Deep undertone simulation
					pitch_mod *= 0.8;
					break;
			}
		}

		// Volume_mod overrides
		if (volume_mod === "yell") {
			vol_mod *= 1.2;
			pitch_mod *= 1.05;
		} else if (volume_mod === "radio") {
			vol_mod *= 0.7;
			pitch_mod *= 1.1; // Tinny
		}

		utter.pitch = this.clamp_pitch(utter.pitch * pitch_mod);
		utter.rate = this.clamp_rate(utter.rate * rate_mod);
		utter.volume = Math.min(1.0, Math.max(0, this.calc_proximity_volume(speaker_ref, volume_mod) * vol_mod));

		console.log("TTS DEBUG:", "effects", "pitch:", utter.pitch, "rate:", utter.rate, "voice:", utter.voice?.name);
		speechSynthesis.speak(utter);
	}

	private calc_proximity_volume(speaker_ref: number, volume_mod: VolumeMode): number {
		let speaker = this.client.atom_map.get(speaker_ref);
		if (!speaker || !speaker.last_draw_pos) return 0.5;

		let sx = speaker.last_draw_pos[0];
		let sy = speaker.last_draw_pos[1];
		let cx = this.client.eye_x;
		let cy = this.client.eye_y;

		let dist = Math.sqrt((sx - cx) ** 2 + (sy - cy) ** 2) / TILE_SIZE;

		let config = RANGE_CONFIG[volume_mod] || RANGE_CONFIG.normal;

		if (dist <= config.full) return config.gain;
		if (dist >= config.max) return 0;

		// Linear falloff between full and max range
		let t = (dist - config.full) / (config.max - config.full);
		return config.gain * (1 - t);
	}

	private clean_message(message: string): string {
		// Strip HTML tags, BYOND formatting, and special characters
		return message
			.replace(/<[^>]*>/g, "")
			.replace(/\[.*?\]/g, "")
			.replace(/[*_~`]/g, "")
			// Chrome TTS spells out repeated chars ("ssss" → "s s s s"), so collapse them.
			// Letters collapse to 2 to keep emphasis ("hisssss" → "hiss"); punctuation to 1 ("!!!!" → "!").
			.replace(/([a-zA-Z])\1{2,}/g, "$1$1")
			.replace(/([^a-zA-Z0-9\s])\1+/g, "$1")
			.trim();
	}

	private clamp_pitch(v: number): number {
		return Math.max(0.1, Math.min(2.0, v));
	}

	private clamp_rate(v: number): number {
		return Math.max(0.1, Math.min(10.0, v));
	}
}
