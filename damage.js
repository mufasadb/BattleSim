const fs = require('fs');
const Tools = require('./tools');

let rawTypeData = fs.readFileSync('./typeChart.json')
let typeChart = JSON.parse(rawTypeData);
let oneHits = ["Fissure", "Guillotine", "Horn Drill", "Sheer Cold"]
let customPower = ["Heavy Slam"]





function calculateDamage(attacker, defender, attackMove, weather) {
    if (customPower.includes(attackMove.name)) { attackMove.power = getCustomPower(attacker, defender, attackMove) }


    if (attackMove.power == "-") {
        return { damage: 0 }
    } else {

        let attackPower = attacker.attack
        if (attackMove.category === "Special") {
            attackPower = attacker.specialAttack
        }
        let rawDamage = (((((2 * attacker.level) / 5) + 2) * parseInt(attackMove.power) * attackPower / defender.defence) / 50) + 2

        let weatherMod = 1;
        let STAB = 1;
        let type = handleTypeModifier(attacker, defender, attackMove);
        let burn = 1;
        let other = 1;

        if (attacker.status == "burn") { burn = 0.5 }

        //TODO: impliment weather
        if (attacker.types.includes(attackMove.type)) { STAB = 1.5 }
        //capture data
        let finalDamage = Math.floor(rawDamage * weatherMod * STAB * type * burn * other)
        if (oneHits.includes(attackMove.name)) {
            finalDamage = defender.health
        }
        return { damage: finalDamage }
    }
}

function getCustomPower(attacker, defender, attackMove) {
    if (attackMove.name === "Heavy Slam") {
        return Tools.calcHeavySlamPower(attacker.weight, defender.weight)
    }
}





function handleTypeModifier(attacker, defender, attackMove) {
    let typeMulti = 1;
    let attackType = attackMove.type
    for (type of defender.types) {
        if (!typeChart[type]) { console.log(new Error(`there was no type for the following ${attacker.name} or ${defender.name}`)); }
        if (typeChart[type].weaknesses.includes(attackType)) { typeMulti = typeMulti * 2 };
        if (typeChart[type].strengths.includes(attackType)) { typeMulti = typeMulti / 2 };
        if (typeChart[type].immunes.includes(attackType)) { typeMulti = 0 };
    }
    return typeMulti
}



function selfDamage(attacker, attackMove) {
    attacker.health = attacker.health - attacker.chosenHealth * attackMove.selfDamageMulti
}

module.exports = {

    calculateDamage: (attacker, defender, attackMove, weather) => {
        return calculateDamage(attacker, defender, attackMove, weather)
    },
    selfDamge: (attacker, attackIndex) => {
        selfDamage(attacker, attackIndex)
    },
    doesHit: (attacker, defender, attackMoveIndex) => {
        return doesHit(attacker, defender, attackMove)
    },
    typeMod: (attacker, defender, attackMove) => { return handleTypeModifier(attacker, defender, attackMove) }
}