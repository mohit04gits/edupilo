import React from 'react';
import {Composition} from 'remotion';
import {durationInFrames, storyboard} from '../domain/storyboard';
import {RabbitCarrotsVideo} from './video';
import {VisualStylePrototype} from './visual-prototype';
import {CompleteVisualLesson} from './visual-lesson';

export const RemotionRoot: React.FC = () => {
  const {width, height, fps} = storyboard.renderProfile;

  return (
    <>
      <Composition
        id="RabbitCarrots-English"
        component={RabbitCarrotsVideo}
        durationInFrames={durationInFrames('en')}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{language: 'en' as const}}
      />
      <Composition
        id="RabbitCarrots-Hindi"
        component={RabbitCarrotsVideo}
        durationInFrames={durationInFrames('hi')}
        fps={fps}
        width={width}
        height={height}
        defaultProps={{language: 'hi' as const}}
      />
      <Composition
        id="RabbitCarrots-VisualPrototype"
        component={VisualStylePrototype}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RabbitCarrots-CompleteVisual"
        component={CompleteVisualLesson}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
