import { COLORS, createGameColors, toCssColor } from './colorData.js';

const ROUND_SIZE = 10;

export class ColorGame {
    constructor(ui) {
        this.ui = ui;
        this.classifier = null;
        this.colors = [];
        this.selectedColor = null;
        this.draggedColor = null;
    }

    setClassifier(classifier) {
        this.classifier = classifier;
    }

    start() {
        this.binElements = new Map(
            [...this.ui.bins.querySelectorAll('[data-color]')].map((bin) => [
                bin.dataset.color,
                bin,
            ]),
        );

        for (const color of COLORS) {
            const bin = this.binElements.get(color.label);
            bin.swatches = bin.querySelector('.swatches');
            bin.tabIndex = 0;
            bin.addEventListener('dragover', this.allowDrop);
            bin.addEventListener('drop', (event) =>
                this.dropInBin(event, color.label),
            );
            bin.addEventListener('click', (event) => {
                if (!event.target.closest('.swatch')) {
                    this.placeSelectedColor(color.label);
                }
            });
            bin.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.placeSelectedColor(color.label);
                }
            });
        }

        this.newRound();
        this.ui.pile.addEventListener('dragover', this.allowDrop);
        this.ui.pile.addEventListener('drop', (event) =>
            this.returnToPile(event),
        );
        this.ui.newRoundButton.addEventListener('click', () => this.newRound());
        this.ui.checkButton.addEventListener('click', () =>
            this.checkResults(),
        );
    }

    allowDrop(event) {
        event.preventDefault();
    }

    newRound() {
        this.colors = createGameColors(ROUND_SIZE);
        this.selectedColor = null;
        this.draggedColor = null;
        this.ui.result.textContent =
            'Sort all swatches; train the model before AI checking is available.';
        this.render();
    }

    createSwatch(color) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'swatch';
        button.style.backgroundColor = toCssColor(color);
        button.setAttribute(
            'aria-label',
            `RGB ${color.red}, ${color.green}, ${color.blue}; ${color.label} color`,
        );
        button.draggable = true;
        button.addEventListener('click', () => this.selectColor(color));
        button.addEventListener('dragstart', () => {
            this.draggedColor = color;
            this.selectedColor = null;
            this.updateSelection();
        });
        button.addEventListener('dragend', () => {
            this.draggedColor = null;
        });
        return button;
    }

    render() {
        this.ui.pile.replaceChildren();
        for (const bin of this.binElements.values()) {
            bin.swatches.replaceChildren();
        }

        for (const color of this.colors) {
            if (!color.element) {
                color.element = this.createSwatch(color);
            }
            color.element.classList.toggle(
                'selected',
                color === this.selectedColor,
            );
            const destination = color.bin
                ? this.binElements.get(color.bin).swatches
                : this.ui.pile;
            destination.append(color.element);
        }

        const sorted = this.colors.filter((color) => color.bin).length;
        this.ui.progress.textContent = `Sorted: ${sorted} / ${this.colors.length}`;
    }

    selectColor(color) {
        this.selectedColor = color;
        this.updateSelection();
    }

    updateSelection() {
        for (const color of this.colors) {
            color.element.classList.toggle(
                'selected',
                color === this.selectedColor,
            );
        }
    }

    placeSelectedColor(label) {
        if (this.selectedColor) {
            this.placeColor(this.selectedColor, label);
        }
    }

    dropInBin(event, label) {
        event.preventDefault();
        if (this.draggedColor) {
            this.placeColor(this.draggedColor, label);
        }
    }

    returnToPile(event) {
        event.preventDefault();
        if (this.draggedColor) {
            this.placeColor(this.draggedColor, null);
        }
    }

    placeColor(color, bin) {
        color.bin = bin;
        this.selectedColor = null;
        this.draggedColor = null;
        this.render();
    }

    async checkResults() {
        if (!this.classifier) {
            this.ui.result.textContent =
                'Train the model before checking results.';
            return;
        }

        if (this.colors.some((color) => !color.bin)) {
            this.ui.result.textContent = 'Place every swatch in a bin first.';
            return;
        }

        this.ui.checkButton.disabled = true;
        this.ui.result.textContent = 'The model is classifying the swatches...';
        try {
            const predictions = await Promise.all(
                this.colors.map((color) => this.classifier.classify(color)),
            );
            const playerCorrect = this.colors.filter(
                (color) => color.bin === color.label,
            ).length;
            const modelCorrect = this.colors.filter(
                (color, index) => predictions[index] === color.label,
            ).length;

            this.ui.result.textContent =
                `Your sorting: ${playerCorrect}/${ROUND_SIZE}. ` +
                `Model accuracy on these colors: ${modelCorrect}/${ROUND_SIZE}.`;
        } catch (error) {
            console.error('Color classification failed.', error);
            this.ui.result.textContent = `The model could not classify the colors: ${error.message}`;
        } finally {
            this.ui.checkButton.disabled = false;
        }
    }
}
