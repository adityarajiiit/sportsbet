import dotenv from 'dotenv'
dotenv.config({ path: '../../.env' })
import prisma from '../utils/prisma.js'
import { inngest } from '../inngest/inngest.js'
import { sendKafkaMessage } from "../utils/kafka.js/producer.js"
import { io } from "../index.js"
const newBet = async (req, res) => {
    try {
        const userId = req.userId
        console.log(userId)
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(400).json({ error: "No user" })
        }
        const data = req.body
        console.log(data)
        const bet = await prisma.$transaction(async (tx) => {
            const match = await tx.match.findUnique({
                where: {
                    id: data.matchId
                }
            })
            if (!match || match.matchState === "Complete") {
                throw new Error("match is already complete")
            }
            const outcome = await tx.matchbetoutcomes.findUnique({
                where: {
                    id: data.matchoutcomeId
                }
            })
            if (!outcome) {
                throw new Error("outcome not found")
            }
            const wallet = await tx.wallet.findUnique({
                where: {
                    userId: user.id
                }
            })
            if (!wallet || wallet.balance < parseFloat(data.amount)) {
                throw new Error("insufficient funds")
            }
            await tx.wallet.update({
                where: {
                    userId: user.id
                },
                data: {
                    balance: {
                        decrement: parseFloat(data.amount)
                    }
                }
            })
            const bet = await tx.bet.create({
                data: {
                    userId: user.id,
                    matchId: data.matchId,
                    details: data.details,
                    amount: parseFloat(data.amount),
                    odds: parseFloat(outcome.odds),
                    status: "pending",
                    type: data.type,
                    matchbetId: data.matchbetId,
                    matchoutcomeId: data.matchoutcomeId,
                }
            })
            return bet
        })
        console.log(bet)
        if (!bet) {
            return res.status(400).json({ error: "bet not created" })
        }

        await sendKafkaMessage('betting',bet.id,bet)
        await inngest.send({
            name: "bet.alerts",
            data: bet
        })

        return res.json({ bet })

    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}
