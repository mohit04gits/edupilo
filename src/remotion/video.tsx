import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Language, msToFrame, storyboard, TimedScene} from '../domain/storyboard';

type VideoProps = {language: Language};

const colors = {
  ink: '#3f3150',
  cream: '#fff9ee',
  purple: '#7456a5',
  teal: '#27a896',
  yellow: '#ffd45e',
  coral: '#f36870',
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 45) * 14;
  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #c9f2ff 0%, #eafaff 52%, #d9f2c4 52%, #bde59d 100%)',
      }}
    >
      <div style={{position: 'absolute', width: 270, height: 270, borderRadius: '50%', right: 120, top: 70, background: '#ffe97a', boxShadow: '0 0 70px #fff6b0'}} />
      {[0, 1, 2].map((cloud) => (
        <div
          key={cloud}
          style={{
            position: 'absolute',
            left: 180 + cloud * 590 + drift * (cloud % 2 ? -1 : 1),
            top: 105 + (cloud % 2) * 115,
            width: 250,
            height: 82,
            borderRadius: 60,
            background: 'rgba(255,255,255,.82)',
            boxShadow: '75px -25px 0 10px rgba(255,255,255,.82), 145px 5px 0 rgba(255,255,255,.82)',
          }}
        />
      ))}
      <div style={{position: 'absolute', inset: '54% 0 auto', height: 12, background: 'rgba(70,134,80,.2)'}} />
      {[0, 1, 2, 3, 4, 5].map((bush) => (
        <div
          key={bush}
          style={{
            position: 'absolute',
            left: bush * 380 - 70,
            bottom: 105 + (bush % 2) * 25,
            width: 330,
            height: 145,
            borderRadius: '50% 50% 18% 18%',
            background: bush % 2 ? '#69bd6c' : '#58aa64',
            opacity: 0.75,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Rabbit: React.FC<{x?: number; y?: number; scale?: number; mood?: 'wave' | 'point' | 'celebrate'}> = ({
  x = 80,
  y = 255,
  scale = 0.78,
  mood = 'wave',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({frame, fps, config: {damping: 15, stiffness: 95}});
  const bounce = Math.sin(frame / 9) * (mood === 'celebrate' ? 16 : 6);
  const turn = mood === 'point' ? -3 : Math.sin(frame / 14) * (mood === 'celebrate' ? 5 : 2);
  return (
    <Img
      src={staticFile('assets/rabbit.svg')}
      style={{
        position: 'absolute',
        width: 520,
        left: x,
        top: y + bounce,
        transformOrigin: '50% 90%',
        transform: `translateX(${interpolate(entrance, [0, 1], [-360, 0])}px) rotate(${turn}deg) scale(${scale})`,
        filter: 'drop-shadow(0 16px 18px rgba(52,49,63,.2))',
      }}
    />
  );
};

const Carrot: React.FC<{x: number; y: number; delay?: number; size?: number; targetY?: number}> = ({
  x,
  y,
  delay = 0,
  size = 105,
  targetY,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - delay, fps, config: {damping: 13, stiffness: 115, mass: 0.7}});
  const finalY = targetY ?? y;
  return (
    <Img
      src={staticFile('assets/carrot.svg')}
      style={{
        position: 'absolute',
        width: size,
        left: x,
        top: interpolate(progress, [0, 1], [y - 300, finalY]),
        opacity: interpolate(progress, [0, 0.15, 1], [0, 1, 1]),
        transform: `rotate(${interpolate(progress, [0, 1], [-24, 4])}deg) scale(${interpolate(progress, [0, 1], [0.4, 1])})`,
        filter: 'drop-shadow(0 10px 8px rgba(75,53,35,.2))',
      }}
    />
  );
};

const Basket: React.FC<{x: number; index: number}> = ({x, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - index * 7, fps, config: {damping: 12, stiffness: 115}});
  return (
    <Img
      src={staticFile('assets/basket.svg')}
      style={{
        position: 'absolute',
        width: 330,
        left: x,
        top: 590,
        transformOrigin: '50% 100%',
        transform: `translateY(${interpolate(progress, [0, 1], [280, 0])}px) scale(${interpolate(progress, [0, 1], [0.45, 1])})`,
        opacity: progress,
        translate: '9.2px -21.5px'
      }}
    />
  );
};

const Caption: React.FC<{scene: TimedScene; language: Language}> = ({scene, language}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, fps * 0.35], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: 170,
        right: 170,
        bottom: 54,
        padding: '24px 48px 28px',
        borderRadius: 34,
        background: 'rgba(51,39,67,.9)',
        color: '#fff',
        textAlign: 'center',
        fontFamily: language === 'hi' ? 'Nirmala UI, Mangal, sans-serif' : 'Segoe UI, sans-serif',
        fontSize: language === 'hi' ? 50 : 48,
        fontWeight: 700,
        letterSpacing: language === 'hi' ? 0 : 0.4,
        lineHeight: 1.25,
        opacity: fadeIn,
        transform: `translateY(${interpolate(fadeIn, [0, 1], [28, 0])}px)`,
        boxShadow: '0 14px 35px rgba(48,34,58,.24)',
        border: '3px solid rgba(255,255,255,.3)',
      }}
    >
      {scene.caption}
    </div>
  );
};

