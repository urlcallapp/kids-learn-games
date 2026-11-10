// Device-local, per-question freehand scratch space. No handwriting recognition or network calls.
export function setupDrawing(panel){
 const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d'),undo=panel.querySelector('[data-undo]'),clear=panel.querySelector('[data-clear]'),status=panel.querySelector('[data-draw-status]');
 let strokes=[],active=null,width=0,height=0;
 function paint(){const ratio=window.devicePixelRatio||1;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);ctx.lineWidth=2.5;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#251f21';for(const points of [...strokes,...(active?[active]:[])]){if(!points.length)continue;ctx.beginPath();ctx.moveTo(points[0].x*width,points[0].y*height);if(points.length===1)ctx.lineTo(points[0].x*width+.1,points[0].y*height+.1);else for(const p of points.slice(1))ctx.lineTo(p.x*width,p.y*height);ctx.stroke();}undo.disabled=strokes.length===0;clear.disabled=strokes.length===0&&!active;}
 function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;width=rect.width;height=rect.height;const ratio=window.devicePixelRatio||1;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);paint();}
 function point(e){const r=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))};}
 canvas.addEventListener('pointerdown',e=>{if(active||(!e.isPrimary&&e.pointerType!=='mouse'))return;e.preventDefault();canvas.setPointerCapture(e.pointerId);active=[point(e)];paint();});
 canvas.addEventListener('pointermove',e=>{if(!active||!canvas.hasPointerCapture(e.pointerId))return;e.preventDefault();active.push(point(e));paint();});
 function finish(e){if(!active||!canvas.hasPointerCapture(e.pointerId))return;strokes.push(active);active=null;canvas.releasePointerCapture(e.pointerId);status.textContent='הטיוטה נשארת כאן עד המעבר למשימה אחרת.';paint();}
 canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
 undo.onclick=()=>{strokes.pop();paint();status.textContent='הקו האחרון בוטל.';};
 clear.onclick=()=>{strokes=[];active=null;paint();status.textContent='הטיוטה נוקתה.';};
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 return ()=>observer.disconnect();
}
