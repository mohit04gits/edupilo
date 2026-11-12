import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {storyboard} from '../domain/storyboard';

const C = {ink: '#493654', sky: '#a9e4fb', grass: '#b7e99b', dark: '#4fa564', coral: '#f36278', yellow: '#ffd45f', orange: '#f47b32', cream: '#fffaf0', purple: '#7658aa'};
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const facts = storyboard.lesson.facts;

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, 180, 420, 599], [1.04, 1.07, 1.11, 1.06], clamp);
  const pan = interpolate(f, [0, 250, 420, 599], [0, -18, -55, -25], clamp);
  return <AbsoluteFill style={{overflow: 'hidden', background: C.sky}}>
    <div style={{position: 'absolute', inset: -80, transform: `translateX(${pan}px) scale(${zoom})`, transformOrigin: '50% 60%'}}>
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#a8e4fa 0 49%, #b8e99b 49% 100%)'}} />
      <div style={{position: 'absolute', right: 125, top: 60, width: 215, height: 215, borderRadius: '50%', background: '#ffe677', boxShadow: '0 0 80px rgba(255,229,112,.85)'}} />
      {[0,1,2].map(i => <div key={i} style={{position:'absolute', left:130+i*650+Math.sin((f+i*20)/40)*12, top:105+(i%2)*115, width:245, height:70, borderRadius:60, background:'rgba(255,255,255,.85)', boxShadow:'70px -22px 0 rgba(255,255,255,.85),135px 3px 0 rgba(255,255,255,.85)'}}/>)}
      <div style={{position:'absolute', left:20, top:330, width:465, height:335, borderRadius:'48% 48% 10% 10%', background:'#ffdc91', border:`11px solid ${C.ink}`, boxShadow:'0 23px 0 rgba(61,75,54,.16)'}}>
        <div style={{position:'absolute', left:75, top:90, width:125, height:195, borderRadius:'75px 75px 0 0', background:'#90624e', border:`9px solid ${C.ink}`}}/>
        <div style={{position:'absolute', right:55, top:100, width:112, height:100, background:'#91d9ed', border:`9px solid ${C.ink}`, boxShadow:'inset 0 0 0 8px #fff8d4'}}/>
        <div style={{position:'absolute', left:-55, right:-55, top:-32, height:90, borderRadius:25, background:'#f07066', border:`11px solid ${C.ink}`, transform:'rotate(-3deg)'}}/>
      </div>
      {[0,1,2,3,4].map(i=><div key={i} style={{position:'absolute', left:430+i*390, bottom:92+(i%2)*24, width:350, height:145, borderRadius:'50%', background:i%2?'#55ad68':'#419d60'}}/>)}
      <div style={{position:'absolute', left:0, right:0, bottom:25, height:165, background:'linear-gradient(#e5bd73,#c99350)', borderTop:'11px solid rgba(117,76,50,.24)'}}/>
    </div>
  </AbsoluteFill>;
};

