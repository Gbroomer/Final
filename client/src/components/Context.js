import { createContext, useContext, useState } from 'react';

export const MyContext = createContext();

const MyContextProvider = ({ children }) => {

    const [user, setUser] = useState()

    const login = (userData) => {
        setUser(userData)
    }

    const logout = () => {
        setUser(null)
    }

    const rest = (cost) => {
        const updatedUser = {...user,
        gold: user.gold - cost,
        char1: {
            ...user.char1,
            current_hp: user.char1.max_hp,
            current_mp: user.char1.max_mp,
        },
        char2:{
            ...user.char2,
            current_hp: user.char2.max_hp,
            current_mp: user.char2.max_mp,
        },
        char3:{
            ...user.char3,
            current_hp: user.char3.max_hp,
            current_mp: user.char3.max_mp,
        },
        char4:{
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
            max_hp: character.character_class.hp_growth + character.max_hp,
            max_mp: character.character_class.mp_growth + character.max_mp,
            str: character.character_class.str_growth + character.str,
            agi: character.character_class.agi_growth + character.agi,
            con: character.character_class.con_growth + character.con,
            mag: character.character_class.mag_growth + character.mag,
            res: character.character_class.res_growth + character.res,
            spd: character.character_class.spd_growth + character.spd,
        }
        console.log(updatedCharacter)
        updatedUser[`char${characterIndex}`] = updatedCharacter
        return updatedUser
    }

    const equip = (item, character, slot) => {
        const updatedUser = {...user}
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
        const updatedUser = {...user}
        const characterObj = updatedUser[character]

        if (item.consumable_effect === 'heal') {
            const healAmount = Math.round(Math.floor(
                Math.random() * (item.consumable_potency) + 1
            ) + (0.25 * characterObj.con))
            characterObj.current_hp + healAmount > characterObj.max_hp ? characterObj.current_hp=characterObj.max_hp : characterObj.current_hp += healAmount
        }
        if (item.consumable_effect === 'mana') {
            const restoreAmount = Math.round(Math.floor(
                Math.random() * (item.consumable_potency) + 1
            ) + (0.25 * characterObj.con))
            characterObj.current_mp + restoreAmount > characterObj.max_mp ? characterObj.current_mp=characterObj.max_mp : characterObj.current_mp += restoreAmount
        }
        updatedUser.inv[0][slot] = null
        setUser(updatedUser)
    }

    const addXp = (xpGain, goldGain) => {
        const updatedUser = { ...user }
        updatedUser.xp += xpGain;
        updatedUser.gold += goldGain
        let levelUpOccured = false;
        let indexArray = [1,2,3,4]
        while (updatedUser.xp >= xpThreshold(updatedUser.lvl)) {
            updatedUser.xp -= xpThreshold(updatedUser.lvl)
            updatedUser.lvl++
            indexArray.map(index => {
                levelUpCharacter(updatedUser, index)
            })
            levelUpOccured = true;
        }
        console.log(updatedUser)
        setUser(updatedUser)
        return levelUpOccured
    }

    const sell = (item, slot) => {
        const updatedUser = {...user}
        updatedUser.inv[0][slot] = null
        updatedUser.gold += Math.round(item.cost /2)
        setUser(updatedUser)
    }
    const buy = (item, slot) => {
        const updatedUser = {...user}
        updatedUser.inv[0][slot] = item
        updatedUser.gold -= item.cost
        setUser(updatedUser)
    }

    return (
        <MyContext.Provider value={{ user, login, logout, updateCharacter, addXp, rest, equip, consumeItem, buy, sell }}>
            {children}
        </MyContext.Provider>
    )
}

export default MyContextProvider