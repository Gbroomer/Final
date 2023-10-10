import { MyContext } from '../Context'
import { useContext, useEffect, useState } from 'react'

function Shop() {

    const { user, sell, buy } = useContext(MyContext)
    const [treasures, setTreasures] = useState([])
    const [selling, setSelling] = useState(false)
    const [inventoryFull, setInventoryFull] = useState(false)
    const inventorySlots = Object.keys(user.inv[0])

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('http://127.0.0.1:5555/treasures')
                const treasures = await response.json()
                const filteredTreasures = treasures.filter(treasure => treasure.level <= user.lvl && treasure.level >= (user.lvl /2 - 1)).sort(() => Math.random() - 0.5).slice(0, 7)
                setTreasures(filteredTreasures)
            } catch (error) {
                console.log("Error fetching Treasures", error)
            }
        }
        fetchData()
    }, [])

    const purchaseItem = (treasure) => {
        const filteredUser = { ...user }
        const inventoryKeys = Object.keys(filteredUser.inv[0])
        let nullKey = null
        for (const key of inventoryKeys) {
            if (user.inv[0][key] === null) {
                nullKey = key
                break;
            }
        }
        if (nullKey) {
            buy(treasure, nullKey)
        } else {
            setInventoryFull(true)
        }
    }
    const sellItem = (treasure) => {
        const filteredUser = { ...user }
        const inventoryKeys = Object.keys(filteredUser.inv[0])
        let sellSlot = null
        for (const key of inventoryKeys) {
            if (filteredUser.inv[0][key] === treasure) {
                sellSlot = key
                break
            }
        }
        if (sellSlot) {
            sell(treasure, sellSlot)
        } else {
            console.log("ERROR: Could not match sold item to an inventory slot.")
        }
    }

    return (
        <div className='rpg-box'>
            <br />
            {selling ? (
                <div style={{ display: 'flex' }}>
                    {inventorySlots
                        .filter(key => key.startsWith('slot_') && user.inv[0][key] !== null)
                        .map(key => user.inv[0][key])
                        .map((treasure, index) => (
                            <div key={index} className='rpg-box' style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
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
                                <button className='rpg-button' style={{fontSize: "18px", display: 'flex', flexDirection: 'column', marginTop: 'auto' }} onClick={() => sellItem(treasure)}>Sell?</button>
                            </div>
                        ))}
                </div>
            ) : (
                <div style={{ display: 'flex' }}>
                    {treasures.map(treasure => (
                        <div key={treasures.indexOf(treasure)} className='rpg-box' style={{ flex: '1', display: 'flex', flexDirection: 'column'}}>
                            <br />
                            <h3>Name: {treasure.name}</h3>
                            <br />
                            <h4>Type: {treasure.type}</h4>
                            <br />
                            <h4>Cost: {treasure.cost}g</h4>
                            <br />
                            <h4>
                                {treasure.type === 'wep'
                                    ? `Damage Boost: ${treasure.damage_boost}`
                                    : treasure.type === 'arm'
                                        ? `Damage Reduction: ${treasure.damage_reduction}`
                                        : treasure.type === 'consume'
                                            ? `Max Restore: ${treasure.consumable_potency}`
                                            : null}
                            </h4>
                            <br />
                            {user.gold >= treasure.cost ? (
                                <>
                                    {inventoryFull === false ? (
                                        <>
                                            <button className='rpg-button' style={{fontSize: "18px", display: 'flex', flexDirection: 'column', marginTop: 'auto' }} onClick={() => purchaseItem(treasure)}>Purchase</button>
                                        </>
                                    ) : (
                                        <>
                                            <p>Inventory is Full 🙁</p>
                                        </>
                                    )}
                                </>
                            ) : (
                                <p>Not enough Gold to purchase</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
            <br />
            <button
                className='rpg-button'
                style={{ fontSize: '25px' }}
                onClick={() => {
                    setSelling(!selling)
                    setInventoryFull(false)
                }}>
                {selling ? "Buy?" : "Sell?"}
            </button>
        </div>
    )
}

export default Shop