const Rabbit: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame:f, fps, config:{damping:13, stiffness:80}});
  const blinkPhase = f % 83;
  const blink = blinkPhase > 74 ? interpolate(blinkPhase,[74,78,82],[1,.08,1],clamp) : 1;
  const active = f > 90 && f < 420;
  const hop = active ? Math.abs(Math.sin((f-90)/15))*10 : 0;
  const reach = active ? Math.sin((f-90)/15)*28 : f > 500 ? -45 : 8;
  const x = interpolate(enter,[0,1],[-380,85]);
  return <svg width="520" height="650" viewBox="0 0 520 650" style={{position:'absolute', left:x, top:410-hop, filter:'drop-shadow(0 20px 15px rgba(62,45,69,.22))', overflow:'visible'}}>
    <ellipse cx="260" cy="610" rx="145" ry="27" fill="rgba(55,45,57,.18)"/>
    <g transform="translate(260 390)">
      <ellipse cx="0" cy="70" rx="120" ry="150" fill={C.cream} stroke={C.ink} strokeWidth="10"/>
      <path d="M-112 45Q0-5 112 45L98 210H-98Z" fill={C.coral} stroke={C.ink} strokeWidth="10"/>
      <path d="M-60 30L0 78 60 30" fill="none" stroke="#fff4f5" strokeWidth="15"/>
      <g transform={`translate(-100 45) rotate(${20+reach})`}><ellipse cx="-42" cy="55" rx="36" ry="88" fill={C.cream} stroke={C.ink} strokeWidth="10"/></g>
      <g transform={`translate(100 45) rotate(${-20-reach})`}><ellipse cx="42" cy="55" rx="36" ry="88" fill={C.cream} stroke={C.ink} strokeWidth="10"/></g>
      <ellipse cx="-68" cy="210" rx="72" ry="38" fill={C.cream} stroke={C.ink} strokeWidth="10"/><ellipse cx="68" cy="210" rx="72" ry="38" fill={C.cream} stroke={C.ink} strokeWidth="10"/>
    </g>
    <g transform={`translate(260 250) rotate(${Math.sin(f/20)*2})`}>
      <g transform="translate(-62 -135) rotate(-8)"><ellipse rx="43" ry="130" fill={C.cream} stroke={C.ink} strokeWidth="10"/><ellipse cy="-4" rx="18" ry="92" fill="#f2a0b3"/></g>
      <g transform="translate(62 -135) rotate(8)"><ellipse rx="43" ry="130" fill={C.cream} stroke={C.ink} strokeWidth="10"/><ellipse cy="-4" rx="18" ry="92" fill="#f2a0b3"/></g>
      <ellipse rx="140" ry="116" fill={C.cream} stroke={C.ink} strokeWidth="10"/>
      {[-50,50].map(x=><g key={x} transform={`translate(${x} -8) scale(1 ${blink})`}><ellipse rx="20" ry="28" fill={C.ink}/><circle cx="-6" cy="-8" r="6" fill="white"/></g>)}
      <ellipse cy="35" rx="23" ry="16" fill="#ef7d96" stroke={C.ink} strokeWidth="5"/><path d="M0 50q-5 28-42 14M0 50q5 28 42 14" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round"/>
      <circle cx="-92" cy="35" r="19" fill="#f4a3b6" opacity=".55"/><circle cx="92" cy="35" r="19" fill="#f4a3b6" opacity=".55"/>
      <g transform="translate(0 -91)"><path d="M-5 0q-53-48-75-4 7 54 69 25z" fill={C.yellow} stroke={C.ink} strokeWidth="7"/><path d="M5 0q53-48 75-4-7 54-69 25z" fill={C.yellow} stroke={C.ink} strokeWidth="7"/><circle cy="10" r="19" fill="#ffb83d" stroke={C.ink} strokeWidth="7"/></g>
    </g>
  </svg>;
};

const Basket: React.FC<{index:number}> = ({index}) => {
  const f=useCurrentFrame(); const pop=spring({frame:f-(55+index*10),fps:30,config:{damping:13}});
  const left=720+index*370;
  return <div style={{position:'absolute',left,top:675,width:280,height:190,opacity:pop,transform:`scale(${interpolate(pop,[0,1],[.5,1])})`,transformOrigin:'50% 100%'}}>
    <div style={{position:'absolute',left:42,top:-55,width:195,height:140,border:'19px solid #8c522d',borderBottom:0,borderRadius:'120px 120px 0 0'}}/>
    <div style={{position:'absolute',inset:'18px 0 0',borderRadius:'24px 24px 65px 65px',background:'repeating-linear-gradient(0deg,#d88e3e 0 22px,#f3bf65 22px 31px)',border:`10px solid ${C.ink}`,boxShadow:'0 15px 18px rgba(72,49,42,.2)'}}/>
    <div style={{position:'absolute',left:102,top:200,width:78,height:55,borderRadius:26,background:C.purple,color:'white',font:'900 32px Segoe UI',display:'grid',placeItems:'center',border:'5px solid white',boxShadow:`0 0 0 5px ${C.purple}`}}>Group {index+1}</div>
  </div>;
};

