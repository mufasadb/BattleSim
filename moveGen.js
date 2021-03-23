const fs = require('fs')
const Tools = require('./tools')

let rawMoveData = fs.readFileSync(`./moveData.json`)
let parsedMoveData = JSON.parse(rawMoveData);

function addRandomMoves(pmon, level, useTM) {
    let possibleMoves = []
    let pokeData = Tools.lookupPokemon(pmon);
    for (const [key, value] of Object.entries(pokeData.levelUpMoves)) {
        if (key < level) {
            for (move of value) {
                if (!possibleMoves.includes(move)) {
                    possibleMoves.push(move)
                }
            }
        }
    }
    if (useTM) {
        for (move of pokeData.tmMoves) {
            if (!possibleMoves.includes(move)) {
                possibleMoves.push(move)
            }
        }
    }
    let selectedMoves = []
    let stop = 4
    if (possibleMoves.length < 4) { stop = possibleMoves.length }
    for (let i = 0; i < stop; i++) {
        let selected = Tools.randomFromList(possibleMoves)
        if (selectedMoves.includes(selected)) {
            i--
        } else {
            selectedMoves.push(new Move(selected));
        }

    }
    return selectedMoves
}


class Move {
    constructor(name) {
        let moveData = parsedMoveData.find(m => { return m.Name === name })
        if (!moveData) {
            console.log(new Error(`couldn't find move ${name}`)
            )
        }
        this.name = name;
        this.type = moveData.Type;
        this.category = moveData.Category;
        this.pp = moveData.PP;
        this.power = moveData.Power;
        this.accuracy = moveData.Accuracy;
        this.status = moveData.status;
        this.statusChance = moveData.statusChance;
        this.effects = moveData.effects;
        this.selfEffects = moveData.selfEffects;
        this.hitCount = moveData.hitCount;
        this.hitRepeatCount = moveData.hitRepeatCount;
        this.selfStatus = moveData.selfStatus? moveData.selfStatus: {};
        this.heal = moveData.heal? moveData.heal:"";
    }
}

module.exports = {

    randomMoveGen: (monName, level, useTM) => { return addRandomMoves(monName, level, useTM) },

}