const SceneHeading: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = colors.ink}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const appear = spring({frame, fps, config: {damping: 14}});
  return (
    <div
      style={{
        position: 'absolute',
        top: 65,
        left: 520,
        right: 120,
        textAlign: 'center',
        color,
        fontFamily: 'Segoe UI, Nirmala UI, sans-serif',
        fontWeight: 900,
        fontSize: 72,
        transform: `scale(${interpolate(appear, [0, 1], [0.65, 1])})`,
        opacity: appear,
        textShadow: '0 4px 0 rgba(255,255,255,.75)',
      }}
    >
      {children}
    </div>
  );
};

const BasketRow: React.FC<{withCarrots?: boolean}> = ({withCarrots = false}) => {
  const positions = [660, 1040, 1420];
  return (
    <>
      {positions.map((x, index) => <Basket key={`basket-${index}`} x={x} index={index} />)}
      {withCarrots && positions.flatMap((x, group) => [0, 1].map((item) => (
        <Carrot
          key={`carrot-${group}-${item}`}
          x={x + 82 + item * 70}
          y={450}
          targetY={505 - item * 8}
          delay={group * 18 + item * 8}
          size={92}
        />
      )))}
    </>
  );
};

const WelcomeScene: React.FC<{title: string}> = ({title}) => {
  const frame = useCurrentFrame();
  return (
    <>
      <Rabbit mood="wave" x={120} y={245} scale={0.82} />
      <SceneHeading>{title}</SceneHeading>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <Carrot
            key={index}
            x={1120 + Math.cos(angle) * 260}
            y={410 + Math.sin(angle) * 180 + Math.sin((frame + index * 8) / 12) * 9}
            delay={index * 5}
            size={105}
          />
        );
      })}
      <div style={{position: 'absolute', left: 1190, top: 410, width: 190, height: 190, borderRadius: '50%', background: colors.yellow, color: colors.ink, display: 'grid', placeItems: 'center', fontFamily: 'Segoe UI, sans-serif', fontSize: 105, fontWeight: 900, boxShadow: '0 12px 0 #e2a833'}}>6</div>
    </>
  );
};

const GroupsScene: React.FC<{language: Language}> = ({language}) => (
  <>
    <Rabbit mood="point" x={70} y={280} scale={0.72} />
    <SceneHeading color={colors.purple}>{language === 'hi' ? 'तीन बराबर समूह' : 'Three Equal Groups'}</SceneHeading>
    <BasketRow />
    {[0, 1, 2].map((index) => <div key={index} style={{position: 'absolute', left: 775 + index * 380, top: 500, width: 94, height: 94, borderRadius: '50%', background: '#fff', color: colors.purple, border: `7px solid ${colors.purple}`, display: 'grid', placeItems: 'center', font: '900 56px Segoe UI'}}>{index + 1}</div>)}
  </>
);

