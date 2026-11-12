import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const palette = {
  ink: '#493654',
  sky: '#bfeeff',
  grass: '#85cf73',
  darkGrass: '#3c985c',
  cream: '#fff9ec',
  coral: '#f36678',
  yellow: '#ffd25e',
  purple: '#7658aa',
  orange: '#f47a32',
};

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const StoryWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = interpolate(frame, [0, 90, 230, 299], [1.05, 1.08, 1.14, 1.08], clamp);
  const pan = interpolate(frame, [0, 120, 230, 299], [0, -22, -75, -35], clamp);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: palette.sky}}>
      <div style={{position: 'absolute', inset: -90, transform: `translateX(${pan}px) scale(${camera})`, transformOrigin: '50% 60%'}}>
        <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#a7e6ff 0 51%, #b8e89c 51% 100%)'}} />
        <div style={{position: 'absolute', right: 150, top: 90, width: 230, height: 230, borderRadius: '50%', background: '#ffe67a', boxShadow: '0 0 90px rgba(255,235,120,.8)'}} />
        {[0, 1, 2].map((i) => <div key={i} style={{position: 'absolute', left: 170 + i * 650 + Math.sin((frame + i * 20) / 35) * 18, top: 130 + (i % 2) * 120, width: 260, height: 76, borderRadius: 60, background: 'rgba(255,255,255,.86)', boxShadow: '75px -25px 0 4px rgba(255,255,255,.86), 145px 3px 0 rgba(255,255,255,.86)'}} />)}
        <div style={{position: 'absolute', left: 60, top: 345, width: 520, height: 360, borderRadius: '48% 48% 10% 10%', background: '#ffdc91', border: `12px solid ${palette.ink}`, boxShadow: '0 24px 0 rgba(61,75,54,.18)'}}>
          <div style={{position: 'absolute', left: 110, top: 95, width: 150, height: 210, borderRadius: '80px 80px 0 0', background: '#8f614d', border: `10px solid ${palette.ink}`}} />
          <div style={{position: 'absolute', right: 70, top: 105, width: 120, height: 110, background: '#90d8ed', border: `10px solid ${palette.ink}`, boxShadow: 'inset 0 0 0 9px #fff8d4'}} />
          <div style={{position: 'absolute', left: 195, top: -110, width: 80, height: 170, background: '#9c6b4d', border: `10px solid ${palette.ink}`}} />
          <div style={{position: 'absolute', left: -65, right: -65, top: -35, height: 100, borderRadius: 26, background: '#f07066', border: `12px solid ${palette.ink}`, transform: 'rotate(-4deg)'}} />
        </div>
        {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{position: 'absolute', left: 560 + i * 370, bottom: 95 + (i % 2) * 22, width: 330, height: 145, borderRadius: '50%', background: i % 2 ? '#55ad68' : '#419d60', opacity: .9}} />)}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 30, height: 170, background: 'linear-gradient(180deg,#e0ba72,#c9924f)', borderTop: '12px solid rgba(117,76,50,.25)'}} />
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{position: 'absolute', left: 80 + i * 350, bottom: 45, width: 45, height: 45, borderRadius: '50% 50% 45% 55%', background: i % 2 ? '#f38a9d' : '#fff2a6', boxShadow: `24px -15px 0 ${i % 2 ? '#fff2a6' : '#f38a9d'}`}} />)}
      </div>
    </AbsoluteFill>
  );
};

const Eye: React.FC<{x: number; blink: number}> = ({x, blink}) => (
  <g transform={`translate(${x} 0) scale(1 ${blink})`}>
    <ellipse cx="0" cy="0" rx="22" ry="30" fill={palette.ink} />
    <circle cx="-7" cy="-9" r="7" fill="#fff" />
  </g>
);

