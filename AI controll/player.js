const math = require('mathjs');

const mutationPercentage = 2.5 / 100
const mutationChangePercentage = 10 / 100 + 1

class Player {
    constructor(inputLength, hiddenLength, outputLength, id, generation) {
        const min = -1
        const max = 1
        this.id = id
        this.toHiddenWeighting = math.matrix(randomMatrix(inputLength, hiddenLength, min, max))
        this.toOutputWeighting = math.matrix(randomMatrix(hiddenLength, outputLength, min, max))
        this.favouritePokemon = ""
        this.favouriteMove = ""
        this.winPercentage = ""
        this.generation = generation
        this.mutationCount = 0
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
    mutate() {
        this.mutationCount++
        for (let i = 0; i < this.toHiddenWeighting._data.length; i++) {
            let genomeGroup = this.toHiddenWeighting._data[i]
            for (let j = 0; j < genomeGroup.length; j++) {
                let genome = genomeGroup[j]
                let chance = Math.random()
                if (chance < 1 - mutationPercentage) { genome = genome * mutationChangePercentage }
                if (chance > 0 + mutationPercentage) { genome = genome * mutationChangePercentage * -1 }
            }
        }
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
    create: (inputLength, hiddenLength, outputLength, id, generation) => { return new Player(inputLength, hiddenLength, outputLength, id, generation) }
}


