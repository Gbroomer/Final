import { MyContext } from '../Context'
import CharacterRender from '../CharacterRenders/CharacterRender'
import { useContext, useState } from 'react'
import Inventory from './Inventory'
import { useHistory } from 'react-router-dom'
import Shop from './Shop'

function Main() {

    const { user, addXp, rest, equip, setBattleMaps, environments, resetBattle } = useContext(MyContext)
    const [choice, setChoice] = useState("")
    const [ notEnough, setNotEnough ] = useState(false)
    const history = useHistory()
    const charArray = [1, 2, 3, 4]
    const restCost = (user.lvl * 5)

    let xpThreshold = Math.pow(2, user.lvl)
    let xpValue = (user.xp / xpThreshold)

    const saveGame = async () => {
        setChoice("save")
        const saveUser = {
            id: user.id,
            xp: user.xp,
            lvl: user.lvl,
            gold: user.gold,
        }
        try {
            const response = await fetch(`http://127.0.0.1:5555/users/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(saveUser),
            })
        } catch (error) {
            console.log("Error Saving UserData: ", error)
        }
        charArray.map(async (charIndex) => {
            const saveChar = {
                str: user[`char${charIndex}`].str,
                agi: user[`char${charIndex}`].agi,
                con: user[`char${charIndex}`].con,
                mag: user[`char${charIndex}`].mag,
                res: user[`char${charIndex}`].res,
                spd: user[`char${charIndex}`].spd,
                current_hp: user[`char${charIndex}`].current_hp,
                max_hp: user[`char${charIndex}`].max_hp,
                current_mp: user[`char${charIndex}`].current_mp,
                max_mp: user[`char${charIndex}`].max_mp,
                wep_id: user[`char${charIndex}`].weapon.id,
                arm_id: user[`char${charIndex}`].armor.id,
                id: user[`char${charIndex}`].id,
            }
            try {
                const resp = await fetch(`http://127.0.0.1:5555/chars/${user[`char${charIndex}`].id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(saveChar)
                })
            } catch (error) {
                console.log("Error saving character: ", error)
            }
            // console.log(saveChar)
        })
        const saveInventory = {
            id: user.inv[0].id,
            user_id: user.id,
            slot_1: (user.inv[0].slot_1_treasure? user.inv[0].slot_1_treasure.id : null),
            slot_2: (user.inv[0].slot_2_treasure ? user.inv[0].slot_2_treasure.id : null),
            slot_3: (user.inv[0].slot_3_treasure ? user.inv[0].slot_3_treasure.id : null),
            slot_4: (user.inv[0].slot_4_treasure ? user.inv[0].slot_4_treasure.id : null),
            slot_5: (user.inv[0].slot_5_treasure ? user.inv[0].slot_5_treasure.id : null),
            slot_6: (user.inv[0].slot_6_treasure ? user.inv[0].slot_6_treasure.id : null),
            slot_7: (user.inv[0].slot_7_treasure ? user.inv[0].slot_7_treasure.id : null),
            slot_8: (user.inv[0].slot_8_treasure ? user.inv[0].slot_8_treasure.id : null),
            slot_9: (user.inv[0].slot_9_treasure ? user.inv[0].slot_9_treasure.id : null),
            slot_10: (user.inv[0].slot_10_treasure ? user.inv[0].slot_10_treasure.id : null),
        }
        console.log(user.inv[0])
        console.log(saveInventory)
        try {
            const invResp = await fetch(`http://127.0.0.1:5555/inventories/${user.inv[0].id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(saveInventory)
            })
        } catch (error) {
            console.log("Inventory PATCH error:", error)
        }

    }

    const resetChoice = () => {
        setChoice("")
        setNotEnough(false)
    }

    const longRest = () => {
        if (user.gold >= restCost) {
            rest(restCost)
            setChoice("")
        }
        else (
            setNotEnough(true)
        )
    }

    const battleInit = async () => {
        resetBattle()
        if(environments) {
            history.push('/battlemap')
        }
        try {
            const response = await fetch('http://127.0.0.1:5555/environments')
            const environs = await response.json()
            console.log(environs)
            setBattleMaps(environs)
            history.push('/battlemap')
        } catch (error) {
            console.log("Error Fetching Monsters: ", error)
        }
    }

    const cheat = () => {
        let updatedUser = {...user}
        let levelUpOccured
        addXp(25, 50, updatedUser, levelUpOccured)
    }

    return (
        <div>
            <div className='rpg-box'>
                <h4>Level: {user.lvl}        Gold: {user.gold}</h4>
                        <h6>
                            {user.xp} / {xpThreshold} xp
                        </h6>
                <div className='rpg-progress' style={{ display: 'flex' }}>
                    <div className='rpg-progress-bar' style={{ width: `${xpValue * 100}%`, backgroundColor: 'purple'}}>
                    </div>
                </div>
                <div style={{ display: 'flex' }}>
                    {charArray.map(index => (
                        <div className='rpg-box' key={index} style={{ flex: '1' }}>
                            <CharacterRender characterData={user[`char${index}`]} inv={choice === "inventory" ? true : false} user={user} />
                        </div>
                    ))}
                </div>
            </div>
            {choice === "" && (
                <div className='centered-menu rpg-box' >
                    <button className='rpg-button rpg-text-options' onClick={() => battleInit()}>Venture Forth</button>
                    <button className='rpg-button rpg-text-options' onClick={() => setChoice("inventory")}>Inventory</button>
                    <button className='rpg-button rpg-text-options' onClick={() => setChoice("shop")}>Shop</button>
                    <button className='rpg-button rpg-text-options' onClick={() => setChoice('rest')}>Rest</button>
                    <button className='rpg-button rpg-text-options' onClick={saveGame}>Save</button>
                    <button className='rpg-button rpg-text-options' onClick={() => history.push('/About')}>About</button>
                </div>
            )}
            {choice === "inventory" && (
                <div>
                    <Inventory />
                    <div className='rpg-box back-button'>
                        <h2 className='rpg-button' onClick={resetChoice}>Go Back</h2>
                    </div>
                </div>
            )}
            {choice === "shop" && (
                <div>
                    <Shop />
                    <div className='rpg-box back-button'>
                        <h2 className='rpg-button' onClick={resetChoice}>Go Back</h2>
                    </div>
                </div>
            )}
            {choice === "rest" && (
                <div className='rpg-box rest-button'>
                    <h2>Spend {restCost} to rest for the day? </h2>
                    <br />
                    {notEnough  ? (
                        <h2>You don't have enough Money!</h2>
                    ) : (
                        <h2 className='rpg-button' style = {{fontSize: '25px'}} onClick={longRest}>Yes</h2>
                    )}
                    <h2 className='rpg-button' style = {{fontSize: '25px'}} onClick={resetChoice}>{notEnough ? "Crap" : "No"}</h2>
                </div>
            )}
            {choice === "save" && (
                <div className='rpg-box back-button' style={{minWidth: '200px', minHeight: '200px', textAlign: 'center'}}>
                    <h2>Game Saved Successfully!</h2>
                    <br />
                    <button className='rpg-button' style={{fontSize: '20px'}} onClick={resetChoice}>Ok</button>
                </div>
            )}
            {choice === "About" && (
                <div></div>
            )}
        </div>
    )
}

export default Main