const AnimatedRabbit: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 13, stiffness: 85}});
  const walk = Math.sin(frame / 3.6);
  const blinkWindow = frame % 82;
  const blink = blinkWindow > 72 ? interpolate(blinkWindow, [72, 76, 80], [1, .08, 1], clamp) : 1;
  const reach = interpolate(frame, [75, 105, 145, 185], [0, 1, 1, 0], clamp);
  const celebrate = interpolate(frame, [220, 250], [0, 1], clamp);
  const bodyX = interpolate(enter, [0, 1], [-330, 250]) + interpolate(frame, [0, 80], [0, 100], clamp);
  const bodyY = 410 + walk * (frame < 85 ? 10 : 3) - celebrate * 18;
  const headTilt = interpolate(reach, [0, 1], [0, 8]) + Math.sin(frame / 18) * 2;
  const leftArm = interpolate(reach, [0, 1], [18, -56]) - celebrate * 55;
  const rightArm = interpolate(reach, [0, 1], [-18, 48]) + celebrate * 65;

  return (
    <svg width="620" height="700" viewBox="0 0 620 700" style={{position: 'absolute', left: bodyX, top: bodyY, overflow: 'visible', filter: 'drop-shadow(0 22px 16px rgba(62,45,69,.22))'}}>
      <g transform={`translate(310 390) rotate(${walk * 1.6})`}>
        <ellipse cx="0" cy="250" rx="130" ry="30" fill="rgba(52,47,55,.18)" />
        <ellipse cx="0" cy="112" rx="135" ry="168" fill="#fff9ef" stroke={palette.ink} strokeWidth="11" />
        <path d="M-126 80Q0 15 126 80L108 244H-108Z" fill={palette.coral} stroke={palette.ink} strokeWidth="11" />
        <path d="M-68 58L0 112 68 58" fill="none" stroke="#fff4f5" strokeWidth="18" strokeLinecap="round" />
        <g transform={`translate(-112 76) rotate(${leftArm})`}><ellipse cx="-52" cy="60" rx="42" ry="96" fill="#fff9ef" stroke={palette.ink} strokeWidth="11" /></g>
        <g transform={`translate(112 76) rotate(${rightArm})`}><ellipse cx="52" cy="60" rx="42" ry="96" fill="#fff9ef" stroke={palette.ink} strokeWidth="11" /></g>
        <ellipse cx="-78" cy="245" rx="82" ry="43" fill="#fff9ef" stroke={palette.ink} strokeWidth="11" transform={`rotate(${-walk * 6})`} />
        <ellipse cx="78" cy="245" rx="82" ry="43" fill="#fff9ef" stroke={palette.ink} strokeWidth="11" transform={`rotate(${walk * 6})`} />
      </g>
      <g transform={`translate(310 255) rotate(${headTilt})`}>
        <g transform="translate(-72 -155) rotate(-9)"><ellipse cx="0" cy="0" rx="50" ry="145" fill="#fff9ef" stroke={palette.ink} strokeWidth="11"/><ellipse cx="0" cy="-8" rx="22" ry="105" fill="#f4a3b6"/></g>
        <g transform="translate(72 -155) rotate(9)"><ellipse cx="0" cy="0" rx="50" ry="145" fill="#fff9ef" stroke={palette.ink} strokeWidth="11"/><ellipse cx="0" cy="-8" rx="22" ry="105" fill="#f4a3b6"/></g>
        <ellipse cx="0" cy="0" rx="155" ry="130" fill="#fff9ef" stroke={palette.ink} strokeWidth="11" />
        <Eye x={-56} blink={blink} /><Eye x={56} blink={blink} />
        <ellipse cx="0" cy="40" rx="25" ry="18" fill="#ef7d96" stroke={palette.ink} strokeWidth="6" />
        <path d="M0 56q-6 32-49 15M0 56q6 32 49 15" fill="none" stroke={palette.ink} strokeWidth="7" strokeLinecap="round" />
        <circle cx="-102" cy="39" r="22" fill="#f4a3b6" opacity=".55"/><circle cx="102" cy="39" r="22" fill="#f4a3b6" opacity=".55"/>
        <g transform="translate(0 -100)"><path d="M-6 0q-60-55-85-4 8 62 83 29z" fill={palette.yellow} stroke={palette.ink} strokeWidth="8"/><path d="M6 0q60-55 85-4-8 62-83 29z" fill={palette.yellow} stroke={palette.ink} strokeWidth="8"/><circle cx="0" cy="12" r="22" fill="#ffb83d" stroke={palette.ink} strokeWidth="8"/></g>
      </g>
    </svg>
  );
};