const DistributeScene: React.FC<{language: Language}> = ({language}) => (
  <>
    <Rabbit mood="point" x={55} y={285} scale={0.7} />
    <SceneHeading color={colors.teal}>{language === 'hi' ? 'हर समूह में 2 गाजरें' : '2 Carrots in Every Group'}</SceneHeading>
    <BasketRow withCarrots />
  </>
);

const EquationCard: React.FC<{equation: string; subtitle: string; color: string}> = ({equation, subtitle, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = spring({frame: frame - 10, fps, config: {damping: 12, stiffness: 105}});
  return (
    <div style={{position: 'absolute', left: 590, right: 120, top: 285, height: 400, borderRadius: 55, background: 'rgba(255,255,255,.94)', border: `10px solid ${color}`, boxShadow: '0 26px 50px rgba(52,42,62,.22)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${interpolate(progress, [0, 1], [0.65, 1])}) rotate(${interpolate(progress, [0, 1], [-4, 0])}deg)`, opacity: progress}}>
      <div style={{font: '900 120px Segoe UI, Nirmala UI, sans-serif', color: colors.ink}}>{equation}</div>
      <div style={{marginTop: 24, padding: '12px 30px', borderRadius: 24, background: color, color: '#fff', font: '800 42px Segoe UI, Nirmala UI, sans-serif'}}>{subtitle}</div>
    </div>
  );
};

const AdditionScene: React.FC<{language: Language}> = ({language}) => (
  <>
    <Rabbit mood="point" x={70} y={285} scale={0.72} />
    <EquationCard equation={storyboard.lesson.facts.additionEquation} subtitle={language === 'hi' ? 'बार-बार जोड़ना' : 'Repeated Addition'} color={colors.coral} />
  </>
);

const MultiplicationScene: React.FC<{language: Language}> = ({language}) => {
  const frame = useCurrentFrame();
  const confetti = Array.from({length: 28}, (_, index) => ({
    left: 520 + ((index * 137) % 1320),
    color: [colors.yellow, colors.coral, colors.teal, colors.purple][index % 4],
    delay: index * 2,
  }));
  return (
    <>
      <Rabbit mood="celebrate" x={75} y={255} scale={0.78} />
      {confetti.map((piece, index) => {
        const progress = interpolate(frame - piece.delay, [0, 95], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
        return <div key={index} style={{position: 'absolute', left: piece.left, top: interpolate(progress, [0, 1], [180, 820]), width: 18, height: 42, borderRadius: 6, background: piece.color, opacity: interpolate(progress, [0, .8, 1], [0, 1, 0]), transform: `rotate(${progress * 480 + index * 20}deg)`}} />;
      })}
      <EquationCard equation={storyboard.lesson.facts.multiplicationEquation} subtitle={language === 'hi' ? 'यही गुणा है!' : 'That is multiplication!'} color={colors.purple} />
    </>
  );
};

const Scene: React.FC<{scene: TimedScene; language: Language; title: string}> = ({scene, language, title}) => {
  const content = {
    welcome: <WelcomeScene title={title} />,
    groups: <GroupsScene language={language} />,
    distribute: <DistributeScene language={language} />,
    addition: <AdditionScene language={language} />,
    multiplication: <MultiplicationScene language={language} />,
  }[scene.id];

  return (
    <AbsoluteFill>
      {content}
      <Caption scene={scene} language={language} />
    </AbsoluteFill>
  );
};

export const RabbitCarrotsVideo: React.FC<VideoProps> = ({language}) => {
  const languagePlan = storyboard.languages[language];
  const narrationFile = language === 'en'
    ? 'audio/rabbit-carrots-en-george.mp3'
    : 'audio/rabbit-carrots-hi-bella.mp3';
  return (
    <>
      <Audio src={staticFile(narrationFile)} />
      <AbsoluteFill style={{background: colors.cream}}>
        <Background />
        {languagePlan.scenes.map((scene) => {
          const from = msToFrame(scene.startMs);
          const duration = msToFrame(scene.endMs - scene.startMs);
          return (
            <Sequence key={scene.id} from={from} durationInFrames={duration} premountFor={30}>
              <Scene scene={scene} language={language} title={languagePlan.title} />
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </>
  );
};
