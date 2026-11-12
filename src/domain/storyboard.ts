import {z} from 'zod';
import rawStoryboard from './storyboard.json';

const SceneSchema = z.object({
  id: z.enum(['welcome', 'groups', 'distribute', 'addition', 'multiplication']),
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().positive(),
  caption: z.string().min(1).max(140),
  learningPurpose: z.string().min(1).max(180),
});

const LanguageSchema = z.object({
  title: z.string().min(1).max(100),
  scenes: z.array(SceneSchema).length(5),
});

export const StoryboardSchema = z.object({
  schemaVersion: z.literal('1.0'),
  lesson: z.object({
    learnerLevel: z.literal('CLASS_2'),
    subject: z.literal('MATHEMATICS'),
    topic: z.literal('MULTIPLICATION_AS_EQUAL_GROUPS'),
    facts: z.object({
      groups: z.number().int().positive(),
      itemsPerGroup: z.number().int().positive(),
      total: z.number().int().positive(),
      additionEquation: z.string(),
      multiplicationEquation: z.string(),
    }),
  }),
  renderProfile: z.object({
    width: z.literal(1920),
    height: z.literal(1080),
    fps: z.literal(30),
  }),
  languages: z.object({
    en: LanguageSchema,
    hi: LanguageSchema,
  }),
});

export type Storyboard = z.infer<typeof StoryboardSchema>;
export type Language = keyof Storyboard['languages'];
export type TimedScene = Storyboard['languages'][Language]['scenes'][number];

const ensureTimeline = (scenes: TimedScene[]) => {
  scenes.forEach((scene, index) => {
    if (scene.endMs <= scene.startMs) {
      throw new Error(`${scene.id}: endMs must be after startMs`);
    }
    if (index === 0 && scene.startMs !== 0) {
      throw new Error(`${scene.id}: timeline must begin at 0ms`);
    }
    if (index > 0 && scene.startMs !== scenes[index - 1].endMs) {
      throw new Error(`${scene.id}: timeline must be contiguous`);
    }
  });
};

export const validateStoryboard = (input: unknown): Storyboard => {
  const storyboard = StoryboardSchema.parse(input);
  const {groups, itemsPerGroup, total, additionEquation, multiplicationEquation} =
    storyboard.lesson.facts;

  if (groups * itemsPerGroup !== total) {
    throw new Error(`Math invariant failed: ${groups} × ${itemsPerGroup} !== ${total}`);
  }

  const expectedAddition = Array.from({length: groups}, () => itemsPerGroup).join(' + ') + ` = ${total}`;
  const expectedMultiplication = `${groups} × ${itemsPerGroup} = ${total}`;

  if (additionEquation !== expectedAddition) {
    throw new Error(`Addition equation must be "${expectedAddition}"`);
  }
  if (multiplicationEquation !== expectedMultiplication) {
    throw new Error(`Multiplication equation must be "${expectedMultiplication}"`);
  }

  ensureTimeline(storyboard.languages.en.scenes);
  ensureTimeline(storyboard.languages.hi.scenes);
  return storyboard;
};

export const storyboard = validateStoryboard(rawStoryboard);

export const msToFrame = (milliseconds: number) =>
  Math.round((milliseconds / 1000) * storyboard.renderProfile.fps);

export const durationInFrames = (language: Language) =>
  msToFrame(storyboard.languages[language].scenes.at(-1)?.endMs ?? 0);
