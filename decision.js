const Tools = require("./tools")
const DamageCalc = require("./damage")

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

        }
        let chosenMove = possibleMoves[0]
        let powerCompare = possibleMoveWeighting[0]
        for (move in possibleMoves) {
            if (possibleMoveWeighting[move] > powerCompare) {
                chosenMove = possibleMoves[move];
                powerCompare = possibleMoveWeighting[move]
            }
        }
        return chosenMove

    }
}
module.exports = {
    decideMove: (attacker, defender, weather) => { return decideMove(attacker, defender, weather) }
}