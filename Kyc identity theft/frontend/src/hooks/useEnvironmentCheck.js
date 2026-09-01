import { useState, useCallback, useRef } from 'react';

export const useEnvironmentCheck = () => {
  const [envData, setEnvData] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [jitterDeltas, setJitterDeltas] = useState([]);
  const jitterSamplesRef = useRef([]);

  const collectEnvironmentData = useCallback(async (videoElement) => {
    setIsCollecting(true);
    jitterSamplesRef.current = [];

    // 1. Browser automation checks
    const isWebdriver = Boolean(navigator.webdriver);
    const pluginsLength = navigator.plugins ? navigator.plugins.length : 0;
    const hasChromeObject = Boolean(window.chrome);
    const userAgent = navigator.userAgent || "";
    const languages = Array.isArray(navigator.languages) ? [...navigator.languages] : [navigator.language];

    // 2. Query device enumeration
    let devices = [];
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devList = await navigator.mediaDevices.enumerateDevices();
        devices = devList.map(d => ({
          deviceId: d.deviceId ? d.deviceId.substring(0, 8) + "..." : "unknown",
          kind: d.kind,
          label: d.label || "Integrated Hardware Device"
        }));
      }
    } catch (e) {
      console.warn("Device enumeration error:", e);
    }

    // 3. Measure frame arrival jitter over ~30 frames (<=2s at 15fps)
    const deltas = await new Promise((resolve) => {
      // No synthesised samples. Inventing plausible deltas here would hand every
      // client a guaranteed pass on the synthetic-pacing check — including an
      // attacker who simply deletes requestVideoFrameCallback. Report the gap
      // and let the server fail closed.
      if (!videoElement || !videoElement.requestVideoFrameCallback) {
        return resolve([]);
      }

      let count = 0;
      let lastTime = null;
      const samples = [];

      const onFrame = (now, metadata) => {
        const frameTime = metadata?.presentationTime || now;
        if (lastTime !== null) {
          const delta = frameTime - lastTime;
          if (delta > 0 && delta < 200) {
            samples.push(delta);
          }
        }
        lastTime = frameTime;
        count++;

        if (count < 30) {
          videoElement.requestVideoFrameCallback(onFrame);
        } else {
          resolve(samples);
        }
      };

      videoElement.requestVideoFrameCallback(onFrame);
    });

    const payload = {
      webdriver: isWebdriver,
      plugins_length: pluginsLength,
      has_chrome_object: hasChromeObject,
      user_agent: userAgent,
      languages: languages,
      devices: devices,
      jitter_deltas: deltas
    };

    setEnvData(payload);
    setJitterDeltas(deltas);
    setIsCollecting(false);

    return payload;
  }, []);

  return {
    envData,
    isCollecting,
    jitterDeltas,
    collectEnvironmentData
  };
};
