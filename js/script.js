import ML from './ML.js';
import { ColorGame } from './ColorGame.js';

const ui = {
    trainButton: document.querySelector('#train-button'),
    trainingStatus: document.querySelector('#training-status'),
    pile: document.querySelector('#color-pile'),
    bins: document.querySelector('#color-bins'),
    progress: document.querySelector('#progress'),
    result: document.querySelector('#result'),
    checkButton: document.querySelector('#check-button'),
    newRoundButton: document.querySelector('#new-round-button'),
};

const game = new ColorGame(ui);
const ml = new ML();
game.start();

ui.trainButton.addEventListener('click', async () => {
    ui.trainButton.disabled = true;

    try {
        await ml.trainModel((status) => {
            ui.trainingStatus.textContent = status;
        });
        game.setClassifier(ml);
        ui.trainingStatus.textContent =
            'Training complete. The model is ready.';
        ui.checkButton.disabled = false;
        ui.result.textContent =
            'Model ready. Sort the swatches and check its predictions.';
    } catch (error) {
        console.error('Model training failed.', error);
        ui.trainingStatus.textContent = `Training failed: ${error.message}`;
        ui.trainButton.disabled = false;
    }
});
