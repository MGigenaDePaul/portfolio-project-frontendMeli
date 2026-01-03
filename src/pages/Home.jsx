
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/searchBar/SearchBar';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const handleChange = (event) => {
        event.preventDefault()
        navigate(`/items?search=${searchQuery}`)
    }

    return (
        <div>
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleChange={handleChange} />
        </div>
    )
}

export default Home;