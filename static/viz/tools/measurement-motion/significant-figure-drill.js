import { createDrill } from '../../lib/drill.js';
import { drillQuestion } from './_units-measurement-math.js';

createDrill({
  stage: document.querySelector('#stage'),
  panel: document.querySelector('#panel'),
  seed: 1,
  generate: drillQuestion,
});
