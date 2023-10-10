import { useHistory } from 'react-router-dom'

function About() {
    const history = useHistory()

    return (
        <div className= 'rpg-box about-menu'>
            <h2>Created By: Grant Bruemmer</h2>
            <br />
            <h4>App created with React and Flask</h4>
            <br />
            <h4>Made in the style of an old-school SNES JRPG.</h4>
            <br />
            <button className='rpg-button' onClick={() => {history.goBack()}}>Back</button>
        </div>
    )
}

export default About