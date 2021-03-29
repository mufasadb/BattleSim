// const math = require('mathjs');
const tf = require("@tensorflow/tfjs")


class Player {
    constructor(inputLength, hiddenLength, outputLength, id) {
        const min = -1
        const max = 1
        this.id = id
        this.toHiddenWeighting = randomMatrix(inputLength, hiddenLength, min, max)
        this.toOutputWeighting = randomMatrix(hiddenLength, outputLength, min, max)
        this.favouritePokemon = ""
        this.favouriteMove = ""
        this.winPercentage = ""
    }
    predict(input) {
        const output = math.multiply(math.multiply(input, toHiddenWeighting), toOutputWeighting)
        return output
    }
    haveBaby(mate) {
        let newToHiddenSequence = []
        for (genome in mate.toHiddenWeighting._data[0]) {
            if (Math.random() < 0.5) {
                newToHiddenSequence.push(mate.toHiddenWeighting._data[0][genome])
            } else {
                newToHiddenSequence.push(this.toHiddenWeighting._data[0][genome])
            }
        }
        let newToOutputSequence = []
        for (genome in mate.toOutputWeighting._data[0]) {
            if (Math.random() < 0.5) {
                newToOutputSequence.push(mate.toOutputWeighting._data[0][genome])
            } else {
                newToOutputSequence.push(this.toOutputWeighting._data[0][genome])
            }
        }
        return { toHiddenSequence: newToHiddenSequence, toOutputSequence: newToOutputSequence }
    }
    play() {
        const results = main.runFights({ hws: this.toHiddenWeighting, ows: this.toOutputSequence })
        this.winPercentage = results.winPercentage
        this.favouriteMove = results.favouriteMove
        this.favouritePokemon = results.favouritePokemon
        return results
    }
}


function randomMatrix(rows, columns, lowVal, highVal) {
    let columnArray = []
    for (let i = 0; i < rows; i++) {
        let rowArray = []
        for (let j = 0; j < columns; j++) {
            rowArray.push(Math.random() * (Math.abs(lowVal) + highVal + 1) - highVal)
        }
        columnArray.push(rowArray)
    }
    return columnArray
}

module.exports = {
    create: (inputLength, hiddenLength, outputLength, id) => { return new Player(inputLength, hiddenLength, outputLength, id) }
}


