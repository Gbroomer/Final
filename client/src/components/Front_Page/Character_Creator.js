import { MyContext } from '../Context'
import { useState, useContext, useEffect, } from 'react'
import { useHistory } from 'react-router-dom'


function Character_Creator() {
    const { user, login } = useContext(MyContext)
    const [charNames, setCharNames] = useState(['', '', '', ''])
    const [charClasses, setCharClasses] = useState([-1, -1, -1, -1])
    const [classes, setClasses] = useState([])
    const [confirm, setConfirm] = useState(false)
    const history = useHistory()

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch("http://127.0.0.1:5555/classes")
                const classesData = await response.json()
                setClasses(classesData)
            } catch (error) {
                console.log("Error fetching classes:", error)
            }
        }
        fetchData()
    }, [])

    const handleChange = (index, name) => {
        const updatedCharNames = [...charNames]
        updatedCharNames[index] = name
        setCharNames(updatedCharNames)
        console.log(updatedCharNames)
    }

    const handleClassChange = (charIndex, classIndex) => {
        const updatedSelectedClasses = [...charClasses]
        updatedSelectedClasses[charIndex] = classIndex
        console.log(updatedSelectedClasses)
        console.log(classes)
        setCharClasses(updatedSelectedClasses)
    }

    const handleSubmit = async () => {
        if (charNames.every(name => name.trim() !== '') && charClasses.every(cls => cls !== null)) {
            const postRequests = charNames.map(async (char, index) => {
                const selectedClass = classes.find((cls) => cls.id === charClasses[index])
                const newCharacter = {
                    char_name: char,
                    char_class: selectedClass.id,
                    str: 10 + parseInt(selectedClass.str_growth, 10),
                    agi: 10 + parseInt(selectedClass.agi_growth, 10),
                    con: 10 + parseInt(selectedClass.con_growth, 10),
                    mag: 10 + parseInt(selectedClass.mag_growth, 10),
                    res: 10 + parseInt(selectedClass.res_growth, 10),
                    spd: 10 + parseInt(selectedClass.spd_growth, 10),
                    current_hp: 10 + parseInt(selectedClass.hp_growth, 10),
                    max_hp: 10 + parseInt(selectedClass.hp_growth, 10),
                    current_mp: 10 + parseInt(selectedClass.mp_growth, 10),
                    max_mp: 10 + parseInt(selectedClass.mp_growth, 10),
                    wep_id: 1,
                    arm_id: 2,
                }
                console.log(newCharacter)
                console.log(user)
                const resp = await fetch(`http://127.0.0.1:5555/chars`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(newCharacter),
                })
                return resp.json()
            })
            const responses = await Promise.all(postRequests)
            console.log(responses)
            const newUser = {
                username: user.username,
                password: user.password,
                char_1: responses[0].id,
                char_2: responses[1].id,
                char_3: responses[2].id,
                char_4: responses[3].id,
                gold: 25,
            }
            try {
                const resp = await fetch('http://127.0.0.1:5555/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify(newUser)
                })
                const generatedUser = await resp.json()
                console.log(generatedUser.id)
                const inventory = {
                    user_id: generatedUser.id
                }
                try {
                    const respInv = await fetch('http://127.0.0.1:5555/inventories', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify(inventory),
                    })
                    const generatedInventory = await respInv.json()
                    console.log(generatedInventory)
                    const finalCharacterCreationResp = await fetch(`http://127.0.0.1:5555/users/${generatedUser.id}`)
                    const finalizedCharacter = await finalCharacterCreationResp.json()
                    console.log(finalizedCharacter)
                    login(finalizedCharacter)
                    history.push("/Main")
                } catch (error) {
                    alert(error.message)
                }
            } catch (error) {
                alert(error.message)
            }
        }
        else {
            alert("Make sure to give a name and class to every party member.")
            setConfirm(false)
        }

    }

    return (
        <div className='rpg-box'>
            {confirm ? (
                <>
                    {charNames.map((charName, charIndex) => (
                        <>
                            <div key={charIndex} className='rpg-box'>
                                <h2>Name: {charName}</h2>
                                <br />
                                {charClasses[charIndex] !== -1 ? (
                                    <>
                                        <h3>Class: {classes.find((cls) => cls.id === charClasses[charIndex]).class_name}</h3>
                                    </>
                                ) : (
                                    <>
                                        <h3>No Class Chosen</h3>
                                    </>
                                )}
                            </div>
                            <br/>
                        </>
                    ))}
                    <button className='rpg-button' onClick={handleSubmit}>Save</button>
                    <button className='rpg-button' onClick={() => setConfirm(false)}>Back</button>
                </>
            ) : (
                <>
                    <h2>Create your party:</h2>
                    {charNames.map((charName, charIndex) => (
                        <div key={charIndex} className='rpg-box'>
                            <label className='rpg-textbox'>Character No. {charIndex + 1}</label>
                            <input type="text"
                                className='rpg-textbox'
                                placeholder={`Name`}
                                value={charName}
                                onChange={(e) => handleChange(charIndex, e.target.value)}
                            />
                            <br></br>
                            <ul className='rpg-nav'>
                                {classes.map((cls) => (
                                    <label key={cls.id} className='rpg-toggle'>
                                        <input
                                            type='radio'
                                            name={`char_${cls.id}`}
                                            checked={charClasses[charIndex] === cls.id}
                                            onChange={() => handleClassChange(charIndex, cls.id)} />
                                        <i></i>
                                        {cls.class_name}
                                    </label>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <br />
                    <button
                        className='rpg-button'
                        onClick={() => setConfirm(true)}>
                        Confirm
                    </button>
                </>
            )}
        </div>
    )
}

export default Character_Creator