const Player = require("./player")
const Tools = require("../tools")
// const forks = Tools.forks
const { Worker, isMainThread, parentPort } = require('worker_threads');
let idCount = 0


class Population {
    constructor(playersInGeneration, batchCount, inputLength, outputLength) {
        this.players = [];
        this.playersInGeneration = playersInGeneration;
        this.batchCount = batchCount;
        this.currentGeneration = 0;
        this.bestPerformer;
        this.bestPerformerPercentage;
        for (let i = 0; i < playersInGeneration; i++) {
            const player = Player.create(inputLength, Math.floor(inputLength * 2), outputLength, idCount)
            idCount++
            this.players.push(player)
        }
    }
    testGeneration() {
        const fromTime = new Date().getTime()
        let playersDoneCount = 0
        if (this.playersInGeneration % this.batchCount === 0) {

            let playersPerBatch = this.playersInGeneration / this.batchCount

            for (let batch = 0; batch < this.batchCount; batch++) {
                let sendArray = []
                for (let i = batch * playersPerBatch; i < batch * playersPerBatch + playersPerBatch; i++) {
                    sendArray.push(this.players[i])
                }
                const worker = new Worker('./main.js', { workerData: sendArray });
                worker.on('error', (e) => (console.log(e)))
                worker.on('message', (data) => {
                    let playerIndex = this.players.findIndex(player => { return player.id === data.id })
                    this.players[playerIndex].winPercentage = data.results.winPercentage
                    this.players[playerIndex].favouritePokemon = data.results.favouritePokemon
                    this.players[playerIndex].favouriteMove = data.results.favouriteMove

                    playersDoneCount++
                    if (playersDoneCount === this.playersInGeneration) { this.evaluteGeneration(fromTime) }
                });
            }
        } else {
            throw "The players per generation is not divisible by the numbers of batches"
        }

    }
    evaluteGeneration(fromTime) {
        for (let i = 0; i < this.players.length; i++) {
            console.log(this.players[i].winPercentage)
        }
        const toTime = new Date().getTime()
        const timeDiff = (toTime - fromTime) / 1000
        console.log('\x1b[36m%s\x1b[0m', `${process.pid} It took ${timeDiff} seconds to run`, "\x1b[0m")
    }
}




module.exports = {
    create: (playersInGeneration, inputLength, outputLength) => { return new Population(playersInGeneration, 11, inputLength, outputLength) }
}