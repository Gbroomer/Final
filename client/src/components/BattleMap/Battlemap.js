import { MyContext } from '../Context'
import { useContext, useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import CharacterRender from '../CharacterRenders/CharacterRender'

function Battlemap() {

    const { user, monsters, environment, environments, consumeItem, generateMonsters, textResp, turnOrder, damageMonster, resetText, dodged, runVictory, damageChar, inspection, healChar, insufficientMana, runLoss, rest, runAway, spellTarget, stunTarget, bleedTarget, triggerBleed, } = useContext(MyContext)
    const [combatCommand, setCombatCommand] = useState('')
    const [abilityType, setAbilityType] = useState('')
    const [ability, setAbility] = useState(null)
    const [item, setItem] = useState(null)
    const [itemType, setItemType] = useState('')
    const history = useHistory()
    const charArray = [1, 2, 3, 4]
    let xpThreshold = Math.pow(2, user.lvl)
    let xpValue = (user.xp / xpThreshold)
    const inventorySlots = Object.keys(user.inv[0])

    console.log(turnOrder)

    useEffect(() => {
        const performDamage = async () => {
            if (Array.isArray(turnOrder) && turnOrder.length > 1 && turnOrder[0].type === 'monster' && turnOrder.filter(char => char.type === 'char').length > 0) {
                let filteredTurnOrder = turnOrder.filter(char => char.type === 'char');
                let targetChar = Math.round(Math.floor(Math.random() * filteredTurnOrder.length));
                let targetedCharacter = filteredTurnOrder[targetChar]
                let damage_ability = turnOrder[0].damage_ability;
                let damageDealt = Math.round(Math.floor((Math.random() * (turnOrder[0][damage_ability] / 2)) + turnOrder[0].damage_range) - ((filteredTurnOrder[targetChar].con / 4) + filteredTurnOrder[targetChar].armor.damage_reduction));
                console.log(filteredTurnOrder[targetChar])
                if (damageDealt <= 0) {
                    damageDealt = Math.round(Math.floor(Math.random() * 5) + 1);
                }
                const runDamage = async (damage, targetedCharacter) => {
                    damageChar(damage, targetedCharacter);
                };
                let dodgeChance = Math.floor(Math.random() * 200) + 1;
                if (turnOrder.length > 0 && filteredTurnOrder[targetChar].agi > dodgeChance) {
                    dodged(filteredTurnOrder[targetChar], turnOrder[0], 1);
                } else {
                    await runDamage(damageDealt, targetedCharacter);
                }
            } else if ((turnOrder.length > 0 && turnOrder.filter(monst => monst.type === 'monster')).length <= 0) {
                setCombatCommand('victory');
                runVictory();
            } else if ((turnOrder.length > 0 && turnOrder.filter(char => char.type === 'char')).length <= 0) {
                setCombatCommand('loss');
                runLoss();
            }
        };
        
        const delay = 500;
        const timerId = setTimeout(() => {
            performDamage();
        }, delay);
        
        return () => clearTimeout(timerId);
    }, [turnOrder]);

    const attack = async (monster) => {
        // console.log(turnOrder[0])
        const targetMonster = turnOrder.findIndex((monst) => monst.uniqueKey === monster.uniqueKey)
        console.log(turnOrder[0])
        let damageDealt = Math.round((Math.floor(Math.random() * turnOrder[0].str) + (turnOrder[0].weapon.damage_boost + (turnOrder[0].str / 4))) - (turnOrder[targetMonster].con / 4))
        if (damageDealt <= 0) {
            damageDealt = 1
        }
        let dodgeChance = Math.floor(Math.random() * 200) + 1
        setCombatCommand("")
        if (turnOrder[targetMonster].agi > dodgeChance) {
            dodged(turnOrder[targetMonster], turnOrder[0], 1)
        } else {
            await damageMonster(damageDealt, targetMonster)
        }
    }

    const heal = async (character) => {
        if (turnOrder[0].current_mp >= ability.cost) {
            const targetChar = turnOrder.findIndex((char) => char.id === character.id)
            const healAmount = Math.round(Math.floor((Math.random() * turnOrder[0][`${ability.effect_ability}`] / 4) + ability.effect_power) + (turnOrder[targetChar].con / 4))
            healChar(healAmount, ability.cost, turnOrder[targetChar])
        } else {
            insufficientMana()
        }
        setAbility(null)
        setAbilityType('')
        setCombatCommand('')
    }

    const inspectMonster = (monster) => {
        const targetMonster = turnOrder.findIndex((monst) => monst.uniqueKey === monster.uniqueKey)
        inspection(turnOrder[targetMonster])

    }

    const spell = async (monster) => {
        if (turnOrder[0].current_mp >= ability.cost) {
            const targetMonster = turnOrder.findIndex((monst) => monst.uniqueKey === monster.uniqueKey)
            const resistance = ability.damage_type === 'Physical' ? "con" : "res"
            const damageAmount = Math.round(Math.floor((Math.random() * turnOrder[0][`${ability.damage_ability}`]) + (ability.damage_bonus + (turnOrder[0][`${ability.damage_ability}`] / 4 + (turnOrder[0].weapon.damage_boost)))) - (turnOrder[targetMonster][resistance] / 4))
            spellTarget(damageAmount, ability.cost, targetMonster, ability)
        } else {
            insufficientMana()
        }
        setAbility(null)
        setAbilityType('')
        setCombatCommand('')
    }

    const stun = async (monster) => {
        if (turnOrder[0].current_mp >= ability.cost) {
            const targetMonster = turnOrder.findIndex((monst) => monst.uniqueKey === monster.uniqueKey)
            const resistance = ability.damage_type === 'Physical' ? "con" : "res"
            const spellResistance = ability.effect_type === 'Physical' ? 'con' : 'res'
            const damageAmount = Math.round(Math.floor((Math.random() * turnOrder[0][`${ability.damage_ability}`]) + (ability.damage_bonus + (turnOrder[0][`${ability.damage_ability}`] / 4 + (turnOrder[0].weapon.damage_boost)))) - (turnOrder[targetMonster][resistance] / 4))
            if (damageAmount <= 0) {
                damageAmount = 1;
            }
            const spellChance = Math.round(Math.floor((Math.random() * turnOrder[0][`${ability.effect_ability}`]) + (ability.effect_power + (turnOrder[0][`${ability.effect_ability}`] / 4))))
            const spellSuccess = spellChance > (turnOrder[targetMonster][spellResistance]) ? true : false
            console.log(`successChance: ${spellChance}`, `succeeded: ${spellSuccess}`, `Damage: ${damageAmount}`)
            stunTarget(damageAmount, ability.cost, targetMonster, ability, spellSuccess)
        } else {
            insufficientMana()
        }
        setAbility(null)
        setAbilityType('')
        setCombatCommand('')
    }

    const bleed = async (monster) => {
        if (turnOrder[0].current_mp >= ability.cost) {
            const targetMonster = turnOrder.findIndex((monst) => monst.uniqueKey === monster.uniqueKey)
            const resistance = ability.damage_type === 'Physical' ? 'con' : 'res'
            const spellResistance = ability.effect_type === 'Physical' ? 'con' : 'res'
            const damageAmount = Math.round(Math.floor((Math.random() * turnOrder[0][`${ability.damage_ability}`]) + (ability.damage_bonus + turnOrder[0].weapon.damage_boost)) - (turnOrder[targetMonster][resistance] / 4))
            if (damageAmount <= 0) {
                damageAmount = 1
            }
            const spellChance = Math.round(Math.floor((Math.random() * turnOrder[0][`${ability.effect_ability}`]) + (ability.effect_power + (turnOrder[0][`${ability.effect_ability}`] / 4))))
            const spellSuccess = spellChance > (turnOrder[targetMonster][spellResistance]) ? true : false
            console.log(`successChance: ${spellChance}`, `resistChance: ${turnOrder[targetMonster][spellResistance]}`, `succeeded: ${spellSuccess}`, `Damage: ${damageAmount}`)
            bleedTarget(damageAmount, ability.cost, targetMonster, ability, spellSuccess)
        } else {
            insufficientMana()
        }
        setAbility(null)
        setAbilityType('')
        setCombatCommand('')
    }

    const targetItem = async (target) => {
        if (item) {
            let targetCharKey
            let slotKey
            const charKeys = ['char1', 'char2', 'char3', 'char4']
            for (const charKey of charKeys) {
                if (user[charKey].id === target.id) {
                    targetCharKey = charKey
                    break
                }
            }
            for (const key in user.inv[0]) {
                if (user.inv[0][key] === item) {
                    slotKey = key
                    break
                }
            }

            console.log('Item: ', item, 'target: ', targetCharKey, 'slot:', slotKey)
            consumeItem(item, targetCharKey, slotKey)
            setItem(null)
            setItemType('')
            setCombatCommand('')
        }
    }

    const run = async () => {
        const chars = turnOrder.filter(char => char.type === 'char')
        const monst = turnOrder.filter(mon => mon.type === 'monster')
        let charSpeed = 0, monSpeed = 0
        chars.forEach(char => {
            charSpeed += Math.floor(Math.random() * char.spd) + 1
        })
        monst.forEach(mon => {
            monSpeed += Math.floor(Math.random() * mon.spd) + 1
        })
        console.log(charSpeed, monSpeed)
        if (charSpeed >= monSpeed) {
            runAway(charSpeed, monSpeed)
            setCombatCommand('victory')
        } else {
            setCombatCommand('')
            runAway(charSpeed, monSpeed)
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
                                {(combatCommand !== 'victory' && combatCommand !== 'loss') ? (
                                    <>
                                        <h1>{turnOrder.length > 0 && turnOrder[0].char_name ? turnOrder[0].char_name : 'Enemy'}'s Turn</h1>
                                        <br />
                                        {turnOrder.length > 0 && turnOrder[0].name ? (
                                            <></>
                                        ) : (
                                            //combatCommands Buttons
                                            <>
                                                <h2 className='rpg-button' onClick={() => {
                                                    resetText()
                                                    setAbility(null)
                                                    setAbilityType('')
                                                    setItem(null)
                                                    setItemType('')
                                                    setCombatCommand('attack')
                                                }}>Attack</h2>
                                                <br />
                                                <h2 className='rpg-button' onClick={() => {
                                                    resetText()
                                                    setAbility(null)
                                                    setAbilityType('')
                                                    setItem(null)
                                                    setItemType('')
                                                    setCombatCommand('abilities')
                                                }}>Abilites</h2>
                                                <br />
                                                <h2 className='rpg-button' onClick={() => {
                                                    resetText()
                                                    setAbility(null)
                                                    setAbilityType('')
                                                    setItem(null)
                                                    setItemType('')
                                                    setCombatCommand('items')
                                                }}>Items</h2>
                                                <br />
                                                <h2 className='rpg-button' onClick={() => {
                                                    resetText()
                                                    setAbility(null)
                                                    setAbilityType('')
                                                    setItem(null)
                                                    setItemType('')
                                                    setCombatCommand('inspect')
                                                }}>Inspect</h2>
                                                <br />
                                                <h2 className='rpg-button' onClick={() => {
                                                    resetText()
                                                    setAbility(null)
                                                    setAbilityType('')
                                                    setItem(null)
                                                    setItemType('')
                                                    setCombatCommand('run')
                                                }}>Run</h2>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {combatCommand === 'victory' ? (
                                            <>
                                                <h1 className='rpg-button' style={{ fontSize: '20px' }} onClick={() => history.push('/main')}> Return To Town</h1>
                                            </>
                                        ) : (
                                            <>
                                                <h1 className='rpg-button' style={{ fontSize: '20px' }} onClick={() => {
                                                    rest(0)
                                                    history.push('/main')
                                                }}> Return To Town</h1>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                            {combatCommand !== "victory" || combatCommand !== '' ?
                                (
                                    <div className='rpg-box' style={{ flex: '0.5', height: '100%' }}>
                                        {combatCommand === 'attack' && (
                                            <>
                                                <h3>Attack Which Target: </h3>
                                                <br />

                                                {turnOrder.length > 0 && (turnOrder
                                                    .filter(monst => monst.type === 'monster')
                                                    .sort((a, b) => a.uniqueKey - b.uniqueKey)
                                                    .map((monster, index) => (
                                                        <div key={index}>
                                                            <h3 className='rpg-button' onClick={() => attack(monster)}>{`${monster.name} ${monster.uniqueKey}`}</h3>
                                                        </div>
                                                    )))}
                                            </>
                                        )}
                                        {combatCommand === 'abilities' && (
                                            <>
                                                {abilityType === '' && (
                                                    <>
                                                        <h3>Use Which Ability: </h3>
                                                        {turnOrder.length > 0 && turnOrder[0].character_class.abilities.length > 0 && (turnOrder[0].character_class.abilities
                                                            .map((ability, index) => (
                                                                <div key={index}>
                                                                    <h3 className='rpg-button' onClick={() => {
                                                                        setAbility(ability.ability)
                                                                        setAbilityType(`${ability.ability.effect_version}`)
                                                                    }}>{`${ability.ability.name}`}: {ability.ability.cost}mp</h3>
                                                                </div>
                                                            )))}
                                                    </>
                                                )}
                                                {abilityType === 'Heal' && (
                                                    <>
                                                        <h3>Use {ability.name} On Who: </h3>
                                                        {turnOrder.length > 0 && (turnOrder
                                                            .filter(char => char.type === 'char')
                                                            .sort((a, b) => a.id - b.id)
                                                            .map((character, index) => (
                                                                <div key={index}>
                                                                    <h3 className='rpg-button' onClick={() => heal(character)}>{character.char_name}</h3>
                                                                </div>
                                                            )))}
                                                    </>
                                                )}
                                                {abilityType === 'Stun' && (
                                                    <>
                                                        <h3>Use {ability.name} On Who: </h3>
                                                        {turnOrder.length > 0 && (turnOrder
                                                            .filter(monst => monst.type === 'monster')
                                                            .sort((a, b) => a.uniqueKey - b.uniqueKey)
                                                            .map((monster, index) => (
                                                                <div key={index}>
                                                                    <h3 className='rpg-button' onClick={() => stun(monster)}>{`${monster.name} ${monster.uniqueKey}`}</h3>
                                                                </div>
                                                            )))}
                                                    </>
                                                )}
                                                {abilityType === 'Spell' && (
                                                    <>
                                                        <h3>Use {ability.name} On Who: </h3>
                                                        {turnOrder.length > 0 && (turnOrder
                                                            .filter(monst => monst.type === 'monster')
                                                            .sort((a, b) => a.uniqueKey - b.uniqueKey)
                                                            .map((monster, index) => (
                                                                <div key={index}>
                                                                    <h3 className='rpg-button' onClick={() => spell(monster)}>{`${monster.name} ${monster.uniqueKey}`}</h3>
                                                                </div>
                                                            )))}
                                                    </>
                                                )}
                                                {abilityType === 'Bleed' && (
                                                    <>
                                                        <h3>Use {ability.name} On Who: </h3>
                                                        {turnOrder.length > 0 && (turnOrder
                                                            .filter(monst => monst.type === 'monster')
                                                            .sort((a, b) => a.uniqueKey - b.uniqueKey)
                                                            .map((monster, index) => (
                                                                <div key={index}>
                                                                    <h3 className='rpg-button' onClick={() => bleed(monster)}>{`${monster.name} ${monster.uniqueKey}`}</h3>
                                                                </div>
                                                            )))}
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {combatCommand === 'items' && (
                                            <>
                                                {itemType === '' && (
                                                    <>
                                                        <h3>{inventorySlots
                                                            .filter(key => key.startsWith('slot_') && user.inv[0][key] !== null && user.inv[0][key].type === 'consume')
                                                            .map(key => user.inv[0][key]).length > 0 ? 'Use Which Item:' : 'No Consumables in Inventory'}</h3>
                                                        <br />
                                                        {turnOrder.length > 0 && (inventorySlots
                                                            .filter(key => key.startsWith('slot_') && user.inv[0][key] !== null && user.inv[0][key].type === 'consume')
                                                            .map(key => user.inv[0][key])
                                                            .map((item, index) => (
                                                                <div key={index}>
                                                                    <h3 className='rpg-button' onClick={() => {
                                                                        setItem(item)
                                                                        setItemType(item.consumable_effect)
                                                                    }}>{item.name}</h3>
                                                                </div>
                                                            )))}
                                                    </>
                                                )}
                                                {(itemType === 'heal' || itemType === 'mana') && (
                                                    <>
                                                        <h3>Use {item.name} On Who:</h3>
                                                        {turnOrder.length > 0 && (turnOrder
                                                            .filter(char => char.type === 'char')
                                                            .map((character, index) => (
                                                                <div key={index}>
                                                                    <h3 className='rpg-button' onClick={() => targetItem(character)}>{character.char_name}</h3>
                                                                </div>
                                                            )))}
                                                    </>
                                                )}
                                            </>
                                        )}
                                        {combatCommand === 'run' && (
                                            <>
                                                <h3>Are You Sure?</h3>
                                                <br />
                                                <h3 className='rpg-button' onClick={() => {
                                                    run()
                                                }}>Yes</h3>
                                                <h3 className='rpg-button' onClick={() => setCombatCommand('')}>No</h3>
                                            </>
                                        )}
                                        {combatCommand === 'inspect' && (
                                            <>
                                                <h3>Which Monster Would you Like to Inspect? </h3>
                                                <br />
                                                {turnOrder.length > 0 && (turnOrder
                                                    .filter(monst => monst.type === 'monster')
                                                    .sort((a, b) => a.uniqueKey - b.uniqueKey)
                                                    .map((monster, index) => (
                                                        <div key={index}>
                                                            <h3 className='rpg-button' onClick={() => inspectMonster(monster)}>{`${monster.name} ${monster.uniqueKey}`}</h3>
                                                        </div>
                                                    )))}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                    </>
                                )}
                        </div>
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', minWidth: '1000px', flexDirection: 'column' }}>
                            {textResp.length > 0 && (
                                <div className='rpg-title-box' style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', zIndex: 1, width: '100%' }}>
                                    {textResp.map((text, index) => (
                                        <div key={index}>
                                            <h3>{text}</h3>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <img src={environment.img_url} alt={`A ${environment.name}`} className='rpg-img'></img>
                            {turnOrder.length > 0 && (turnOrder
                                .filter(monst => monst.type === 'monster')
                                .sort((a, b) => a.uniqueKey - b.uniqueKey)
                                .map((monster, index) => (
                                    <div key={index} style={{ position: 'absolute', top: `25%`, left: `50%`, transform: `translate( -50%, 0) translateX(${(index - Math.floor(monsters.length / 2)) * 90}%)`, width: '20%', textAlign: 'center' }}>
                                        <img src={monster.img_url} alt={`A ${monster.name}`} style={{ maxWidth: '100%', height: 'auto' }}></img>
                                        <h3>{`${monster.name} ${monster.uniqueKey}`}</h3>
                                    </div>
                                )))}
                        </div>
                    </div>
                    <div className='rpg-box'>
                        <button className='rpg-button' onClick={() => history.push('/main')}>Cheat Return</button>
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