const CarrotShape: React.FC = () => <svg width="108" height="175" viewBox="0 0 108 175"><g stroke="#316b48" strokeWidth="6"><path d="M52 43C20 27 22 5 34 4c14-2 22 24 22 38z" fill="#58b96d"/><path d="M56 44c28-34 46-28 46-15 0 16-27 23-43 22z" fill="#45a961"/><path d="M55 43C47 8 61-3 72 5c13 9 1 31-12 42z" fill="#72cc78"/></g><path d="M22 48c16-13 53-13 68 1-4 46-21 98-34 123C40 143 26 91 22 48z" fill={C.orange} stroke="#813f2a" strokeWidth="6"/><path d="M39 77l22 5m-27 26l24 5m-14 24l16 3" stroke="#d74e22" strokeWidth="5"/></svg>;

const MovingCarrot:React.FC<{index:number}>=({index})=>{
  const f=useCurrentFrame(); const start=105+index*48; const p=interpolate(f,[start,start+36],[0,1],{...clamp,easing:Easing.inOut(Easing.cubic)}); const basket=Math.floor(index/facts.itemsPerGroup); const slot=index%facts.itemsPerGroup;
  const startX=520+(index%3)*40, startY=730+Math.floor(index/3)*35; const endX=805+basket*370+slot*76, endY=680+slot*22;
  const x=interpolate(p,[0,1],[startX,endX]); const y=interpolate(p,[0,.5,1],[startY,470,endY]); const r=interpolate(p,[0,.5,1],[-10,18,-5]);
  const visible=interpolate(f,[start-8,start],[0,1],clamp);
  return <div style={{position:'absolute',left:x,top:y,opacity:visible,transform:`rotate(${r}deg) scale(${.85+Math.sin(p*Math.PI)*.18})`,filter:'drop-shadow(0 11px 7px rgba(70,47,36,.22))'}}><CarrotShape/></div>;
};

const LessonText:React.FC=()=>{const f=useCurrentFrame(); const intro=interpolate(f,[8,25,82,95],[0,1,1,0],clamp); const add=interpolate(f,[400,430,495,510],[0,1,1,0],clamp); const mult=interpolate(f,[505,535,590,599],[0,1,1,0],clamp); return <>
  <div style={{position:'absolute',left:640,top:65,padding:'20px 38px',borderRadius:30,background:'rgba(255,255,255,.95)',border:`7px solid ${C.purple}`,color:C.ink,font:'900 52px Segoe UI',boxShadow:'0 14px 25px rgba(57,44,69,.18)',opacity:intro}}>Let’s make 3 equal groups!</div>
  <div style={{position:'absolute',left:715,top:90,padding:'25px 48px',borderRadius:34,background:C.yellow,border:`8px solid ${C.ink}`,color:C.ink,font:'900 72px Segoe UI',boxShadow:'0 16px 0 #d99d38',opacity:add,transform:`scale(${interpolate(add,[0,1],[.7,1])})`}}>{facts.additionEquation}</div>
  <div style={{position:'absolute',left:710,top:80,padding:'28px 58px',borderRadius:34,background:'white',border:`9px solid ${C.purple}`,color:C.purple,font:'900 84px Segoe UI',boxShadow:'0 17px 0 rgba(73,54,84,.18)',opacity:mult,transform:`scale(${interpolate(mult,[0,1],[.65,1])})`}}>{facts.multiplicationEquation}</div>
  <div style={{position:'absolute',left:690,top:925,width:1100,textAlign:'center',color:C.ink,font:'900 42px Segoe UI',opacity:interpolate(f,[95,110,390,410],[0,1,1,0],clamp)}}>2 carrots in every basket</div>
  </>};

const ProgressDots:React.FC=()=>{const f=useCurrentFrame(); const placed=Math.max(0,Math.min(facts.total,Math.floor((f-105)/48)+1)); return <div style={{position:'absolute',left:550,top:825,padding:'14px 22px',borderRadius:25,background:'rgba(255,255,255,.9)',border:`5px solid ${C.ink}`,font:'900 35px Segoe UI',color:C.ink,opacity:interpolate(f,[90,105,390,405],[0,1,1,0],clamp)}}>{placed} / {facts.total}</div>};

export const CompleteVisualLesson:React.FC=()=> <AbsoluteFill style={{fontFamily:'Segoe UI, sans-serif'}}><Background/><Basket index={0}/><Basket index={1}/><Basket index={2}/>{Array.from({length:facts.total},(_,i)=><MovingCarrot key={i} index={i}/>)}<Rabbit/><LessonText/><ProgressDots/></AbsoluteFill>;
