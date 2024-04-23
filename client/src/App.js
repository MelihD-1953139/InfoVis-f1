import React, {useState, useEffect} from 'react'
import './App.css'


function App() {

    const [data, setData] = useState([{}])
    useEffect(() => {
        fetch("http://localhost:8000/test")
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                return res.json();
            })
            .then(data => {
                setData(data);
                console.log(data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);
    
    return (
        
        <div class="container">
            <link rel="stylesheet" href="./App.css"></link>
            <div class="data" id="root">
                {(typeof data.test === 'undefined') ? 
                (
                    <p>Loading...</p>
                ): 
                (
                    <p>{data.test}</p>
                )
                }
            </div>
        </div>
    );

    //when compare button is clicked, request with option field data to backend
    //display the data in a table
    
}


export default App;
