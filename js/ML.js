import { COLORS, createColorExample } from './colorData.js';

const TRAINING_EXAMPLES_PER_COLOR = 40;
const TRAINING_OPTIONS = { epochs: 40, batchSize: 12 };

export default class ML {
    // Create labeled RGB examples, train the ml5 model, and report progress.
    async trainModel(updateProgress) {}

    // Classify an RGB color with the trained model and return its label.
    async classify(color) {}
}
