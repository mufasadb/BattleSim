const Tools = require("./tools")
const DamageCalc = require("./damage")
const math = require('mathjs');

function decideMove(attacker, defender, weather) {
    if (attacker.teamNumber === 1) {
        return weightedDecision(attacker, defender)
    }
    if (attacker.teamNumber === 2) {
        //possibleMoves should become a list of indexes which are acceptable moves
        let possibleMoves = checkIfMovesHavePP(attacker.moves)
        if (possibleMoves.length < 1) {
            return false
        }
        else {
            if (attacker.moveLogic === "random") {
                let chosenMoveIndex = Math.floor(Math.random() * possibleMoves.length)
                return possibleMoves[chosenMoveIndex]
            }
            if (attacker.moveLogic === "stab") {
                for (move of possibleMoves) {
                    for (type of attacker.types) {
                        if (attacker.moves[move].type === type) {
                            return move
                        }
                    }
                }
                return (possibleMoves[Math.floor(Math.random() * possibleMoves.length)])
            }
            if (attacker.moveLogic === "typeAdvantage") {
                let chosenMove = possibleMoves[0]
                let multiplier = 0
                for (move of possibleMoves) {
                    let typeMod = DamageCalc.typeMod(attacker, defender, move)
                    if (typeMod > multiplier) { chosenMove = move; multiplier = typeMod; }
                }
                return chosenMove
            }
            if (attacker.moveLogic === "mostDamage") {
                let chosenMove = possibleMoves[0];
                let bestDamage = 0;
                for (move of possibleMoves) {
                    let moveDamage = DamageCalc.calculateDamage(attacker, defender, attacker.moves[move], weather)
                    if (moveDamage.damage > bestDamage) { chosenMove = move; bestDamage = moveDamage.damge; }
                }
                return chosenMove
            }
            if (attacker.moveLogic === "power") {
                let chosenMove = possibleMoves[0];
                let bestPower = 0;
                for (move of possibleMoves) {
                    if (attacker.moves[move].power > bestPower) { bestPower = attacker.moves[move].power; chosenMove = move }
                }
                return chosenMove
            }
        }
    }
}

function checkIfMovesHavePP(moves) {
    const moveList = []
    for (move in moves) {
        if (moves[move].pp > 0) {
            moveList.push(move)
            canMove = true
        }
    }
    return moveList
}

function weightedDecision(attacker, defender) {
    let possibleMoves = checkIfMovesHavePP(attacker.moves)
    if (possibleMoves.length < 1) {
        return false
    }
    else {
        let possibleMoveWeighting = []
        for (moveIndex of possibleMoves) {
            let move = attacker.moves[moveIndex]
            let stab = 0
            for (type of attacker.types) { if (move.type === type) { stab = 100 } }
            let power = move.power
            let typeMulti = DamageCalc.typeMod(attacker, defender, move) * 100
            let accuracy = move.accuracy
            let pp = move.pp * 4
            let enemyHealth = defender.health / defender.maxHealth * 100
            let myHealth = attacker.health / attacker.maxHealth * 100


            if (power == "-") { power = 0 };
            if (accuracy == "-") { accuracy = 100 }

            let possibleMoveInputMatrix = [stab, power, typeMulti, accuracy, pp, enemyHealth, myHealth]

            for (effect of ["Poison", "Confusion", "Sleep", "Burn", "Paralysis"]) {
                let statPush = 0
                for (status in move.status) {
                    if (move.status[status] == effect) {
                        statPush = move.statusChance[status] * 100
                    }
                }
                possibleMoveInputMatrix.push(statPush)
            }
            for (stat of ["defence", "attack", "speed", "specialDefence", "specialAttack"]) {
                let statPush = 0
                for (effectStat of move.effects) {
                    if (stat == effectStat.stat) {
                        statPush = effectStat.stages * 100
                        if (effectStat.chance) {
                            statPush * effectStat.chance
                        }
                    }
                }
                possibleMoveInputMatrix.push(statPush)
            }
            possibleMoveInputMatrix = math.matrix([possibleMoveInputMatrix]);
            let possibleMoveHidden = math.multiply(possibleMoveInputMatrix, Tools.calcSettings.toHiddenWeighting)
            let possibleMoveOutput = math.multiply(possibleMoveHidden, Tools.calcSettings.toOutputWeighting)
            possibleMoveWeighting.push(possibleMoveOutput)
        }
        let chosenMove = possibleMoves[0]
        let powerCompare = possibleMoveWeighting[0]._data[0][0]
        for (move in possibleMoves) {
            // console.log(`move ${move}, has ${possibleMoveWeighting[move]._data[0][0]} rating`)
            if (possibleMoveWeighting[move]._data[0][0] > powerCompare) {
                chosenMove = possibleMoves[move];
                powerCompare = possibleMoveWeighting[move]._data[0][0]
            }
        }
        // console.log('\x1b[36m%s\x1b[0m',`I chose ${chosenMove}`,"\x1b[0m")
        return chosenMove

    }
}
module.exports = {
    decideMove: (attacker, defender, weather) => { return decideMove(attacker, defender, weather) }
}