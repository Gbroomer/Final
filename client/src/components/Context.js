import { createContext, useContext, useState } from 'react';
import { resolvePath } from 'react-router-dom';

export const MyContext = createContext();

const MyContextProvider = ({ children }) => {

    const [user, setUser] = useState()
    const [monsters, setMonsters] = useState()
    const [environment, setEnvironment] = useState()
    const [environments, setEnvironments] = useState()
    const [textResp, setTextResp] = useState([])
    const [turnOrder, setTurnOrder] = useState([])

    const login = (userData) => {
        setUser(userData)
    }

    const logout = () => {
        setUser(null)
    }

    const generateTurnOrder = (monstersArray) => {
        const userChars = [user.char1, user.char2, user.char3, user.char4]
        const initiativeValues = []
        userChars.forEach((char) => {
            if (char.current_hp > 0) {
                const charInit = Math.random() * 100 + char.spd * 5;
                initiativeValues.push({ type: 'character', value: charInit, data: char })
            }
        })
        monstersArray.forEach((mon, index) => {
            const monsterInit = Math.random() * 100 + mon.spd * 5
            const uniqueKey = index + 1
            initiativeValues.push({ type: 'monster', value: monsterInit, data: { ...mon, uniqueKey } })
        })
        initiativeValues.sort((a, b) => b.value - a.value)

        const turnOrder = initiativeValues.map((initiative) => initiative.data)
        console.log(turnOrder)
        setTurnOrder(turnOrder)
    }

    const generateMonsters = (environ) => {
        setEnvironment(environ)
        const availableMonsters = environ.monsters.filter(({ monster }) => monster.lvl <= (user.lvl + 4) && monster.lvl >= (user.lvl - 3))
        const selectedMonsters = []
        const maxDifficultyLevel = user.lvl + 9
        let totalMonsterLevel = 0
        const monsterCount = Math.floor(Math.random() * 5) + 1
        console.log(monsterCount)
        while (selectedMonsters.length < monsterCount && totalMonsterLevel <= maxDifficultyLevel) {
            const rngIndex = Math.floor(Math.random() * availableMonsters.length)
            const rngMonster = availableMonsters[rngIndex].monster

            if (totalMonsterLevel + rngMonster.lvl <= maxDifficultyLevel) {
                selectedMonsters.push(rngMonster)
                totalMonsterLevel += rngMonster.lvl
            } else {
                break;
            }
        }
        console.log(selectedMonsters)
        const updatedTextRes = selectedMonsters.length > 1 ? [`A group of ${selectedMonsters.length} monsters attacks!`] : [`A single ${selectedMonsters[0].name} attacks!`]
        console.log(updatedTextRes)
        setTextResp(updatedTextRes)
        setMonsters(selectedMonsters)
        generateTurnOrder(selectedMonsters)
    }

    const damageMonster = async (damage, monster) => {
        return new Promise(async (resolve) => {
            if (monster !== -1) {
                const updatedTurnOrder = [...turnOrder]
                const targetMonster = updatedTurnOrder[monster]
                const tempArray = [...textResp]
                let updatedUser = { ...user }
                if (targetMonster && targetMonster.hp > 0) {

                    targetMonster.hp -= damage
                    tempArray.push(`${turnOrder[0].char_name} dealt ${damage} to the target ${targetMonster.name}!`)
                    if (targetMonster.hp <= 0) {
                        tempArray.push(`The target ${targetMonster.name} died!`)
                        await addXp(targetMonster.exp, targetMonster.gold, updatedUser)
                        tempArray.push(`You gained ${targetMonster.exp}xp and ${targetMonster.gold} gold!`)
                        if ((user.xp + targetMonster.exp) >= xpThreshold(user.lvl)) {
                            tempArray.push(`Your party has leveled up!`)
                        }
                        updatedTurnOrder.splice(monster, 1)
                    }
                    const firstEntity = updatedTurnOrder.shift()
                    updatedTurnOrder.push(firstEntity)
                    setTurnOrder(updatedTurnOrder)
                    setUser(updatedUser)
                    setTextResp(tempArray)
                }
            }
            resolve()
        })
    }

    const setBattleMaps = (environments) => {
        setEnvironments(environments)
    }

    const confirmDamage = (damage, character, updatedUser, updatedTurnOrder, tempArray) => {
            for (let i = 1; i < 5; i++) {
                if (user[`char${i}`].id === character.id) {
                    updatedUser[`char${i}`].current_hp -= damage
                    tempArray.push(`The ${turnOrder[0].name} attacked ${updatedUser[`char${i}`].char_name} and dealt ${damage} to them!`)
                    if (updatedUser[`char${i}`].current_hp <= 0) {
                        const charIndex = updatedTurnOrder.findIndex(char => char.id === character.id)
                        updatedTurnOrder.splice(charIndex, 1)
                        tempArray.push(`${updatedUser[`char${i}`].char_name} died!`)
                        updatedUser[`char${i}`].current_hp = 0
                        break
                    }
                    break
                }
            }
            const firstEntity = updatedTurnOrder.shift()
            updatedTurnOrder.push(firstEntity)
            setUser(updatedUser)
            setTextResp(tempArray)
            setTurnOrder(updatedTurnOrder)
    }

    const damageChar = async (damage, character) => {
        return new Promise(async (resolve) => {
            const updatedUser = { ...user }
            const updatedTurnOrder = [...turnOrder]
            const tempArray = [...textResp]
            if (turnOrder[0].status === 'bleed') {
                    let bleedDamage = Math.round(Math.floor(Math.random() * (turnOrder[0].con / 3)) + 1)
                    turnOrder[0].hp -= bleedDamage
                    tempArray.push(`${turnOrder[0].name} bled for ${bleedDamage}!`)
                    if (turnOrder[0].hp <= 0) {
                        tempArray.push(`${turnOrder[0].name} died!`)
                        await addXp(turnOrder[0].exp, turnOrder[0].gold, updatedUser)
                        tempArray.push(`You gained ${turnOrder[0].exp}xp and ${turnOrder[0].gold} gold!`)
                        if ((user.xp + turnOrder[0].exp) >= xpThreshold(user.lvl)) {
                            tempArray.push(`Your party has leveled up!`)
                        }
                        updatedTurnOrder.splice(0, 1)
                        setTurnOrder(updatedTurnOrder)
                    } else {
                        confirmDamage(damage, character, updatedUser, updatedTurnOrder, tempArray)
                    }
                    setTextResp(tempArray)
            } else {
                confirmDamage(damage, character, updatedUser, updatedTurnOrder, tempArray)
            }
        resolve()
        })
    }

    const healChar = async (heal, cost, character) => {
        return new Promise(async (resolve) => {
            const updatedUser = { ...user }
            const updatedTurnOrder = [...turnOrder]
            const tempArray = [...textResp]
            for (let i = 1; i < 5; i++) {
                if (user[`char${i}`].id === turnOrder[0].id) {
                    updatedUser[`char${i}`].current_mp -= cost
                    break
                }
            }
            for (let i = 1; i < 5; i++) {
                if (user[`char${i}`].id === character.id) {
                    updatedUser[`char${i}`].current_hp += heal
                    tempArray.push(`${turnOrder[0].char_name} healed ${turnOrder[0].char_name} for ${heal}!`)
                    if (updatedUser[`char${i}`].current_hp > updatedUser[`char${i}`].max_hp) {
                        updatedUser[`char${i}`].current_hp = updatedUser[`char${i}`].max_hp
                    }
                    break
                }
            }
            const firstEntity = updatedTurnOrder.shift()
            updatedTurnOrder.push(firstEntity)
            setUser(updatedUser)
            setTextResp(tempArray)
            setTurnOrder(updatedTurnOrder)
        })
    }

    const spellTarget = async (damage, cost, target, spell) => {
        return new Promise(async (resolve) => {
            const updatedUser = { ...user }
            const updatedTurnOrder = [...turnOrder]
            const tempArray = [...textResp]
            const targetMonster = updatedTurnOrder[target]

            for (let i = 1; i < 5; i++) {
                if (user[`char${i}`].id === turnOrder[0].id) {
                    updatedUser[`char${i}`].current_mp -= cost
                    break
                }
            }

            if (targetMonster && targetMonster.hp > 0) {
                targetMonster.hp -= damage
                tempArray.push(`${turnOrder[0].char_name} dealt ${damage} to the target ${targetMonster.name} with a ${spell.name}!`)
                if (targetMonster.hp <= 0) {
                    tempArray.push(`The target ${targetMonster.name} died!`)
                    await addXp(targetMonster.exp, targetMonster.gold, updatedUser)
                    tempArray.push(`You gained ${targetMonster.exp}xp and ${targetMonster.gold} gold!`)
                    if ((user.xp + targetMonster.exp) >= xpThreshold(user.lvl)) {
                        tempArray.push(`Your party has leveled up!`)
                    }
                    updatedTurnOrder.splice(target, 1)
                }
                const firstEntity = updatedTurnOrder.shift()
                updatedTurnOrder.push(firstEntity)
                setTurnOrder(updatedTurnOrder)
                setUser(updatedUser)
                setTextResp(tempArray)
            }
            resolve()
        })
    }

    const stunTarget = async (damage, cost, target, spell, success) => {
        return new Promise(async (resolve) => {
            const updatedUser = { ...user }
            const updatedTurnOrder = [...turnOrder]
            const tempArray = [...textResp]
            const targetMonster = updatedTurnOrder[target]

            for (let i = 1; i < 5; i++) {
                if (user[`char${i}`].id === turnOrder[0].id) {
                    updatedUser[`char${i}`].current_mp -= cost
                    break
                }
            }

            if (targetMonster && targetMonster.hp > 0) {
                targetMonster.hp -= damage
                tempArray.push(`${turnOrder[0].char_name} dealt ${damage} to the target ${targetMonster.name} with a ${spell.name}!`)
                if (targetMonster.hp <= 0) {
                    tempArray.push(`The target ${targetMonster.name} died!`)
                    await addXp(targetMonster.exp, targetMonster.gold, updatedUser)
                    tempArray.push(`You gained ${targetMonster.exp}xp and ${targetMonster.gold} gold!`)
                    if ((user.xp + targetMonster.exp) >= xpThreshold(user.lvl)) {
                        tempArray.push(`Your party has leveled up!`)
                    }
                    updatedTurnOrder.splice(target, 1)
                    const firstEntity = updatedTurnOrder.shift()
                    updatedTurnOrder.push(firstEntity)
                } else if (success === true) {
                    const shiftedTarget = updatedTurnOrder.splice(target, 1)[0]
                    const firstEntity = updatedTurnOrder.shift()
                    updatedTurnOrder.push(firstEntity)
                    updatedTurnOrder.push(shiftedTarget)
                    tempArray.push(`${turnOrder[0].char_name} successfully stunned the ${targetMonster.name}!`)
                } else {
                    tempArray.push(`${turnOrder[0].char_name} failed to stun the ${targetMonster.name}`)
                    const firstEntity = updatedTurnOrder.shift()
                    updatedTurnOrder.push(firstEntity)
                }
                setTurnOrder(updatedTurnOrder)
                setUser(updatedUser)
                setTextResp(tempArray)
            }
            resolve()
        })
    }

    const bleedTarget = async (damage, cost, target, spell, success) => {
        return new Promise(async (resolve) => {
            const updatedUser = { ...user }
            const updatedTurnOrder = [...turnOrder]
            const tempArray = [...textResp]
            const targetMonster = updatedTurnOrder[target]

            for (let i = 1; i < 5; i++) {
                if (user[`char${i}`].id === turnOrder[0].id) {
                    updatedUser[`char${i}`].current_mp -= cost
                    break
                }
            }

            if (targetMonster && targetMonster.hp > 0) {
                targetMonster.hp -= damage
                tempArray.push(`${turnOrder[0].char_name} dealt ${damage} to the target ${targetMonster.name} with a ${spell.name}!`)
                if (targetMonster.hp <= 0) {
                    tempArray.push(`The target ${targetMonster.name} died!`)
                    await addXp(targetMonster.exp, targetMonster.gold, updatedUser)
                    tempArray.push(`You gained ${targetMonster.exp}xp and ${targetMonster.gold} gold!`)
                    if ((user.xp + targetMonster.exp) >= xpThreshold(user.lvl)) {
                        tempArray.push(`Your party has leveled up!`)
                    }
                    updatedTurnOrder.splice(target, 1)
                } else if (success === true) {
                    targetMonster.status = 'bleed'
                    targetMonster.status_duration = spell.effect_duration
                    tempArray.push(`${turnOrder[0].char_name} successfully caused the ${targetMonster.name} to bleed!`)
                } else {
                    tempArray.push(`${turnOrder[0].char_name} failed to cause the ${targetMonster.name} to bleed`)
                    const firstEntity = updatedTurnOrder.shift()
                    updatedTurnOrder.push(firstEntity)
                }
                const firstEntity = updatedTurnOrder.shift()
                updatedTurnOrder.push(firstEntity)
                setTurnOrder(updatedTurnOrder)
                setUser(updatedUser)
                setTextResp(tempArray)
            }

            resolve()
        })
    }

    const triggerBleed = async () => {
        return new Promise(async (resolve) => {
            const updatedTurnOrder = [...turnOrder]
            const tempArray = [...textResp]
            let updatedUser = { ...user }
            
            resolve()
        })
    }

    const insufficientMana = async () => {
        const tempArray = [...textResp]
        tempArray.push(`Insufficient MP`)
        setTextResp(tempArray)
    }

    const dodged = (dodger, attacker, attacks) => {
        const tempArray = [...textResp]
        const updatedTurnOrder = [...turnOrder]
        const dodgerName = dodger ? (dodger.name || dodger.char_name) : "Unknown"
        const attackerName = attacker ? (attacker.name || attacker.char_name) : "Unknown"
        tempArray.push([`${dodgerName} dodged an attack from ${attackerName}!`])
        setTextResp(tempArray)
        if (attacks === 1) {
            const firstEntity = updatedTurnOrder.shift()
            updatedTurnOrder.push(firstEntity)
            setTurnOrder(updatedTurnOrder)
        }
    }

    const runVictory = () => {
        const tempArray = [...textResp]
        tempArray.push(`You have defeated the Enemies!`)
        setTextResp(tempArray)
    }

    const runLoss = () => {
        const tempArray = [...textResp]
        tempArray.push(`You have been defeated!`)
        setTextResp(tempArray)
    }

    const runAway = (charSpeed, monSpeed) => {
        const tempArray = [...textResp]
        const updatedTurnOrder = [...turnOrder]
        if (charSpeed >= monSpeed) {
            tempArray.push(`You have successfully escaped the fight!`)
            setTextResp(tempArray)
        } else {
            tempArray.push(`You have failed to escape the fight!`)
            setTextResp(tempArray)
            const firstEntity = updatedTurnOrder.shift()
            updatedTurnOrder.push(firstEntity)
            setTurnOrder(updatedTurnOrder)
        }
    }

    const inspection = (monster) => {
        const tempArray = [...textResp]
        const monsterOriginal = monsters.findIndex(monst => monst.id === monster.id)
        console.log(monsterOriginal)
        const monsterHpStatus = monster.hp / monsters[monsterOriginal].hp
        console.log(monsterHpStatus)
        if (monsterHpStatus <= 0.25) {
            tempArray.push(`${monster.name} is near death!`)
        } else if (monsterHpStatus <= 0.5) {
            tempArray.push(`${monster.name} is very hurt!`)
        } else if (monsterHpStatus <= 0.75) {
            tempArray.push(`${monster.name} is injured!`)
        } else if (0.75 < monsterHpStatus < 1) {
            tempArray.push(`${monster.name} is barely hurt!`)
        } else if (monsterHpStatus === 1) {
            tempArray.push(`${monster.name} is unharmed!`)
        }
        console.log(tempArray)
        setTextResp(tempArray)
    }

    const resetText = async () => {
        setTextResp([])
    }

    const resetBattle = () => {
        setMonsters()
        setEnvironment()
        setTextResp([])
        setTurnOrder([])
    }

    const rest = (cost) => {
        const updatedUser = {
            ...user,
            gold: user.gold - cost,
            char1: {
                ...user.char1,
                current_hp: user.char1.max_hp,
                current_mp: user.char1.max_mp,
            },
            char2: {
                ...user.char2,
                current_hp: user.char2.max_hp,
                current_mp: user.char2.max_mp,
            },
            char3: {
                ...user.char3,
                current_hp: user.char3.max_hp,
                current_mp: user.char3.max_mp,
            },
            char4: {
                ...user.char4,
                current_hp: user.char4.max_hp,
                current_mp: user.char4.max_mp,
            },
        }
        setUser(updatedUser)
    }

    const updateCharacter = (characterIndex, stat, value) => {

        const updatedUser = { ...user }
        updatedUser[`char${characterIndex}`][stat] = value
        setUser(updatedUser)
    }

    const levelUpCharacter = (updatedUser, characterIndex) => {

        const character = updatedUser[`char${characterIndex}`]
        // console.log(character.character_class)
        const updatedCharacter = {
            ...character,
            current_hp: character.current_hp <= 0 ? 0 : character.character_class.hp_growth + character.current_hp,
            current_mp: character.character_class.mp_growth + character.current_mp,
            max_hp: character.character_class.hp_growth + character.max_hp,
            max_mp: character.character_class.mp_growth + character.max_mp,
            str: character.character_class.str_growth + character.str,
            agi: character.character_class.agi_growth + character.agi,
            con: character.character_class.con_growth + character.con,
            mag: character.character_class.mag_growth + character.mag,
            res: character.character_class.res_growth + character.res,
            spd: character.character_class.spd_growth + character.spd,
        }
        updatedUser[`char${characterIndex}`] = updatedCharacter
        return updatedUser
    }

    const addXp = async (xpGain, goldGain, updatedUser) => {
        return new Promise(resolve => {
            updatedUser.xp += xpGain;
            updatedUser.gold += goldGain
            let indexArray = [1, 2, 3, 4]
            while (updatedUser.xp >= xpThreshold(updatedUser.lvl)) {
                updatedUser.xp -= xpThreshold(updatedUser.lvl)
                updatedUser.lvl++
                indexArray.map(index => {
                    levelUpCharacter(updatedUser, index)
                })
            }
            resolve(updatedUser)
        })
    }

    const equip = (item, character, slot) => {
        const updatedUser = { ...user }
        const characterObj = updatedUser[character]
        let replacedItem
        if (item.type === 'wep') {
            replacedItem = characterObj.weapon
            characterObj.weapon = item
        } else if (item.type === 'arm') {
            replacedItem = characterObj.armor
            characterObj.armor = item
        };
        updatedUser.inv[0][slot] = null
        updatedUser.inv[0][slot] = replacedItem
        setUser(updatedUser)
        console.log(updatedUser)
    }

    const xpThreshold = (level) => {
        return Math.pow(2, level)
    }

    const consumeItem = async (item, character, slot) => {
        return new Promise((resolve) => {
            const updatedUser = { ...user }
            const characterObj = updatedUser[character]
            const tempArray = [...textResp]
            const healAmount = Math.round(Math.floor(
                Math.random() * (item.consumable_potency) + 1
            ) + (0.25 * characterObj.con))
            const restoreAmount = Math.round(Math.floor(
                Math.random() * (item.consumable_potency) + 1
            ) + (0.25 * characterObj.res))

            if (item.consumable_effect === 'heal') {
                characterObj.current_hp + healAmount > characterObj.max_hp ? characterObj.current_hp = characterObj.max_hp : characterObj.current_hp += healAmount
                tempArray.push(`${item.name} healed ${characterObj.char_name} for ${healAmount}!`)
            }
            if (item.consumable_effect === 'mana') {
                characterObj.current_mp + restoreAmount > characterObj.max_mp ? characterObj.current_mp = characterObj.max_mp : characterObj.current_mp += restoreAmount
                tempArray.push(`${item.name} restored Mp to ${characterObj.char_name} for ${restoreAmount}!`)
            }
            updatedUser.inv[0][slot] = null
            setUser(updatedUser)

            if (turnOrder.length > 0) {
                const updatedTurnOrder = [...turnOrder]
                const firstEntity = updatedTurnOrder.shift()
                updatedTurnOrder.push(firstEntity)
                setTextResp(tempArray)
                setTurnOrder(updatedTurnOrder)
            }

        })
    }

    const sell = (item, slot) => {
        const updatedUser = { ...user }
        updatedUser.inv[0][slot] = null
        updatedUser.gold += Math.round(item.cost / 2)
        setUser(updatedUser)
    }

    const buy = (item, slot) => {
        const updatedUser = { ...user }
        updatedUser.inv[0][slot] = item
        updatedUser.gold -= item.cost
        setUser(updatedUser)
    }

    return (
        <MyContext.Provider value={{
            user,
            monsters,
            environment,
            environments,
            textResp,
            turnOrder,
            setBattleMaps,
            login,
            logout,
            updateCharacter,
            addXp,
            rest,
            equip,
            consumeItem,
            buy,
            sell,
            generateMonsters,
            resetBattle,
            damageMonster,
            resetText,
            dodged,
            damageChar,
            inspection,
            healChar,
            insufficientMana,
            runVictory,
            runLoss,
            runAway,
            spellTarget,
            stunTarget,
            bleedTarget,
            triggerBleed,
        }}>
            {children}
        </MyContext.Provider>
    )
}

export default MyContextProvider