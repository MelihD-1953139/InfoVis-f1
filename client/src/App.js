import React, {useState, useEffect} from 'react'

function App() {

    const [data, setData] = useState([{}])
    useEffect(() => {
        fetch("/test")
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
        <div>
            {(typeof data.test === 'undefined') ? 
            (
                <p>Loading...</p>
            ): 
            (
                <p>{data.test}</p>
            )
            }
        </div>
    );
}

export default App;
