import { useState } from 'react'

function CharacterRender({ characterData, inv, user }) {
    const [abilities, setAbilities] = useState(false)
    const healthValue = (characterData.current_hp / characterData.max_hp) * 100
    const manaValue = (characterData.current_mp / characterData.max_mp) * 100
    const characterAbilities = characterData.character_class.abilities
    return (
        <div >
            <h2>{characterData.char_name}</h2>
            <h5>{characterData.character_class.class_name}</h5>
            <div className='rpg-progress'>
                <div className='rpg-progress-bar' style={{ width: `${healthValue}%`, backgroundColor: healthValue > 50 ? 'green' : 'red' }}>
                    <h4>{characterData.current_hp}/{characterData.max_hp}</h4>
                </div>
            </div>
            <div className='rpg-progress'>
                <div className='rpg-progress-bar' style={{ width: `${manaValue}%`, backgroundColor: manaValue > 50 ? 'blue' : '#002244' }}>
                    <h4>{characterData.current_mp}/{characterData.max_mp}</h4>
                </div>
            </div>
            {abilities ? (
                <>
                    <br></br>
                    <h2>Abilities:</h2>
                    {characterAbilities.map((ability, index) => (
                        ability.ability.level_req <= user.lvl && (
                                <div key = {index}>
                                    <br></br>
                                    <h4>Name: {ability.ability.name}</h4>
                                    <h4>cost: {ability.ability.cost}</h4>
                                </div>

                    )))}
                    <br></br>
                    <button className='rpg-button' style={{ fontWeight: 'bold' }} onClick={() => setAbilities(false)}>Show Attributes</button>
                </>
            ) : (
                <>
                    {inv === true && (
                        <div>
                            <br></br>
                            <ul className='rpg-nav'>
                                <li className='rpg-nav-item'>
                                    Str: {characterData.str}
                                </li>
                                <li className='rpg-nav-item'>
                                    Agi: {characterData.agi}
                                </li>
                                <li className='rpg-nav-item'>
                                    Con: {characterData.con}
                                </li>
                                <li className='rpg-nav-item'>
                                    Mag: {characterData.mag}
                                </li>
                                <li className='rpg-nav-item'>
                                    Res: {characterData.res}
                                </li>
                                <li className='rpg-nav-item'>
                                    Spd: {characterData.spd}
                                </li>
                                <br>
                                </br>
                                <p>Equipment: </p>
                                <li className='rpg-nav-item'>
                                    Wep: {characterData.weapon.name}
                                    <ul className='rpg-nav'>
                                        <li className='rpg-nav-item'>
                                            Damage Boost: {characterData.weapon.damage_boost}
                                        </li>
                                    </ul>
                                </li>
                                <li className='rpg-nav-item'>
                                    Arm: {characterData.armor.name}
                                    <ul className='rpg-nav'>
                                        <li className='rpg-nav-item'>
                                            Damage Reduced: {characterData.armor.damage_reduction}
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                            <br></br>
                            <button className='rpg-button' style={{ fontWeight: 'bold' }} onClick={() => setAbilities(true)}>Show Abilities</button>
                        </div>
                    )}

                </>
            )}
        </div>
    )
}

export default CharacterRender