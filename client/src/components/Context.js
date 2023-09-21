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
        const availableMonsters = environ.monsters.filter(({ monster }) => monster.lvl <= (user.lvl + 4))
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
                let levelUpOccured
                let updatedUser = {...user}
                if (targetMonster && targetMonster.hp > 0) {

                    targetMonster.hp -= damage
                    tempArray.push(`${turnOrder[0].char_name} dealt ${damage} to the target ${targetMonster.name}!`)
                    if (targetMonster.hp <= 0) {
                        tempArray.push(`The target ${targetMonster.name} died!`)
                        await addXp(targetMonster.exp, targetMonster.gold, updatedUser, levelUpOccured)
                        tempArray.push(`You gained ${targetMonster.exp}xp and ${targetMonster.gold} gold!`)
                        if(levelUpOccured) {
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

    const damageChar = async (damage, character) => {
        return new Promise(async (resolve) => {
            const updatedUser  = {...user}
            const updatedTurnOrder = [...turnOrder]
            const tempArray = [...textResp]
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
            resolve()
        })
    }

    const dodged = (dodger, attacker, attacks) =>{
        const tempArray = [...textResp]
        const updatedTurnOrder = [...turnOrder]
        tempArray.push([`The ${turnOrder[dodger].name ? turnOrder[dodger].name : turnOrder[dodger].char_name} dodged an attack from ${attacker.name ? attacker.name : attacker.char_name}!`])
        setTextResp(tempArray)
        if (attacks === 1) {
            const firstEntity = updatedTurnOrder.shift()
            updatedTurnOrder.push(firstEntity)
            setTurnOrder(firstEntity)
        }
    }
    
    const victory = () => {
        console.log('nice')
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
                // current_hp: character.character_class.hp_growth + character.current_hp,
                // current_mp: character.character_class.mp_growth + character.current_mp,
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

    const addXp = async (xpGain, goldGain, updatedUser, levelUpOccured) => {
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
                levelUpOccured = true;
            }
            // setUser(updatedUser)
            resolve(levelUpOccured, updatedUser)
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

    const consumeItem = (item, character, slot) => {
        const updatedUser = { ...user }
        const characterObj = updatedUser[character]

        if (item.consumable_effect === 'heal') {
            const healAmount = Math.round(Math.floor(
                Math.random() * (item.consumable_potency) + 1
            ) + (0.25 * characterObj.con))
            characterObj.current_hp + healAmount > characterObj.max_hp ? characterObj.current_hp = characterObj.max_hp : characterObj.current_hp += healAmount
        }
        if (item.consumable_effect === 'mana') {
            const restoreAmount = Math.round(Math.floor(
                Math.random() * (item.consumable_potency) + 1
            ) + (0.25 * characterObj.con))
            characterObj.current_mp + restoreAmount > characterObj.max_mp ? characterObj.current_mp = characterObj.max_mp : characterObj.current_mp += restoreAmount
        }
        updatedUser.inv[0][slot] = null
        setUser(updatedUser)
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
            victory,
            damageChar,
        }}>
            {children}
        </MyContext.Provider>
    )
}

export default MyContextProvider