const Tools = require("./tools")
const Go = require("./handleGo");
const Decide = require("./decision")
const Remember = require("./remember")

function fight(teamOne, teamTwo, fightSettings, Remember) {
    let weather = ""
    let teamOnePokemonOut = teamOne[0];
    let teamTwoPokemonOut = teamTwo[0];
    for (let i = 0; i < fightSettings.turnsBeforeCallDraw; i++) {
        let turnResult = turn(teamOne, teamTwo, teamOnePokemonOut, teamTwoPokemonOut, weather, Remember)
        if (turnResult.fightGoesTo === 1 || turnResult.fightGoesTo === 2) {
            return endMatch({ winner: turnResult.fightGoesTo, turns: i }, teamOne, teamTwo, Remember)
        }
        weather = turnResult.weather
        teamOnePokemonOut = turnResult.pOne
        teamTwoPokemonOut = turnResult.pTwo
    }
    Remember.score.totalTurnsToWin = Remember.score.totalTurnsToWin + fightSettings.turnsBeforeCallDraw
    Remember.score.draws++
    Remember.score.played++



}

function endMatch(endResults, teamOne, teamTwo, Remember) {
    if (endResults.winner === 1) {
        for (mon of teamOne) { Remember.rememberMonResult(mon, true) }
        for (mon of teamTwo) { Remember.rememberMonResult(mon, false) }
        Remember.score.teamOneWins++
    } else if (endResults.winner === 2) {
        Remember.score.teamTwoWins++
        for (mon of teamOne) { Remember.rememberMonResult(mon, false) }
        for (mon of teamTwo) { Remember.rememberMonResult(mon, true) }
    }
    Remember.score.wins++
    Remember.score.played++
    Remember.score.totalTurnsToWin = Remember.score.totalTurnsToWin + endResults.turns
    return
}

function turn(teamOne, teamTwo, pOne, pTwo, weather, Remember) {
    let fightInfo = { pOne: pOne, pTwo: pTwo, fightGoesTo: false }

    let turnOrder = [pOne, pTwo].sort((a, b) => (a.speed > b.speed) ? 1 : -1)
    let attacker = turnOrder[0]
    let defender = turnOrder[1]
    let chosenMoveIndex = Decide.decideMove(attacker, defender, weather)


    if (!chosenMoveIndex) {
        turnOrder[0].health = 0
    } else {
        Go.move(attacker, defender, chosenMoveIndex, weather, Remember);
    }
    let teamReplacement = checkAndKill(pOne, pTwo)
    if (teamReplacement === 1) {
        pOne = switchMon(teamOne)
        if (!pOne) { fightInfo.fightGoesTo = 2; return fightInfo }
    }
    if (teamReplacement === 2) {
        pTwo = switchMon(teamTwo)
        if (!pTwo) { fightInfo.fightGoesTo = 1; return fightInfo }
    }


    attacker = turnOrder[1];
    defender = turnOrder[0];
    chosenMoveIndex = Decide.decideMove(attacker, defender, weather)

    if (!chosenMoveIndex) {
        turnOrder[1].health = 0
    } else {
        Go.move(attacker, defender, chosenMoveIndex, weather, Remember);
    }
    teamReplacement = checkAndKill(pOne, pTwo)
    if (teamReplacement === 1) {
        pOne = switchMon(teamOne)
        if (!pOne) { fightInfo.fightGoesTo = 2; return fightInfo }
    }
    if (teamReplacement === 2) {
        pTwo = switchMon(teamTwo)
        if (!pTwo) { fightInfo.fightGoesTo = 1; return fightInfo }
    }

    fightInfo.pOne = pOne
    fightInfo.pTwo = pTwo
    return fightInfo
}

function checkAndKill(pokemonOne, pokemonTwo) {
    if (pokemonOne.health <= 0) {
        pokemonOne.faint = true
        return 1
    }
    if (pokemonTwo.health <= 0) {
        pokemonTwo.faint = true
        return 2
    }
    return 0
}


function switchMon(team) {
    let teamOptions = []
    for (mon of team) {
        mon.faint ? "" : teamOptions.push(mon);
    }
    if (teamOptions.length < 1) {
        return false
    } else {
        return (Tools.randomFromList(teamOptions))
    }
}


module.exports = {
    fight: (teamOne, teamTwo, fightSettings, Remember) => { return fight(teamOne, teamTwo, fightSettings, Remember) },
}