const CarrotObject: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lift = spring({frame: frame - 88, fps, config: {damping: 14, stiffness: 80}});
  const carry = interpolate(frame, [105, 180], [0, 1], clamp);
  const place = spring({frame: frame - 180, fps, config: {damping: 13, stiffness: 100}});
  const x = interpolate(carry, [0, 1], [910, 1350]) + interpolate(place, [0, 1], [0, 90]);
  const y = interpolate(lift, [0, 1], [770, 535]) + interpolate(place, [0, 1], [0, 170]);
  const rotation = interpolate(lift, [0, 1], [18, -20]) + interpolate(place, [0, 1], [0, 25]);
  return (
    <svg width="180" height="300" viewBox="0 0 180 300" style={{position: 'absolute', left: x, top: y, transform: `rotate(${rotation}deg) scale(${.75 + lift * .2})`, filter: 'drop-shadow(0 15px 10px rgba(77,53,39,.22))'}}>
      <g stroke="#316b48" strokeWidth="9"><path d="M86 72C37 44 39 11 56 8c22-4 34 38 37 63z" fill="#58b96d"/><path d="M92 72c42-55 73-48 74-27 1 26-43 37-69 36z" fill="#45a961"/><path d="M91 73C76 12 99-5 117 7c22 15 1 52-19 72z" fill="#72cc78"/></g>
      <path d="M36 80c25-21 87-21 112 1-7 76-36 163-58 206C63 237 43 149 36 80z" fill={palette.orange} stroke="#813f2a" strokeWidth="9"/>
      <path d="M65 128l36 8m-45 43l38 8m-23 42l25 5" stroke="#d74e22" strokeWidth="8" strokeLinecap="round"/>
    </svg>
  );
};

const BasketTarget: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = spring({frame: frame - 130, fps: 30, config: {damping: 13}});
  return (
    <div style={{position: 'absolute', left: 1380, top: 700, width: 330, height: 200, transformOrigin: '50% 100%', transform: `scale(${interpolate(pop, [0,1], [.6,1])})`, opacity: pop}}>
      <div style={{position: 'absolute', left: 48, top: -75, width: 230, height: 175, border: `22px solid #8c522d`, borderBottom: 0, borderRadius: '130px 130px 0 0'}}/>
      <div style={{position: 'absolute', inset: '20px 0 0', borderRadius: '28px 28px 80px 80px', background: 'repeating-linear-gradient(0deg,#d88e3e 0 24px,#f3bf65 24px 34px)', border: `11px solid ${palette.ink}`, boxShadow: '0 18px 20px rgba(72,49,42,.2)'}}/>
    </div>
  );
};

const StoryBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const showPrompt = interpolate(frame, [15, 30, 105, 120], [0, 1, 1, 0], clamp);
  const showSuccess = interpolate(frame, [220, 242, 292, 299], [0, 1, 1, 0], clamp);
  return (
    <>
      <div style={{position: 'absolute', left: 650, top: 90, padding: '22px 42px', borderRadius: 32, background: 'rgba(255,255,255,.94)', border: `7px solid ${palette.purple}`, color: palette.ink, font: '900 54px Segoe UI, sans-serif', boxShadow: '0 15px 28px rgba(57,44,69,.18)', opacity: showPrompt, transform: `translateY(${interpolate(showPrompt,[0,1],[-20,0])}px)`}}>Can Ria make equal groups?</div>
      <div style={{position: 'absolute', left: 670, top: 120, padding: '25px 48px', borderRadius: 34, background: palette.yellow, border: `8px solid ${palette.ink}`, color: palette.ink, font: '900 64px Segoe UI, sans-serif', boxShadow: '0 16px 0 #d99d38', opacity: showSuccess, transform: `scale(${interpolate(showSuccess,[0,1],[.65,1])})`}}>Great! 2 carrots in each group</div>
    </>
  );
};

export const VisualStylePrototype: React.FC = () => (
  <AbsoluteFill style={{fontFamily: 'Segoe UI, sans-serif'}}>
    <StoryWorld />
    <BasketTarget />
    <AnimatedRabbit />
    <CarrotObject />
    <StoryBeat />
  </AbsoluteFill>
);
