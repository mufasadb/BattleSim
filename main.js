const Pokemon = require("./Pokemon");
const Battle = require("./battle");
const Member = require("./remember")
const math = require('mathjs');
const Tools = require('./tools')

const { Worker, parentPort, workerData } = require('worker_threads');
// const { id } = workerData;
// console.log(workerData[0])



const fightSettings = {
    turnsBeforeCallDraw: 100,
    numberOfIterationsInTestFight: 1000,
    moveLogic: "power" //random, stab, typeadvantage, power, mostDamage
}


function runFights() {
    const Remember = Member.create()
    const fromTime = new Date().getTime()

    function iterativeTest(fightSettings) {
        for (let i = 0; i < fightSettings.numberOfIterationsInTestFight; i++) {
            if (i % 10 == 0) {
            }
            let team1 = Pokemon.buildTeam(1, fightSettings.moveLogic);
            let team2 = Pokemon.buildTeam(2, fightSettings.moveLogic);
            Battle.fight(team1, team2, fightSettings, Remember)
        }
    }

    iterativeTest(fightSettings)
    const toTime = new Date().getTime()
    const timeDiff = (toTime - fromTime) / 1000

    // logBestAndWorst(Remember.returnMonDataSorted(), 5, "Mons")
    // logBestAndWorst(Remember.returnDamageDataSorted(), 5, "Moves")


    function logBestAndWorst(list, count, nameOfList) {
        console.log(`The worst ${count} ${nameOfList} were:`)
        for (let i = 0; i < count; i++) {
            console.log(`${list[i].name} with a win ratio of  of ${Math.round((list[i].winCount / (list[i].winCount + list[i].lossCount) * 100))}%`)
            if (nameOfList == "Moves") {
                console.log(`${list[i].damage} damage and ${list[i].useCount} uses`)
            }
        }
        console.log("-")
        console.log(`The best ${count} ${nameOfList} were`)
        for (let i = list.length - 1; i > list.length - count - 1; i--) {
            console.log(`${list[i].name} with a win ratio of  of ${Math.round((list[i].winCount / (list[i].winCount + list[i].lossCount) * 100))}% `)
            if (nameOfList == "Moves") {
                console.log(`${list[i].damage} damage and ${list[i].useCount} uses`)
            }
            if (nameOfList == "Mons") {
                console.log(`best Move of ${list[i].sortedMoves[0].name} `)
            }
        }
        console.log("-");
    }

    // console.log(Remember.score);

    // console.log(`${process.pid} Draws: ${Remember.score.draws}`)
    // console.log(`${process.pid} Team One won ${Math.round((Remember.score.teamOneWins / (Remember.score.teamOneWins + Remember.score.teamTwoWins) * 10000)) / 100} % of time`)
    // console.log(`${process.pid} Average Turns per battle ${Remember.score.totalTurnsToWin / Remember.score.played} `)

    // console.log(`${process.pid} this event was ${timeDiff} seconds to run`)
    let monList = Remember.returnMonDataSorted()
    let favMon = monList[monList.length - 1]
    let moveList = Remember.returnDamageDataSorted()
    let favMove = moveList[moveList.length - 1]

    let results = { winPercentage: Math.round((Remember.score.teamOneWins / (Remember.score.teamOneWins + Remember.score.teamTwoWins) * 10000)) / 100, favouritePokemon: favMon, favouriteMove: favMove }

    return results
}

for (worker of workerData) {
    Tools.calcSettings.toHiddenWeighting = math.matrix(worker.toHiddenWeighting._data)
    Tools.calcSettings.toOutputWeighting = math.matrix(worker.toOutputWeighting._data)
    const results = runFights()
    parentPort.postMessage({ id: worker.id, results: results });
}