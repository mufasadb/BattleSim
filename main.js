const Pokemon = require("./Pokemon");
const Battle = require("./battle");
const Member = require("./remember")
const cluster = require("cluster");
const numpCPUs = require("os").cpus().length

const fightSettings = {
    turnsBeforeCallDraw: 100,
    numberOfIterationsInTestFight: 10000,
    moveLogic: "random" //random, stab, typeadvantage, power, mostDamage
}

function oneTest(fightSettings) {
    const Remember = Member.create()
    const fromTime = new Date().getTime()

    function iterativeTest(fightSettings) {
        for (let i = 0; i < fightSettings.numberOfIterationsInTestFight; i++) {
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

    console.log(`${process.pid} Draws: ${Remember.score.draws}`)
    console.log(`${process.pid} Team One won ${Math.round((Remember.score.teamOneWins / (Remember.score.teamOneWins + Remember.score.teamTwoWins) * 10000)) / 100} % of time`)
    console.log(`${process.pid} Average Turns per battle ${Remember.score.totalTurnsToWin / Remember.score.played} `)

    console.log(`${process.pid} It took ${timeDiff} seconds to run`)

    return (Remember)
}
// console.log(oneTest(fightSettings));


if (cluster.isMaster) {
    for (let i = 0; i < 3; i++) {
        cluster.fork();
    }
    console.log("I am master")
} else {
    console.log(`${process.pid} I am worker`)
    oneTest(fightSettings)
    process.exit(0)
}
