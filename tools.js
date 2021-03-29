const fs = require('fs');
const allPokemonList = ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Pidgey", "Pidgeotto", "Pidgeot", "Rattata", "Raticate", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Sandshrew", "Sandslash", "NidoranMale", "NidoranFemale", "Nidorina", "Nidoqueen", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Ninetales", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Dugtrio", "Meowth", "Persian", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Arcanine", "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Graveler", "Golem", "Ponyta", "Rapidash", "Slowpoke", "Slowbro", "Magnemite", "Magneton", "Farfetchd", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Muk", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Electrode", "Exeggcute", "Exeggutor", "Cubone", "Marowak", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Kangaskhan", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "MrMime", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Tauros", "Magikarp", "Gyarados", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Snorlax", "Articuno", "Zapdos", "Moltres", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mew"]

const pokemonData = {}
checkEachMon(allPokemonList)


const calculationSettings = {
    useAccuracy: true,
    toHiddenWeighting: [],
    toOutputWeighting: []
}

const decideValueSettings = {
    genericDamage: 1,
    genericWin: 1,
    hasStat: 1,
    localWin: 1,
    localUse: 1,
    pp: 1,
    accuracy: 1,
    power: 10,
    Paralysis: 1, Confusion: 1, Burn: 1, Poison: 1, Freeze: 1, Sleep: 1,
    stab: 1,
    selfDamage: 1,
    selfBuff: { defence: 1, attack: 1, speed: 1, specialAttack: 1, specialDefense: 1, accuracy: 1, evasion: 1 },
    enemeyBuff: { defence: 1, attack: 1, speed: 1, specialAttack: 1, specialDefense: 1, accuracy: 1, evasion: 1 }
}


function chooseFromWeightedList(list) {
    //list expects format [{name: string, bias: int}]
    list.sort((a, b) => (a.bias > b.bias) ? -1 : 1);
    let runningBiasTotal = 0
    for (item of list) {
        runningBiasTotal = item.bias + runningBiasTotal
        item.listBias = runningBiasTotal
    }
    let selectedVal = Math.floor(Math.random() * runningBiasTotal)
    for (item of list) {
        if (item.runningBiasTotal < selectedVal) { return item }
    }

}

function randomFromList(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function lookupPokemon(name) {
    let pokemon = pokemonData[name]
    // let data = fs.readFileSync(`./pokeData/${name}.json`)
    // let pokemon = JSON.parse(data);
    return pokemon
}

function accuracyModTable(stage) {
    if (stage < -6) { stage = 6 }
    if (stage > 6) { stage = 6 }
    switch (stage) {

        case -6:
            return .3
        case - 5:
            return .35
        case -4:
            return .45
        case -3:
            return .55
        case -2:
            return .7
        case -1:
            return .85
        case 0:
            return 1
        case 1:
            return 1.15
        case 2:
            return 1.3
        case 3:
            return 1.45
        case 4:
            return 1.55
        case 5:
            return 1.65
        case 6:
            return 1.7
    }
}

function heavySlamTable(attackerWeight, defenderWeight) {
    let comparitiveWeight = defenderWeight * 100 / attackerWeight

    if (comparitiveWeight > 50) {
        return 40
    } else if (comparitiveWeight > 33.5) { return 60 }
    else if (comparitiveWeight > 25) { return 80 }
    else if (comparitiveWeight > 20) { return 100 }
    else { return 120 }

}


function statModTable(stage) {
    switch (stage) {

        case -6:
            return .3
        case - 5:
            return .35
        case -4:
            return .45
        case -3:
            return .55
        case -2:
            return .7
        case -1:
            return .85
        case 0:
            return 1
        case 1:
            return 1.15
        case 2:
            return 1.3
        case 3:
            return 1.45
        case 4:
            return 1.55
        case 5:
            return 1.65
        case 6:
            return 1.7
    }
}

function checkEachMon(list) {
    for (name of list) {
        let data = fs.readFileSync(`./pokeData/${name}.json`)
        let pokemon = JSON.parse(data);
        pokemonData[name] = pokemon
    }
}

module.exports = {
    randomFromList: (list) => { return randomFromList(list) },
    randomWeighted: (list) => { return this.randomWeighted(list) },
    lookupPokemon: (name) => { return lookupPokemon(name) },
    calculateAccuracy: (stage) => { return accuracyModTable(stage) },
    calculateStatMod: (stage) => { return statModTable(stage) },
    calcHeavySlamPower: (attackerWeight, defenderWeight) => { return heavySlamTable(attackerWeight, defenderWeight) },
    calcSettings: calculationSettings,
    decideValueSettings: decideValueSettings,
    allPokemonList: allPokemonList,
    forks: 3
}