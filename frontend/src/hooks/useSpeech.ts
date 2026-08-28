import { useEffect, useRef, useState } from "react";
import { analyzeSpeech } from "../services/api";

export default function useSpeech() {
  const mediaRecorder =
    useRef<MediaRecorder | null>(null);

  const mediaStream =
    useRef<MediaStream | null>(null);

  const audioContext =
    useRef<AudioContext | null>(null);

  const analyser =
    useRef<AnalyserNode | null>(null);

  const animationFrame =
    useRef<number | null>(null);

  const chunks =
    useRef<Blob[]>([]);

  const [recording, setRecording] =
    useState(false);

  const [processing, setProcessing] =
    useState(false);

  const [transcript, setTranscript] =
    useState("");

  const [speechData, setSpeechData] =
    useState<any>(null);

  const [audioLevel, setAudioLevel] =
    useState(0);

  function stopAudioAnalysis() {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(
        animationFrame.current
      );

      animationFrame.current = null;
    }

    setAudioLevel(0);

    analyser.current?.disconnect();

    analyser.current = null;

    if (audioContext.current) {
      audioContext.current
        .close()
        .catch(() => undefined);

      audioContext.current = null;
    }
  }

  function startAudioAnalysis(
    stream: MediaStream
  ) {
    try {
      const Context =
        window.AudioContext ||
        (window as any).webkitAudioContext;

      const context =
        new Context();

      const source =
        context.createMediaStreamSource(
          stream
        );

      const analyserNode =
        context.createAnalyser();

      analyserNode.fftSize = 256;

      analyserNode.smoothingTimeConstant =
        0.82;

      source.connect(analyserNode);

      audioContext.current =
        context;

      analyser.current =
        analyserNode;

      const data =
        new Uint8Array(
          analyserNode.frequencyBinCount
        );

      function updateLevel() {
        if (!analyser.current) return;

        analyser.current.getByteFrequencyData(
          data
        );

        let total = 0;

        for (
          let i = 0;
          i < data.length;
          i++
        ) {
          total += data[i];
        }

        const average =
          total / data.length;

        const normalized =
          Math.min(
            1,
            Math.max(
              0,
              (average - 4) / 110
            )
          );

        setAudioLevel(
          (previous) =>
            previous * 0.68 +
            normalized * 0.32
        );

        animationFrame.current =
          requestAnimationFrame(
            updateLevel
          );
      }

      updateLevel();
    } catch (error) {
      console.error(
        "Audio visualization failed:",
        error
      );
    }
  }

  async function startRecording() {
    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    mediaStream.current =
      stream;

    chunks.current = [];

    setTranscript("");
    setSpeechData(null);

    mediaRecorder.current =
      new MediaRecorder(stream);

    mediaRecorder.current.ondataavailable =
      (event) => {
        if (event.data.size > 0) {
          chunks.current.push(
            event.data
          );
        }
      };

    mediaRecorder.current.start();

    startAudioAnalysis(stream);

    setRecording(true);
  }

  async function stopRecording() {
    return new Promise<any>(
      (resolve, reject) => {
        if (!mediaRecorder.current) {
          resolve(null);
          return;
        }

        mediaRecorder.current.onstop =
          async () => {
            setRecording(false);

            stopAudioAnalysis();

            mediaStream.current
              ?.getTracks()
              .forEach((track) =>
                track.stop()
              );

            mediaStream.current = null;

            setProcessing(true);

            const blob =
              new Blob(
                chunks.current,
                {
                  type: "audio/webm",
                }
              );

            const formData =
              new FormData();

            formData.append(
              "audio",
              blob,
              "speech.webm"
            );

            try {
              const result =
                await analyzeSpeech(
                  formData
                );

              setTranscript(
                result.transcript || ""
              );

              setSpeechData(
                result
              );

              resolve(result);
            } catch (error) {
              console.error(
                "Speech analysis failed:",
                error
              );

              reject(error);
            } finally {
              setProcessing(false);

              mediaRecorder.current =
                null;
            }
          };

        mediaRecorder.current.stop();
      }
    );
  }

  function resetSpeech() {
    setTranscript("");
    setSpeechData(null);
    setAudioLevel(0);
  }

  useEffect(() => {
    return () => {
      stopAudioAnalysis();

      mediaStream.current
        ?.getTracks()
        .forEach((track) =>
          track.stop()
        );
    };
  }, []);

  return {
    recording,
    processing,
    transcript,
    speechData,
    audioLevel,
    startRecording,
    stopRecording,
    resetSpeech,
  };
}