import { useHistory } from 'react-router-dom'

function About() {
    const history = useHistory()

    return (
        <div className= 'rpg-box'>
            <h1>YOU GET NOTHING!</h1>
            <button className='rpg-button' onClick={() => {history.goBack()}}>Back</button>
        </div>
    )
}

export default About