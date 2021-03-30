const Player = require("./player")
const Tools = require("../tools")
// const forks = Tools.forks
const { Worker, isMainThread, parentPort } = require('worker_threads');
let idCount = 0
const Expose = require("../expose");


class Population {
    constructor(playersInGeneration, batchCount, inputLength, outputLength) {
        this.players = [];
        this.playersInGeneration = playersInGeneration;
        this.batchCount = batchCount;
        this.currentGeneration = 0;
        this.bestPerformer;
        this.bestPerformerPercentage;
        this.neverBread
        this.inputLength = inputLength;
        this.outputLength = outputLength
        for (let i = 0; i < playersInGeneration; i++) {
            const player = Player.create(inputLength, Math.floor(inputLength * 1.5), outputLength, idCount, this.currentGeneration)
            idCount++
            this.players.push(player)
        }
    }
    testGeneration() {
        console.log(`testingGeneration ${this.currentGeneration}`)
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
                    Expose.data(`${playersDoneCount} from ${this.playersInGeneration}`);
                    let playerIndex = this.players.findIndex(player => { return player.id === data.id });
                    this.players[playerIndex].winPercentage = data.results.winPercentage
                    this.players[playerIndex].favouritePokemon = data.results.favouritePokemon
                    this.players[playerIndex].favouriteMove = data.results.favouriteMove

                    playersDoneCount++
                    if (playersDoneCount === this.playersInGeneration) { return this.evaluteGeneration(fromTime) }
                });
            }
        } else {
            throw "The players per generation is not divisible by the numbers of batches"
        }

    }
    evaluteGeneration(fromTime) {
        let breedArray = []
        let mutateArray = []
        let bestPlayerIndex = 0
        for (let i = 0; i < this.players.length; i++) {
            console.log(`${this.players[i].id} won ${this.players[i].winPercentage}% of the time`)
            if (this.players[i].winPercentage > 50) {
                mutateArray.push(this.players[i])
            }
            if (this.players[i].winPercentage < this.players[bestPlayerIndex].winPercentage) { bestPlayerIndex = i }
        }
        const toTime = new Date().getTime()
        const timeDiff = (toTime - fromTime) / 1000;
        console.log('\x1b[36m%s\x1b[0m', `${process.pid} It took ${timeDiff} seconds to run`, "\x1b[0m")
        this.rePopulate(breedArray, mutateArray)
        Expose.best(this.players[bestPlayerIndex].id);
    }
    rePopulate(breedArray, mutateArray) {
        this.deadPlayers = this.players
        this.players = []
        for (let i = 0; i < mutateArray.length || i < this.playersInGeneration * 0.8; i++) {
            mutateArray[i].mutate()
            this.players.push(mutateArray[i])
            console.log(`after pushing ${this.players.length}`)
        }
        console.log(`carried over ${this.players.length} players from previous generation`)
        for (let i = this.players.length; i < this.playersInGeneration; i++) {
            this.players.push(Player.create(this.inputLength, Math.floor(this.inputLength * 1.5), this.outputLength, idCount, this.currentGeneration))
            idCount++
        }
        if (this.currentGeneration < 100) {
            this.currentGeneration++
            this.testGeneration()
        }
    }
}


module.exports = {
    create: (playersInGeneration, inputLength, outputLength) => { return new Population(playersInGeneration, 3, inputLength, outputLength) }
}