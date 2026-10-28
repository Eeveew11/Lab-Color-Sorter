import { COLORS, createColorExample } from './colorData.js';

const TRAINING_EXAMPLES_PER_COLOR = 40;
const TRAINING_OPTIONS = { epochs: 40, batchSize: 12 };

export default class ML {
    constructor() {
        this.model = null;
    }

    // Create labeled RGB examples, train the ml5 model, and report progress.
    async trainModel(updateProgress) {
        updateProgress('Setting up backend...');
        if (ml5.tf) {
            await ml5.tf.setBackend('webgl');
            await ml5.tf.ready();
        }

        updateProgress('Initializing neural network...');
        this.model = ml5.neuralNetwork({ task: 'classification' });

        for (const color of COLORS) {
            for (let i = 0; i < TRAINING_EXAMPLES_PER_COLOR; i++) {
                const example = createColorExample(color);
                this.model.addData(
                    [example.red, example.green, example.blue],
                    [example.label]
                );
            }
        }

        updateProgress('Normalizing data...');
        this.model.normalizeData();

        updateProgress('Training model...');
        await new Promise((resolve) => {
            this.model.train(
                TRAINING_OPTIONS,
                (epoch, logs) => {
                    const lossText = logs && logs.loss !== undefined ? ` (loss: ${logs.loss.toFixed(4)})` : '';
                    updateProgress(`Training... Epoch ${epoch + 1}/${TRAINING_OPTIONS.epochs}${lossText}`);
                },
                () => {
                    resolve();
                }
            );
        });
    }

    // Classify an RGB color with the trained model and return its label.
    async classify(color) {
        if (!this.model) {
            throw new Error('Model has not been trained yet.');
        }

        const results = await this.model.classify([color.red, color.green, color.blue]);
        return results[0].label;
    }
}