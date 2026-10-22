import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

declare global { interface Window { Hands?: any; } }

/** Optional, reusable hand-pointer layer for every game in GamesView. */
export const HandGestureController: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsRef = useRef<any>(null);
  const frameRef = useRef<number | null>(null);
  const lastTargetRef = useRef<Element | null>(null);
  const dwellStartRef = useRef(0);
  const lastFireRef = useRef(0);
  const pinchRef = useRef(false);
  const drawingRef = useRef<Element | null>(null);
  const [status, setStatus] = useState('Solicitando permiso para usar la cámara…');
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false, progress: 0 });

  useEffect(() => {
    let alive = true;
    const loadScript = (src: string) => new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existing) { if (window.Hands) resolve(); else { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('No se pudo cargar el detector de manos.')), { once: true }); } return; }
      const script = document.createElement('script'); script.src = src; script.crossOrigin = 'anonymous'; script.onload = () => resolve(); script.onerror = () => reject(new Error('No se pudo cargar el detector de manos.')); document.head.appendChild(script);
    });
    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador no permite acceder a la cámara. Usa HTTPS y concede el permiso.');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
        if (!alive) return;
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = streamRef.current;
        await video.play();
        const hands = new window.Hands({ locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
        hands.onResults((results: any) => {
          if (!alive) return;
          const lm = results.multiHandLandmarks?.[0];
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx) return;
          canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (!lm) { setCursor(p => ({ ...p, visible: false, progress: 0 })); lastTargetRef.current = null; drawingRef.current = null; pinchRef.current = false; return; }
          if (window.Hands && results.multiHandLandmarks) {
            // Draw the skeleton without relying on a separate drawing-utils bundle.
            const links = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
            ctx.strokeStyle = '#45e6ff'; ctx.lineWidth = 3;
            links.forEach(([a,b]) => { ctx.beginPath(); ctx.moveTo((1-lm[a].x)*canvas.width,lm[a].y*canvas.height); ctx.lineTo((1-lm[b].x)*canvas.width,lm[b].y*canvas.height); ctx.stroke(); });
            ctx.fillStyle = '#fff'; lm.forEach((p: any) => { ctx.beginPath(); ctx.arc((1-p.x)*canvas.width,p.y*canvas.height,3,0,Math.PI*2); ctx.fill(); });
          }
          const x = Math.max(0, Math.min(window.innerWidth-1, (1-lm[8].x)*window.innerWidth));
          const y = Math.max(0, Math.min(window.innerHeight-1, lm[8].y*window.innerHeight));
          const target = document.elementFromPoint(x, y) as HTMLElement | null;
          const usable = target?.closest('button, [role="button"], canvas, a, input, select, textarea, [data-hand-target="true"]') as HTMLElement | null;
          const now = performance.now();
          if (usable !== lastTargetRef.current) { lastTargetRef.current = usable; dwellStartRef.current = now; }
          const progress = usable ? Math.min(1, (now-dwellStartRef.current)/800) : 0;
          const pinch = Math.hypot(lm[4].x-lm[8].x, lm[4].y-lm[8].y) < 0.055;
          setCursor({ x, y, visible: true, progress });
          // Pinch-and-move paints on the drawing canvas; pinching elsewhere clicks once.
          if (usable instanceof HTMLCanvasElement) {
            usable.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:x,clientY:y,buttons:pinch ? 1 : 0,button:0}));
            if (pinch && !drawingRef.current) { drawingRef.current = usable; usable.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,clientX:x,clientY:y,button:0})); }
            if (pinch && drawingRef.current === usable) usable.dispatchEvent(new MouseEvent('mousemove',{bubbles:true,clientX:x,clientY:y,buttons:1,button:0}));
            if (!pinch && drawingRef.current) { drawingRef.current.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,clientX:x,clientY:y,button:0})); drawingRef.current = null; }
          } else {
            if (drawingRef.current) { drawingRef.current.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,clientX:x,clientY:y,button:0})); drawingRef.current = null; }
            if (usable && ((pinch && !pinchRef.current) || (progress >= 1 && now-lastFireRef.current > 850))) {
              usable.click(); lastFireRef.current = now; dwellStartRef.current = now;
            }
          }
          pinchRef.current = pinch;
        });
        handsRef.current = hands;
        setStatus('Cámara activa. Apunta con el índice; mantén 0,8 s o haz pinza 🤏.');
        const process = async () => { if (!alive) return; if (video.readyState >= 2 && handsRef.current) { try { await handsRef.current.send({ image: video }); } catch {} } frameRef.current = requestAnimationFrame(process); };
        frameRef.current = requestAnimationFrame(process);
      } catch (e) { if (alive) setStatus(`No se pudo iniciar la cámara: ${e instanceof Error ? e.message : 'revisa los permisos del navegador'}`); }
    };
    void start();
    return () => { alive = false; if (frameRef.current) cancelAnimationFrame(frameRef.current); try { handsRef.current?.close?.(); } catch {} streamRef.current?.getTracks().forEach(t => t.stop()); };
  }, []);

  return <>
    <div style={{ position:'fixed', right:16, bottom:16, width:'min(320px, 43vw)', zIndex:10000, border:'2px solid #22d3ee', borderRadius:16, overflow:'hidden', background:'#071827', color:'#e0faff', boxShadow:'0 12px 36px #0008', fontFamily:'system-ui,sans-serif' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 10px', gap:8 }}><strong style={{fontSize:13}}>Game With Hands &amp; Camera. 🤏 🖐️📸</strong><button onClick={onClose} aria-label="Cerrar control por manos" style={{border:0,borderRadius:8,padding:'4px 8px',background:'#164e63',color:'white',cursor:'pointer'}}>Cerrar ×</button></div>
      <div style={{position:'relative',aspectRatio:'4/3',background:'#000'}}><video ref={videoRef} autoPlay muted playsInline style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transform:'scaleX(-1)'}}/><canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',transform:'scaleX(-1)'}}/><div style={{position:'absolute',inset:0,display:'grid',gridTemplateColumns:'1fr 1fr',gridTemplateRows:'1fr 1fr',gap:6,padding:6,pointerEvents:'none'}}>{['Apunta','Mantén','Pinza 🤏','Suelta'].map((label,i)=><div key={label} style={{border:'1px dashed #67e8f9aa',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#ecfeff',background:'#08334433',textShadow:'0 1px 4px #000'}}>{label}</div>)}</div></div>
      <div style={{padding:'7px 10px',fontSize:11,lineHeight:1.4}}><Camera size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}}/>{status}</div>
    </div>
    {cursor.visible && <div aria-hidden="true" style={{position:'fixed',left:cursor.x,top:cursor.y,width:34,height:34,transform:'translate(-50%,-50%)',borderRadius:'50%',border:'4px solid #22d3ee',background:`conic-gradient(#facc15 ${cursor.progress*360}deg,#ffffff55 0deg)`,boxShadow:'0 0 16px #22d3ee',pointerEvents:'none',zIndex:10001}}/>}
  </>;
};
