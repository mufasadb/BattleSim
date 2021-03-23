const Damage = require("./damage")
const Tools = require("./tools");
const Remember = require("./remember")

function doMove(attacker, defender, chosenMoveIndex, weather, Remember) {
    let attackMove = attacker.moves[chosenMoveIndex]
    if (!attackMove) {
        console.log("attacker")
        console.log(attacker)
        console.log("defender")
        console.log(attacker)
        console.log("moveIndex")
        console.log(chosenMoveIndex)
    }
    if (attackMove.heal == "50%") {
        attacker.health = attacker.health + (attacker.maxHealth * 0.5)
    }
    attackMove.pp--
    if (checkAndProcessStatus(attacker)) {
        if (attackMove.selfDamage) { selfDamage(attacker, attackMove) }
        let hit = doesHit(attacker, defender, attackMove)

        if (hit) {
            let damage = Damage.calculateDamage(attacker, defender, attackMove, weather)
            handleEffectsAndStatuses(attacker, defender, attackMove)

            defender.health = defender.health - damage.damage
            Remember.rememberDamage(attackMove.name, damage.damage)
        }
    }

}

function checkAndProcessStatus(attacker) {
    let doesMove = true
    if (attacker.status === "Confusion") {
        if (Math.random() < 0.5) {
            chosenMove = -1
            let confusonDamage = (((((2 * attacker.level) / 5) + 2) * 40 * attacker.attack / attacker.defence) / 50) + 2
            attacker.health = attacker.health - confusonDamage
            doesMove = false
        }
    }
    if (attacker.status === "Paralysis") {
        if (Math.random() < 0.5) {
            doesMove = false
        }
    }
    //take damage if burned
    if (attacker.status === "Burn" || attacker.status === "Poison") {
        attacker.health = attacker.health - attacker.health / 8
    }
    return doesMove
}
function handleEffectsAndStatuses(attacker, defender, move) {
    if (move.effects.length > 0) {
        for (effect of move.effects) {
            let hits = true
            if (effect.chance) {
                if (effect.chance > Math.random()) {
                    hits = false
                }
            }
            if (hits) {
                defender[`${effect.stat}Stage`] = defender[`${effect.stat}Stage`] - effect.stages
                if (defender[`${effect.stat}Stage`] > 6) { defender[`${effect.stat}Stage`] = 6 }
                if (defender[`${effect.stat}Stage`] < -6) { defender[`${effect.stat}Stage`] = -6 }
            }
        }
    }
    if (move.status.length > 0) {
        for (i in move.status) {
            if (Math.random() < move.statusChance[i]) {
                defender.status = move.status[i]
            }
        }
    }
    if (move.selfEffects.length > 0) {
        for (effect of move.selfEffects) {
            let hits = true
            if (effect.chance) {
                if (effect.chance > Math.random()) {
                    hits = false
                }
            }
            if (hits) {
                attacker[`${effect.stat}Stage`] = attacker[`${effect.stat}Stage`] + effect.stages
                if (attacker[`${effect.stat}Stage`] > 6) { attacker[`${effect.stat}Stage`] = 6 }
                if (attacker[`${effect.stat}Stage`] < -6) { attacker[`${effect.stat}Stage`] = -6 }
            }
        }
    }
}

function doesHit(attacker, defender, attackMove) {
    let hit = true
    if (Tools.calcSettings.useAccuracy) {
        let accuracy = 1
        if (attackMove.accuracy === "-") { return true }
        let stageMulti = Tools.calculateAccuracy(attacker.accuracyStage - defender.evasionStage)
        accuracy = attackMove.accuracy * stageMulti
        if (Math.random() * 100 < accuracy) {
        }
        else {
            return false
        }
    }
    return hit
}


module.exports = {
    move: (attacker, target, chosenMoveIndex, weather, Remember) => { doMove(attacker, target, chosenMoveIndex,weather, Remember) }
}