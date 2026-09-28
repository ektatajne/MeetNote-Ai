import { useEffect, useRef } from "react";

export default function AvatarCanvas({ sentenceChunk, isPaused = false }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef({ setPose: null, curAnim: "" });
  const isAnimatingRef = useRef(false);
  const lastChunkRef = useRef("");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    const ctx = canvas.getContext("2d");
    let W, H, U;
    let raf;
    let lastT = 0;
    let idleT = 0;
    let oscT = 0;
    let cur = {};
    let tgt = {};

    const C = {
      bg: "#1a1a2e",
      skin: "#F5C898",
      skinHi: "#FFE0BC",
      skinSh: "#D8905A",
      outline: "#B06030",
      outlineD: "#7A3A10",
      shirt: "#1A1A1A",
      shirtSh: "#0D0D0D",
      hair: "#0D0A0E",
      hairHi: "#2A2035",
      eyeWhite: "#F8F4F0",
      lipTop: "#C07880",
      lipBot: "#E09090",
    };

    const PI = Math.PI;
    const basePose = {
      lShX: 2.0, lShY: -3.0, lElX: 3.0, lElY: -1.2, lWrX: 3.1, lWrY: 0.5,
      rShX: -2.0, rShY: -3.0, rElX: -3.0, rElY: -1.2, rWrX: -3.1, rWrY: 0.5,
      headTilt: 0, headTurn: 0, lHandAng: -PI * 0.15, rHandAng: PI + PI * 0.15,
    };
    const POSES = {
      rest: { ...basePose },
      wave: { ...basePose, rElX: -2.8, rElY: -4.0, rWrX: -2.1, rWrY: -5.2, rHandAng: -PI / 2, headTurn: -0.08 },
      namaste: { ...basePose, lElX: 0.6, lElY: -2.2, lWrX: 0.4, lWrY: -2.6, rElX: -0.6, rElY: -2.2, rWrX: -0.4, rWrY: -2.6, lHandAng: -PI / 2, rHandAng: -PI / 2, headTilt: 0.1 },
      yes: { ...basePose, rElX: -1.6, rElY: -3.0, rWrX: -0.6, rWrY: -3.8, rHandAng: PI, headTilt: 0.08 },
      no: { ...basePose, rElX: -2.6, rElY: -2.8, rWrX: -3.2, rWrY: -3.8, rHandAng: -PI / 2 - 0.3, headTurn: 0.1 },
      please: { ...basePose, rElX: -1.4, rElY: -2.6, rWrX: -0.2, rWrY: -2.6, rHandAng: -PI / 2 },
      sorry: { ...basePose, rElX: -1.4, rElY: -2.5, rWrX: -0.2, rWrY: -2.5, rHandAng: -PI / 2, headTilt: 0.08 },
      thankyou: { ...basePose, rElX: -1.8, rElY: -3.2, rWrX: -0.4, rWrY: -4.1, rHandAng: -PI / 2 + 0.3 },
      love: { ...basePose, lElX: 0.8, lElY: -2.8, lWrX: -0.6, lWrY: -2.6, rElX: -0.8, rElY: -2.8, rWrX: 0.6, rWrY: -2.6, lHandAng: PI * 0.55, rHandAng: PI * 0.45, headTilt: 0.08 },
      help: { ...basePose, lElX: 1.4, lElY: -2.2, lWrX: 0.0, lWrY: -2.0, rElX: -1.4, rElY: -2.2, rWrX: 0.0, rWrY: -2.6, lHandAng: 0, rHandAng: -PI / 2 },
      need: { ...basePose, rElX: -1.8, rElY: -2.8, rWrX: -0.8, rWrY: -3.6, rHandAng: -PI / 2 + 0.4, headTilt: 0.06 },
      good: { ...basePose, rElX: -1.6, rElY: -3.1, rWrX: -0.3, rWrY: -4.0, rHandAng: -PI / 2 + 0.2 },
      bad: { ...basePose, rElX: -1.8, rElY: -2.8, rWrX: -1.2, rWrY: -1.8, rHandAng: -PI / 2 + PI * 0.3 },
      morning: { ...basePose, rElX: -3.4, rElY: -4.4, rWrX: -2.4, rWrY: -6.0, rHandAng: -PI / 2, headTilt: -0.04 },
      water: { ...basePose, rElX: -1.6, rElY: -3.2, rWrX: -0.3, rWrY: -4.4, rHandAng: -PI / 2, headTilt: 0.05 },
      food: { ...basePose, rElX: -1.4, rElY: -3.4, rWrX: -0.1, rWrY: -4.6, rHandAng: -PI / 2, headTilt: 0.05 },
      me: { ...basePose, rElX: -1.6, rElY: -2.5, rWrX: -0.2, rWrY: -2.5, rHandAng: PI, headTurn: -0.05 },
      you: { ...basePose, rElX: -2.8, rElY: -2.0, rWrX: -4.0, rWrY: -2.0, rHandAng: PI, headTurn: -0.12 },
      we: { ...basePose, rElX: -2.6, rElY: -1.8, rWrX: -3.8, rWrY: -1.6, rHandAng: PI, headTurn: -0.08 },
      what: { ...basePose, rElX: -2.4, rElY: -2.6, rWrX: -3.0, rWrY: -3.4, rHandAng: -PI / 2 - 0.4, headTurn: 0.08 },
      where: { ...basePose, rElX: -2.4, rElY: -2.4, rWrX: -3.0, rWrY: -3.2, rHandAng: -PI / 2 - 0.5, headTurn: 0.1 },
      how: { ...basePose, lElX: 1.2, lElY: -2.6, lWrX: 0.5, lWrY: -3.2, rElX: -1.2, rElY: -2.6, rWrX: -0.5, rWrY: -3.2, lHandAng: PI * 0.4, rHandAng: PI * 0.6 },
      name: { ...basePose, lElX: 1.2, lElY: -2.8, lWrX: 0.5, lWrY: -3.1, rElX: -1.2, rElY: -2.8, rWrX: -0.5, rWrY: -3.1, lHandAng: 0, rHandAng: PI },
    };

    const LKEYS = [
      "lShX", "lShY", "lElX", "lElY", "lWrX", "lWrY",
      "rShX", "rShY", "rElX", "rElY", "rWrX", "rWrY",
      "headTilt", "headTurn", "lHandAng", "rHandAng",
    ];

    function resize() {
      W = canvas.width = wrap.clientWidth;
      H = canvas.height = wrap.clientHeight;
      U = H / 16;
    }

    function canvasX(nx) { return W / 2 + nx * U; }
    function canvasY(ny) { return H * 0.52 + ny * U; }
    function lp(a, b, t) { return a + (b - a) * t; }

    function initLerp() {
      const p = POSES.rest;
      LKEYS.forEach((k) => {
        cur[k] = p[k] || 0;
        tgt[k] = p[k] || 0;
      });
    }

    function setPose(name) {
      const p = POSES[name] || POSES.rest;
      LKEYS.forEach((k) => {
        tgt[k] = p[k] !== undefined ? p[k] : POSES.rest[k] || 0;
      });
    }
    animRef.current.setPose = setPose;

    function limb(x1, y1, x2, y2, r, fill, stroke, sw = 2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      ctx.beginPath();
      ctx.moveTo(x1 + nx * r, y1 + ny * r);
      ctx.lineTo(x2 + nx * r, y2 + ny * r);
      ctx.arc(x2, y2, r, Math.atan2(ny, nx), Math.atan2(-ny, -nx));
      ctx.lineTo(x1 - nx * r, y1 - ny * r);
      ctx.arc(x1, y1, r, Math.atan2(-ny, -nx), Math.atan2(ny, nx));
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      ctx.stroke();
    }

    function drawHead(HX, HY, HR, P) {
      ctx.save();
      ctx.translate(HX, HY);
      ctx.rotate(P.headTilt || 0);

      const skinGrad = ctx.createRadialGradient(-HR * 0.2, -HR * 0.2, HR * 0.1, 0, 0, HR * 1.2);
      skinGrad.addColorStop(0, C.skinHi);
      skinGrad.addColorStop(1, C.skinSh);
      ctx.beginPath();
      ctx.ellipse(0, HR * 0.05, HR * 0.9, HR, 0, 0, PI * 2);
      ctx.fillStyle = skinGrad;
      ctx.fill();
      ctx.strokeStyle = C.outlineD;
      ctx.lineWidth = U * 0.1;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(0, -HR * 0.55, HR * 0.88, HR * 0.55, 0, PI, PI * 2);
      const hairGrad = ctx.createLinearGradient(0, -HR * 1.1, 0, -HR * 0.15);
      hairGrad.addColorStop(0, C.hairHi);
      hairGrad.addColorStop(1, C.hair);
      ctx.fillStyle = hairGrad;
      ctx.fill();

      [-1, 1].forEach((s) => {
        ctx.beginPath();
        ctx.ellipse(s * HR * 0.3, -HR * 0.08, HR * 0.18, HR * 0.14, 0, 0, PI * 2);
        ctx.fillStyle = C.eyeWhite;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s * HR * 0.3, -HR * 0.08, HR * 0.08, 0, PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
      });

      ctx.beginPath();
      ctx.moveTo(-HR * 0.2, HR * 0.5);
      ctx.quadraticCurveTo(0, HR * 0.65, HR * 0.2, HR * 0.5);
      ctx.quadraticCurveTo(0, HR * 0.74, -HR * 0.2, HR * 0.5);
      const lipGrad = ctx.createLinearGradient(0, HR * 0.45, 0, HR * 0.75);
      lipGrad.addColorStop(0, C.lipTop);
      lipGrad.addColorStop(1, C.lipBot);
      ctx.fillStyle = lipGrad;
      ctx.fill();

      ctx.restore();
    }

    function drawHand(wx, wy, ang) {
      const S = U * 0.68;
      const fwdX = Math.cos(ang);
      const fwdY = Math.sin(ang);
      const latX = -fwdY;
      const latY = fwdX;

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(wx, wy, S * 0.62, S * 0.44, ang, 0, PI * 2);
      const palmGrad = ctx.createRadialGradient(wx - S * 0.18, wy - S * 0.18, S * 0.05, wx, wy, S * 0.8);
      palmGrad.addColorStop(0, C.skinHi);
      palmGrad.addColorStop(1, C.skinSh);
      ctx.fillStyle = palmGrad;
      ctx.fill();
      ctx.strokeStyle = C.outline;
      ctx.lineWidth = U * 0.06;
      ctx.stroke();

      const fingerOffsets = [-0.42, -0.12, 0.14, 0.38];
      fingerOffsets.forEach((off) => {
        const bx = wx + latX * off * S * 1.2 + fwdX * S * 0.25;
        const by = wy + latY * off * S * 1.2 + fwdY * S * 0.25;
        const tx = bx + fwdX * S * 0.95;
        const ty = by + fwdY * S * 0.95;
        limb(bx, by, tx, ty, U * 0.09, C.skin, C.outline, U * 0.05);
      });
      ctx.restore();
    }

    function drawAvatar(osc) {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, "#1e1e2e");
      bgGrad.addColorStop(1, "#0d0d18");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      const P = cur;
      const breath = Math.sin(idleT * 0.8) * 0.038;
      const HX = canvasX(0);
      const HY = canvasY(-4.8 + breath * 0.18);
      const HR = U * 1.65;
      const HIPY = canvasY(0.6);

      const lShx = canvasX(P.lShX), lShy = canvasY(P.lShY + breath * 0.9);
      const lElx = canvasX(P.lElX), lEly = canvasY(P.lElY + breath * 0.35);
      const lWrx = canvasX(P.lWrX), lWry = canvasY(P.lWrY);
      const rShx = canvasX(P.rShX), rShy = canvasY(P.rShY + breath * 0.9);
      const rElx = canvasX(P.rElX), rEly = canvasY(P.rElY + breath * 0.35);
      const rWrx = canvasX(P.rWrX), rWry = canvasY(P.rWrY);

      const lHipX = canvasX(1.0), rHipX = canvasX(-1.0);
      const lKneeX = canvasX(1.05), rKneeX = canvasX(-1.05);
      const lAnkX = canvasX(0.95), rAnkX = canvasX(-0.95);
      const lKneeY = canvasY(3.5), rKneeY = canvasY(3.5);
      const lAnkY = canvasY(6.6), rAnkY = canvasY(6.6);

      limb(lHipX, HIPY, lKneeX, lKneeY, U * 0.56, "#202020", "#080808", U * 0.08);
      limb(rHipX, HIPY, rKneeX, rKneeY, U * 0.56, "#202020", "#080808", U * 0.08);
      limb(lKneeX, lKneeY, lAnkX, lAnkY, U * 0.48, "#1a1a1a", "#080808", U * 0.08);
      limb(rKneeX, rKneeY, rAnkX, rAnkY, U * 0.48, "#1a1a1a", "#080808", U * 0.08);

      ctx.beginPath();
      ctx.roundRect(canvasX(-2.1), canvasY(-2.9), canvasX(2.1) - canvasX(-2.1), HIPY - canvasY(-2.9), U * 0.35);
      const shirtGrad = ctx.createLinearGradient(canvasX(-2.1), 0, canvasX(2.1), 0);
      shirtGrad.addColorStop(0, C.shirtSh);
      shirtGrad.addColorStop(0.5, C.shirt);
      shirtGrad.addColorStop(1, C.shirtSh);
      ctx.fillStyle = shirtGrad;
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.lineWidth = U * 0.1;
      ctx.stroke();

      limb(lShx, lShy, lElx, lEly, U * 0.42, C.shirt, C.shirtSh, U * 0.08);
      limb(rShx, rShy, rElx, rEly, U * 0.42, C.shirt, C.shirtSh, U * 0.08);
      limb(lElx, lEly, lWrx, lWry, U * 0.3, C.skin, C.outlineD, U * 0.07);
      limb(rElx, rEly, rWrx, rWry, U * 0.3, C.skin, C.outlineD, U * 0.07);

      drawHead(HX, HY, HR, P);

      drawHand(lWrx, lWry, P.lHandAng ?? Math.atan2(lWry - lEly, lWrx - lElx));
      drawHand(rWrx, rWry, P.rHandAng ?? Math.atan2(rWry - rEly, rWrx - rElx));

      if (animRef.current.curAnim && animRef.current.curAnim !== "rest") {
        const pulse = 0.5 + Math.sin(osc * 4) * 0.5;
        ctx.save();
        ctx.globalAlpha = pulse * 0.09;
        const g = ctx.createRadialGradient(rWrx, rWry, 0, rWrx, rWry, U * 2.6);
        g.addColorStop(0, "#00d4aa");
        g.addColorStop(1, "rgba(0,212,170,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(rWrx, rWry, U * 2.6, 0, PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function renderLoop(ts) {
      raf = requestAnimationFrame(renderLoop);
      const dt = Math.min((ts - lastT) / 1000, 0.05);
      lastT = ts;
      idleT += dt;
      oscT += dt;

      const s = Math.min(1, 8 * dt);
      LKEYS.forEach((k) => {
        cur[k] = lp(cur[k], tgt[k], s);
      });
      drawAvatar(oscT);
    }

    function startIdle() {
      initLerp();
      setPose("rest");
      raf = requestAnimationFrame(renderLoop);
    }

    resize();
    startIdle();
    return () => {
      animRef.current.setPose = null;
      animRef.current.curAnim = "";
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (!sentenceChunk || !animRef.current.setPose || isAnimatingRef.current || isPaused) return undefined;

    const normalized = sentenceChunk.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    if (!normalized || normalized === lastChunkRef.current) return undefined;
    lastChunkRef.current = normalized;

    const phraseToPose = [
      ["good morning", "morning"],
      ["hello everyone", "wave"],
      ["welcome", "wave"],
      ["namaste", "namaste"],
      ["how are you", "how"],
      ["thank you", "thankyou"],
      ["please give me your attention", "you"],
      ["my name is", "name"],
      ["i am happy", "namaste"],
      ["begin", "morning"],
      ["meeting", "we"],
    ];

    const wordToPose = {
      hello: "wave",
      good: "good",
      morning: "morning",
      namaste: "namaste",
      welcome: "wave",
      thank: "thankyou",
      thanks: "thankyou",
      happy: "namaste",
      yes: "yes",
      begin: "morning",
      start: "morning",
      please: "please",
      attention: "you",
      name: "name",
      i: "me",
      my: "me",
      roy: "me",
      meeting: "we",
      you: "you",
      how: "how",
    };

    const playGestureSequence = async () => {
      if (!animRef.current.setPose) return;
      isAnimatingRef.current = true;
      try {
        const poses = [];
        const consumed = new Set();

        phraseToPose.forEach(([phrase, pose]) => {
          if (normalized.includes(phrase)) {
            poses.push(pose);
            phrase.split(" ").forEach((w) => consumed.add(w));
          }
        });

        normalized.split(" ").forEach((word) => {
          if (consumed.has(word)) return;
          const pose = wordToPose[word];
          if (pose) poses.push(pose);
        });

        const finalPoses = poses.length ? poses.slice(0, 5) : ["rest"];
        for (const pose of finalPoses) {
          animRef.current.setPose(pose);
          animRef.current.curAnim = pose;
          await new Promise((res) => setTimeout(res, 900));
        }
      } finally {
        if (animRef.current.setPose) {
          animRef.current.setPose("rest");
          animRef.current.curAnim = "";
        }
        isAnimatingRef.current = false;
      }
    };

    playGestureSequence();
    return undefined;
  }, [sentenceChunk]);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "220px", position: "relative" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", borderRadius: "8px", background: "#1a1a2e" }} />
    </div>
  );
}
