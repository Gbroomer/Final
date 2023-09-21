import { MyContext } from '../Context'
import { useContext, useState, useEffect } from 'react'
import { UNSAFE_DataRouterStateContext, useHistory } from 'react-router-dom'
import CharacterRender from '../CharacterRenders/CharacterRender'

function Battlemap() {

    const { user, monsters, environment, environments, consumeItem, addXp, generateMonsters, textResp, turnOrder, damageMonster, resetText, dodged, victory, damageChar } = useContext(MyContext)
    const [combatCommand, setCombatCommand] = useState('')
    const history = useHistory()
    const charArray = [1, 2, 3, 4]
    let xpThreshold = Math.pow(2, user.lvl)
    let xpValue = (user.xp / xpThreshold)

    useEffect(() => {
        const performDamage = async () => {
            if (Array.isArray(turnOrder) && turnOrder.length > 1 && turnOrder[0].type === 'monster') {

                let filteredTurnOrder = turnOrder.filter(char => char.type === 'char')
                let targetChar = Math.round(Math.floor(Math.random() * filteredTurnOrder.length))
                console.log(targetChar)
                console.log(turnOrder)
                let damage_ability = turnOrder[0].damage_ability
                console.log(filteredTurnOrder[targetChar])
                let damageDealt = Math.round(Math.floor((Math.random() * (turnOrder[0][damage_ability] / 2)) + turnOrder[0].damage_range) - ((filteredTurnOrder[targetChar].con / 4) + filteredTurnOrder[targetChar].armor.damage_reduction))
                console.log(damageDealt)
                if (damageDealt <= 0) {
                    damageDealt = 1
                }
                const runDamage = async (damage, character) => {
                    damageChar(damage, character)
                }
                let dodgeChance = Math.floor(Math.random() * 200) + 1
                if (filteredTurnOrder[targetChar].agi > dodgeChance) {
                    dodged(targetChar, turnOrder[0], 1)
                } else {
                    await runDamage(damageDealt, filteredTurnOrder[targetChar])
                }

            }
            // if ((Array.isArray(turnOrder) && turnOrder.filter(monst => monst.type === 'monster')).length <= 0) {
            //     console.log('nice')
            // }
        }
        const delay = 500
        const timerId = setTimeout(() => {
            performDamage()
        }, delay)
        return () => clearTimeout(timerId)
    }, [turnOrder])

    const attack = async (monster) => {
        // console.log(turnOrder[0])
        const targetMonster = turnOrder.findIndex((monst) => monst.uniqueKey === monster.uniqueKey)
        console.log(turnOrder[0])
        let damageDealt = Math.round((Math.floor(Math.random() * turnOrder[0].str) + (turnOrder[0].weapon.damage_boost + 1)) - (turnOrder[targetMonster].con / 4))
        if (damageDealt <= 0) {
            damageDealt = 1
        }
        let dodgeChance = Math.floor(Math.random() * 200) + 1
        setCombatCommand("")
        if (turnOrder[targetMonster].agi > dodgeChance) {
            dodged(targetMonster, turnOrder[0], 1)
        } else {
            await damageMonster(damageDealt, targetMonster)
        }
    }

    return (
        <div>
            <div className='rpg-box'>
                <h4>Level: {user.lvl}        Gold: {user.gold}</h4>
                <h6>
                    {user.xp} / {xpThreshold} xp
                </h6>
                <div className='rpg-progress' style={{ display: 'flex' }}>
                    <div className='rpg-progress-bar' style={{ width: `${xpValue * 100}%`, backgroundColor: 'purple' }}>
                    </div>
                </div>
                <div style={{ display: 'flex' }}>
                    {charArray.map(index => (
                        <div className='rpg-box' key={index} style={{ flex: '1' }}>
                            <CharacterRender characterData={user[`char${index}`]} inv={false} user={user} />
                        </div>
                    ))}
                </div>
            </div>
            {monsters && textResp ? (
                <div>
                    <div className='rpg-box' style={{ maxHeight: '750px', overflow: 'auto', display: 'flex', flexWrap: 'wrap', justifyContent: "center" }}>
                        <div className='rpg-box' style={{ position: 'relative', display: 'flex', minWidth: '50px', flex: '1', textAlign: 'center', alignItems: 'flex-start' }}>
                            <div className='rpg-box' style={{ flex: '0.5', height: '100%' }}>
                                <h1>{turnOrder.length > 1 && turnOrder[0].char_name ? turnOrder[0].char_name : turnOrder[0].name}'s Turn</h1>
                                <br />
                                {turnOrder[0].name ? (
                                    <></>
                                ) : (
                                    <>
                                        <h2 className='rpg-button' onClick={() => {
                                            resetText()
                                            console.log(turnOrder)
                                            setCombatCommand('attack')
                                        }}>Attack</h2>
                                        <br />
                                        <h2 className='rpg-button' onClick={() => {
                                            resetText()
                                            setCombatCommand('abilities')
                                        }}>Abilites</h2>
                                        <br />
                                        <h2 className='rpg-button' onClick={() => {
                                            resetText()
                                            setCombatCommand('items')
                                        }}>Items</h2>
                                        <br />
                                        <h2 className='rpg-button' onClick={() => {
                                            resetText()
                                            setCombatCommand('inspect')
                                        }}>Inspect</h2>
                                        <br />
                                        <h2 className='rpg-button' onClick={() => {
                                            resetText()
                                            setCombatCommand('run')
                                        }}>Run</h2>
                                    </>
                                )}
                            </div>
                            {combatCommand !== "" ?
                                (
                                    <div className='rpg-box' style={{ flex: '0.5', height: '100%' }}>
                                        {combatCommand === 'attack' ? (
                                            <>
                                                <h3>Attack Which Target: </h3>
                                                <br />

                                                {turnOrder.length > 1 && (turnOrder
                                                    .filter(monst => monst.type === 'monster')
                                                    .map((monster, index) => (
                                                        <div key={index}>
                                                            <h3 className='rpg-button' onClick={() => attack(monster)}>{`${monster.name} ${index + 1}`}</h3>
                                                        </div>
                                                    )))}
                                            </>
                                        ) : combatCommand === 'abilities' ? (
                                            <>

                                            </>
                                        ) : combatCommand === 'items' ? (
                                            <>

                                            </>
                                        ) : combatCommand === 'run' && (
                                            <>

                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                    </>
                                )}
                        </div>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', minWidth: '1000px', flexDirection: 'column' }}>
                            <div className='rpg-title-box' style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', zIndex: 1, width: '100%' }}>
                                {textResp.length > 0 && (
                                    textResp.map((text, index) => (
                                        <div key={index}>
                                            <h3>{text}</h3>
                                        </div>
                                    )))}
                            </div>
                            <img src={environment.img_url} alt={`A ${environment.name}`} className='rpg-img'></img>
                            {turnOrder.length > 1 && (turnOrder
                                .filter(monst => monst.type === 'monster')
                                .map((monster, index) => (
                                    <div key={index} style={{ position: 'absolute', top: `25%`, left: `50%`, transform: `translate( -50%, 0) translateX(${(index - Math.floor(monsters.length / 2)) * 90}%)`, width: '20%', textAlign: 'center' }}>
                                        <img src={monster.img_url} alt={`A ${monster.name}`} style={{ maxWidth: '100%', height: 'auto' }}></img>
                                        <h3>{`${monster.name} ${monster.uniqueKey}`}</h3>
                                    </div>
                                )))}
                        </div>
                    </div>
                    <div className='rpg-box'>
                        <button className='rpg-button' onClick={() => history.push('/main')}>back</button>
                    </div>
                </div>
            ) : (
                <div className='rpg-box centered-menu' >
                    <h3>Where would you like to go:</h3>
                    <br />
                    {environments.map((environ, index) => (
                        <button key={index} onClick={() => generateMonsters(environ)} className='rpg-button rpg-text-options'>{environ.name}</button>
                    ))}
                    <button className='rpg-button rpg-text-options' onClick={() => history.goBack()}>Return</button>
                </div>

            )}
        </div>
    )
}
export default Battlemap