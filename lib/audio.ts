export interface AudioTrack {
  id: string
  name: string
  buffer: AudioBuffer
  source?: AudioBufferSource
  gainNode: GainNode
  panNode: StereoPannerNode
  volume: number
  pan: number
  muted: boolean
}

export class AudioMixer {
  audioContext: AudioContext
  masterGain: GainNode
  masterAnalyser: AnalyserNode
  tracks: Map<string, AudioTrack>
  isPlaying: boolean

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.audioContext.createGain()
    this.masterAnalyser = this.audioContext.createAnalyser()
    this.masterGain.connect(this.masterAnalyser)
    this.masterAnalyser.connect(this.audioContext.destination)
    this.tracks = new Map()
    this.isPlaying = false
  }

  async addTrack(id: string, name: string, audioBlob: Blob): Promise<AudioTrack> {
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

    const gainNode = this.audioContext.createGain()
    const panNode = this.audioContext.createStereoPanner()

    gainNode.connect(panNode)
    panNode.connect(this.masterGain)

    const track: AudioTrack = {
      id,
      name,
      buffer: audioBuffer,
      gainNode,
      panNode,
      volume: 1,
      pan: 0,
      muted: false,
    }

    this.tracks.set(id, track)
    return track
  }

  playTrack(trackId: string) {
    const track = this.tracks.get(trackId)
    if (!track) return

    if (track.source) {
      track.source.stop()
    }

    track.source = this.audioContext.createBufferSource()
    track.source.buffer = track.buffer
    track.source.connect(track.gainNode)
    track.source.start(0)
    this.isPlaying = true
  }

  stopTrack(trackId: string) {
    const track = this.tracks.get(trackId)
    if (!track || !track.source) return

    track.source.stop()
    this.isPlaying = false
  }

  setTrackVolume(trackId: string, volume: number) {
    const track = this.tracks.get(trackId)
    if (!track) return

    track.volume = Math.max(0, Math.min(1, volume))
    track.gainNode.gain.setValueAtTime(track.volume, this.audioContext.currentTime)
  }

  setTrackPan(trackId: string, pan: number) {
    const track = this.tracks.get(trackId)
    if (!track) return

    track.pan = Math.max(-1, Math.min(1, pan))
    track.panNode.pan.setValueAtTime(track.pan, this.audioContext.currentTime)
  }

  muteTrack(trackId: string) {
    const track = this.tracks.get(trackId)
    if (!track) return

    track.muted = true
    track.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
  }

  unmuteTrack(trackId: string) {
    const track = this.tracks.get(trackId)
    if (!track) return

    track.muted = false
    track.gainNode.gain.setValueAtTime(track.volume, this.audioContext.currentTime)
  }

  setMasterVolume(volume: number) {
    this.masterGain.gain.setValueAtTime(
      Math.max(0, Math.min(1, volume)),
      this.audioContext.currentTime
    )
  }

  getMasterAnalyserData(): Uint8Array {
    const dataArray = new Uint8Array(this.masterAnalyser.frequencyBinCount)
    this.masterAnalyser.getByteFrequencyData(dataArray)
    return dataArray
  }

  async exportWAV(): Promise<Blob> {
    const offlineContext = new OfflineAudioContext(
      2,
      this.audioContext.sampleRate * 60,
      this.audioContext.sampleRate
    )

    for (const track of this.tracks.values()) {
      const source = offlineContext.createBufferSource()
      source.buffer = track.buffer

      const gainNode = offlineContext.createGain()
      const panNode = offlineContext.createStereoPanner()

      gainNode.gain.value = track.volume
      panNode.pan.value = track.pan

      source.connect(gainNode)
      gainNode.connect(panNode)
      panNode.connect(offlineContext.destination)

      source.start(0)
    }

    const renderedBuffer = await offlineContext.startRendering()
    return this.audioBufferToWAV(renderedBuffer)
  }

  private audioBufferToWAV(audioBuffer: AudioBuffer): Blob {
    const channels = []
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i))
    }

    const interleaved = this.interleaveLR(channels[0], channels[1])
    const dataView = this.encodeWAV(interleaved, audioBuffer.sampleRate)
    return new Blob([dataView], { type: 'audio/wav' })
  }

  private interleaveLR(left: Float32Array, right: Float32Array): Float32Array {
    const length = left.length + right.length
    const result = new Float32Array(length)

    let inputIndex = 0
    for (let i = 0; i < length; i += 2) {
      result[i] = left[inputIndex]
      result[i + 1] = right[inputIndex]
      inputIndex++
    }

    return result
  }

  private encodeWAV(samples: Float32Array, sampleRate: number): DataView {
    const buffer = new ArrayBuffer(44 + samples.length * 2)
    const view = new DataView(buffer)

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + samples.length * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 2, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 4, true)
    view.setUint16(32, 4, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, samples.length * 2, true)

    let offset = 44
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    }

    return view
  }

  removeTrack(trackId: string) {
    const track = this.tracks.get(trackId)
    if (track && track.source) {
      track.source.stop()
    }
    this.tracks.delete(trackId)
  }

  dispose() {
    for (const track of this.tracks.values()) {
      if (track.source) {
        track.source.stop()
      }
    }
    this.tracks.clear()
    this.audioContext.close()
  }
}