const getBets = async (req, res) => {
    try {
        const userId = req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(400).json({ error: "no user found" })
        }
        const matchId = req.params.id
        const bets = await prisma.bet.findMany({
            where: {
                matchId: matchId,
                issold: false
            },
            include: {
                user: true,
                match: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        if (!bets) {
            return res.status(400).json({ error: "no bets found" })
        }
        return res.json({ bets })
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}
const getUserBets = async (req, res) => {
    try {
        const userId = req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(400).json({ error: "no user found" })
        }
        const bets = await prisma.bet.findMany({
            where: {
                userId: user.id
            },
            include: {
                match: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        if (!bets) {
            return res.status(400).json({ error: "no bets found" })
        }
        return res.json({ bets })
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}
const getUserBetsbyMatch = async (req, res) => {
    try {
        const userId = req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(400).json({ error: "no user found" })
        }
        const matchId = req.params.id
        if (!matchId) {
            return res.status(400).json({ error: "no matchId provided" })
        }
        const bets = await prisma.bet.findMany({
            where: {
                userId: user.id,
                matchId: matchId
            },
            include: {
                match: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })
        if (!bets) {
            return res.status(400).json({ error: "no bets found" })
        }
        return res.json({ bets })
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}
const modifyBet = async (req, res) => {
    try {
        const userId = req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(400).json({ error: "no user" })
        }
        const betId = req.params.id
        if (!betId) {
            return res.status(400).json({ error: "no betid is present" })
        }
        const data = req.body
        const bet = await prisma.$transaction(async (tx) => {
            const currentBet = await tx.bet.findUnique({
                where: {
                    id: betId
                }
            })
            if (!currentBet || currentBet.status !== "pending" || currentBet.issold) {
                throw new Error("cannot modify")
            }
            const amountDiff = parseFloat(data.amount) - currentBet.amount
            if (amountDiff > 0) {
                const wallet = await tx.wallet.findUnique({
                    where: {
                        userId: user.id
                    }
                })
                if (!wallet || wallet.balance < amountDiff) {
                    throw new Error("insufficient funds")
                }
                await tx.wallet.update({
                    where: {
                        userId: user.id
                    },
                    data: {
                        balance: {
                            decrement: amountDiff
                        }
                    }
                })
            }
            else if (amountDiff < 0) {
                await tx.wallet.update({
                    where: {
                        userId: user.id
                    },
                    data: {
                        balance: {
                            increment: Math.abs(amountDiff)
                        }
                    }
                })
            }
            const updatedBet = await tx.bet.update({
                where: {
                    id: betId,
                    userId: user.id,
                    issold: false,
                    status: "pending"
                },
                data: {
                    amount: parseFloat(data.amount),
                    details: data.details,
                }
            })
            return updatedBet
        })
        if (!bet) {
            return res.status(400).json({ error: "bet not updated" })
        }
        await sendKafkaMessage('betting',bet.id,bet)
        await inngest.send({
            name: "bet.alerts",
            data: bet
        })
        return res.json({ bet })
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}
const sellBet = async (req, res) => {
    try {
        const betId = req.params.id
        const userId = req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(400).json({ error: "user not found" })
        }
        const soldbet = await prisma.$transaction(async (tx) => {
            const currentBet = await tx.bet.findUnique({
                where: { id: betId, userId: user.id }
            })
            if (!currentBet || currentBet.status !== "pending" || currentBet.issold) {
                throw new Error("cannot sell this bet")
            }
            const outcome = await tx.matchbetoutcomes.findUnique({
                where: { id: currentBet.matchoutcomeId }
            })
            if (!outcome) {
                throw new Error("outcome not found")
            }
            const currentOdds = outcome.odds
            const rawCashoutValue = (currentBet.amount * currentBet.odds) / currentOdds
            const margin = 0.05
            const cashoutValue = parseFloat((rawCashoutValue * (1 - margin)).toFixed(2))
            const updatedbet = await tx.bet.update({
                where: {
                    id: betId,
                    userId: user.id,
                    status: "pending",
                    issold: false
                },
                data: {
                    issold: true,
                    status: "sold",
                    result: { price: cashoutValue, soldAt: new Date() }
                }
            })
            await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: cashoutValue } }
            })
            return updatedbet
        })
        if (!soldbet) {
            return res.status(400).json({ error: "bet not sold" })
        }
        await sendKafkaMessage('betting',soldbet.id,soldbet)
        await inngest.send({
            name: "bet.alerts",
            data: soldbet
        })
        io.to(userId).emit('notification',{
            message:`Your bet cashout of ₹${soldbet.result?.price} was successful`
        })
        return res.json({ soldbet })

    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}
const betOutcome = async (req, res) => {
    try {
        const userId = req.userId
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        })
        if (!user) {
            return res.status(400).json({ error: "not a user" })
        }
        if (user.role !== "Admin") {
            return res.status(403).json({ error: "not authorized" })
        }
        const betId = req.params.id
        const result = req.body.result
        if (!betId || !result) {
            return res.status(400).json({ error: "betId or result not there" })
        }
        const bet = await prisma.$transaction(async (tx) => {
            const updatedbet = await tx.bet.update({
                where: {
                    id: betId,
                    status: "pending"
                },
                data: {
                    status: "completed",
                    result: {
                        result: result,
                        gotresultAt: new Date()
                    }
                },
                include: {
                    match: true,
                    user: true
                }
            })
            if (result === "won") {
                const winnings = updatedbet.amount * updatedbet.odds
                await tx.wallet.update({
                    where: { userId: updatedbet.userId },
                    data: { balance: { increment: winnings } }
                })
            }
            return updatedbet
        })
        if (!bet) {
            return res.status(400).json({ error: "bet not updated" })
        }
        await sendKafkaMessage('betting',bet.id,bet)
        io.to(bet.userId).emit('notification',{
            message:`Your bet on ${bet.match?.title||"match"} ${result==="won"?"won":"lost"}`
        })
        return res.json({ bet })
    }
    catch (e) {
        return res.status(500).json({ error: e.message })
    }
}
export { newBet, getBets, getUserBets, getUserBetsbyMatch, modifyBet, sellBet, betOutcome }