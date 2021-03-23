class Memory {
    constructor() {
        this.moveDamageData = {}
        this.monData = {}
        this.score = {
            wins: 0,
            draws: 0,
            played: 0,
            teamOneWins: 0,
            teamTwoWins: 0,
            totalTurnsToWin: 0,
        }
    }
    rememberDamage(moveName, damage) {
        this.checkAndCreateMove(moveName)
        this.moveDamageData[moveName].damage = this.moveDamageData[moveName].damage + damage
        this.moveDamageData[moveName].useCount++
    }

    inflictedStatus(moveName, inflictedStatus) {
        checkAndCreateMove(moveName)
        this.moveDamageData[moveName].statusInfliction[inflictedStatus]++
    }

    countMove(moveName, didWin) {
        this.checkAndCreateMove(moveName)
        if (didWin) {
            this.moveDamageData[moveName].winCount++
        } else { this.moveDamageData[moveName].lossCount++ }
    }

    rememberMonResult(mon, didWin) {
        this.checkAndCreateMon(mon.name)
        if (didWin) {
            this.monData[mon.name].winCount++
        }
        else { this.monData[mon.name].lossCount++ }
        this.rememberMonSpecicificMove(mon, didWin)
    }

    rememberMonSpecicificMove(mon, didWin) {
        for (move of mon.moves) {
            if (!this.monData[mon.name].moves[move.name]) {
                this.monData[mon.name].moves[move.name] = { name: move.name, winCount: 0, lossCount: 0, useCount: 0 }
            }
            if (didWin) {
                this.monData[mon.name].moves[move.name].winCount++
            } else {
                this.monData[mon.name].moves[move.name].lossCount++
            }
            this.countMove(move.name, didWin)
        }
    }

    rememberMoveUseForMon(monName, moveName) {
        this.checkAndCreateMon(monName)
        if (!this.monData[monName].moves[moveName]) {
            this.monData[monName].moves[moveName] = { name: moveName, winCount: 0, lossCount: 0, useCount: 0 }
        }
        this.monData[monName].moves[moveName].useCount++
    }


    returnMonDataSorted() {
        let returnArray = []
        returnArray = Object.values(this.monData)
        returnArray.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? 1 : -1)
        this.sortMonMoves()
        return returnArray
    }

    returnDamageDataSorted() {
        let returnArray = []
        returnArray = Object.values(this.moveDamageData)
        returnArray.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? 1 : -1)
        return returnArray
    }

    sortMonMoves() {
        for (mon of Object.values(this.monData)) {
            let returnArray = []
            returnArray = Object.values(mon.moves)
            returnArray.sort((a, b) => (a.winCount / (a.winCount + a.lossCount) > b.winCount / (b.winCount + b.lossCount)) ? -1 : 1)
            mon.sortedMoves = returnArray
        }
    }

    recallMoveData(moveName, monName) {
        this.checkAndCreateMove(moveName)
        let moveData = this.moveDamageData[moveName]
        this.checkAndCreateMon(monName)
        if (!this.monData[monName].moves[moveName]) {
            this.monData[monName].moves[moveName] = { name: moveName, winCount: 0, lossCount: 0, useCount: 0 }
        }
        let monMoveData = this.monData[monName].moves[moveName]

        return { genericMoveData: moveData, relevantMoveData: monMoveData }
    }

    checkAndCreateMon(monName) {
        if (!this.monData[monName]) {
            this.monData[monName] = { name: monName, moves: {}, useCount: 0, winCount: 0, lossCount: 0, deathCount: 0, killCount: 0 }
        }
    }

    checkAndCreateMove(moveName) {
        if (!this.moveDamageData[moveName]) {
            this.moveDamageData[moveName] = { name: moveName, damage: 0, useCount: 1, winCount: 0, lossCount: 0 }
        }
    }

    rememberLifeAndDeath(monName, isKill) {
        this.checkAndCreateMon(monName)
        if (isKill) {
            this.monData[monName].killCount++
        } else { this.monData[monName].deathCount++ }
    }

    recordDeaths(teamNumber, isKill) {
        if (teamNumber == 1) {
            if (isKill) {
                teamStats.teamOneKills++
            } else { teamStats.teamOneDeaths++ }
        }
    }
}

module.exports = {
    create: () => { return new Memory() }
}

