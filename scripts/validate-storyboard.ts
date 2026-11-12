import {storyboard} from '../src/domain/storyboard';

const {groups, itemsPerGroup, total} = storyboard.lesson.facts;

console.log('Storyboard schema: valid');
console.log(`Deterministic math: ${groups} groups × ${itemsPerGroup} carrots = ${total} carrots`);
console.log(`English duration: ${storyboard.languages.en.scenes.at(-1)?.endMs} ms`);
console.log(`Hindi duration: ${storyboard.languages.hi.scenes.at(-1)?.endMs} ms`);
