const Tools = require('./tools')
const fs = require('fs');
const Move = require('./moveGen');
const Do = require('./handleGo')
const allPokemonList = Tools.allPokemonList

const natureTable = [
    { nature: "Adamant", increased: "Attack", decreased: "Special Attack" },
    { nature: "Bashful", increased: "None", decreased: "None" },
    { nature: "Bold", increased: "defence", decreased: "Attack" },
    { nature: "Brave", increased: "Attack", decreased: "Speed" },
    { nature: "Calm", increased: "Special defence", decreased: "Attack" },
    { nature: "Careful", increased: "Special defence", decreased: "Special Attack" },
    { nature: "Docile", increased: "None", decreased: "None" },
    { nature: "Gentle", increased: "Special defence", decreased: "defence" },
    { nature: "Hardy", increased: "None", decreased: "None" },
    { nature: "Hasty", increased: "Speed", decreased: "defence" },
    { nature: "Impish", increased: "defence", decreased: "Special Attack" },
    { nature: "Jolly", increased: "Speed", decreased: "Special Attack" },
    { nature: "Lax", increased: "defence", decreased: "Special defence" },
    { nature: "Lonely", increased: "Attack", decreased: "defence" },
    { nature: "Mild", increased: "Special Attack", decreased: "defence" },
    { nature: "Modest", increased: "Special Attack", decreased: "Attack" },
    { nature: "Naive", increased: "Speed", decreased: "Special defence" },
    { nature: "Naughty", increased: "Attack", decreased: "Special defence" },
    { nature: "Quiet", increased: "Special Attack", decreased: "Speed" },
    { nature: "Quirky", increased: "None", decreased: "None" },
    { nature: "Rash", increased: "Special Attack", decreased: "Special defence" },
    { nature: "Relaxed", increased: "defence", decreased: "Speed" },
    { nature: "Sassy", increased: "Special defence", decreased: "Speed" },
    { nature: "Serious", increased: "None", decreased: "None" },
    { nature: "Timid", increased: "Speed", decreased: "Attack" },
]
const defaultLevel = 50;
const useTM = false;


class Pokemon {
    constructor(name, teamNumber, moveLogic) {
        let pokeData = Tools.lookupPokemon(name)
        this.name = name;
        this.types = pokeData.types;
        this.nature = "Docile";
        this.level = defaultLevel;
        this.moves = Move.randomMoveGen(this.name, this.level, useTM);
        this.HP = pokeData.stats.HP;
        this.baseSpeed = pokeData.stats.Speed;
        this.baseSpecialDefence = pokeData.stats.SpecialDefence;
        this.baseSpecialAttack = pokeData.stats.SpecialAttack;
        this.baseDefence = pokeData.stats.Defence;
        this.baseAttack = pokeData.stats.Attack;
        this.faint = false
        this.IV = {
            hp: 5,
            speed: 5,
            specialDefence: 5,
            specialAttack: 5,
            defence: 5,
            attack: 5,
        }
        this.EV = {
            hp: 90,
            speed: 90,
            specialDefence: 90,
            specialAttack: 90,
            defence: 90,
            attack: 90,
        }
        this.health = Math.floor(((((2 * this.HP + this.IV.hp + (this.EV.hp / 4)) * this.level) / 100) + this.level + 10));
        this.maxHealth = this.health
        this.speed = calcStat("Speed", this.baseSpeed, this.IV.speed, this.EV.speed, this.level, this.nature, 0)
        this.attack = calcStat("Attack", this.baseAttack, this.IV.attack, this.EV.attack, this.level, this.nature, 0)
        this.specialAttack = calcStat("Special Attack", this.baseSpecialAttack, this.IV.specialAttack, this.EV.specialAttack, this.level, this.nature, 0)
        this.specialDefence = calcStat("Special Defence", this.baseSpecialDefence, this.IV.specialDefence, this.EV.specialDefence, this.level, this.nature, 0)
        this.defence = calcStat("Defence", this.baseDefence, this.IV.defence, this.EV.defence, this.level, this.nature, 0)
        this.speedStage = 0;
        this.defenceStage = 0;
        this.attackStage = 0;
        this.accuracyStage = 0;
        this.evasionStage = 0;
        this.teamNumber = teamNumber;
        if(teamNumber === 2){this.moveLogic = moveLogic}
    }
}




function buildTeam(teamNumber, buildLogic) {
    let team = []
    for (let i = 0; i < 6; i++) {

        let pokemonName = Tools.randomFromList(allPokemonList)
        team.push(new Pokemon(pokemonName, teamNumber, buildLogic))
    }
    return team
}





function calcStat(stat, base, iv, ev, level, nature, stage) {
    let natureObj = natureTable.find(n => { return n.nature === nature })
    let natureMulti = 1
    let stageList = [0.25, 0.29, 0.33, 0.4, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4]
    let stageMulti = stageList[stage + 6]
    if (natureObj.increased == stat) {
        natureMulti = 1.1
    } else if (natureObj.decreased == stat) {
        natureMulti = .9
    }
    return (Math.floor(((((2 * base + iv + (ev / 4)) * level) / 100) + 5) * natureMulti) * stageMulti)
}




module.exports = {
    buildTeam: (teamNumber, moveLogic) => { return buildTeam(teamNumber, moveLogic) },
    pokeNames: allPokemonList,
    lookupMon: (name) => { return lookupPokemon(name) },
}