import { MyContext } from '../Context'
import { useContext, useState } from 'react'

function Inventory() {
    const { user, equip, consumeItem } = useContext(MyContext)
    const [putOn, setPutOn] = useState(false)
    const [pickedItem, setPickedItem] = useState(false)
    const inventorySlots = Object.keys(user.inv[0])

    const chooseItem = (treasure, consume) => {
        setPickedItem(treasure)
        setPutOn(!putOn)
        
    }
    const equipToCharacter = (character) => {
        if (pickedItem) {
            let slotKey
            for (const key in user.inv[0]) {
                if (user.inv[0][key] === pickedItem) {
                    slotKey = key
                    break
                }
            }
            console.log(slotKey)
            if (pickedItem.type === 'consume') {
                consumeItem(pickedItem, character, slotKey)
                setPickedItem(null)
                setPutOn(false)
            }
            else {
                equip(pickedItem, character, slotKey)
                setPickedItem(null)
                setPutOn(false)
            }
        }
    }
    return (
        <div className='rpg-box'>
            <br />
            <h2>Inventory Items:</h2>
            <br />
            {putOn ? (
                <>
                    <h3>Who would you like to {pickedItem.type === 'consume' ? "consume the" : "equip the "} {pickedItem.name}:</h3>
                    <br/>
                    <button className='rpg-button' onClick={() =>  equipToCharacter("char1")}>{user.char1.char_name}</button>
                    <br/>
                    <button className='rpg-button' onClick={() => equipToCharacter("char2")}>{user.char2.char_name}</button>
                    <br/>
                    <button className='rpg-button' onClick={() => equipToCharacter("char3")}>{user.char3.char_name}</button>
                    <br/>
                    <button className='rpg-button' onClick={() => equipToCharacter("char4")}>{user.char4.char_name}</button>
                    <br/>
                    <button className='rpg-button' onClick = {() => setPutOn(!putOn)}>Cancel</button>
                </>
            ) :  (
                <div style ={{display: 'flex'}}>
                    {inventorySlots
                    .filter(key => key.startsWith('slot_') && user.inv[0][key] !== null)
                    .map(key => user.inv[0][key])
                    .map(treasure => (
                        <div key= {treasure.id} className = 'rpg-box' style = {{flex: '1' }}>
                            <br />
                            <h3>Name: {treasure.name}</h3>
                            <br />
                            <h4>Type: {treasure.type}</h4>
                            <br />
                            <h4>Sell Value: {treasure.cost / 2}g</h4>
                            <br />
                            <h4>{treasure.type === 'wep' ? `Damage Boost: ${treasure.damage_boost}` : treasure.type === 'arm' ? `Damage Reduction: ${treasure.damage_reduction}` : `Max Restore:  ${treasure.consumable_potency}`}</h4>
                            <br />
                            <br />
                            <button className='rpg-button' onClick={() => chooseItem(treasure)}>{treasure.type === 'wep' ? "Equip?":treasure.type === 'arm' ? "Equip?" : "Use?"}</button>
                            
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
export default Inventory