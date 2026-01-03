import './SearchBar.css'
import LogoMeli from '../../assets/LogoMeli.png';
import { AiOutlineSearch } from "react-icons/ai";

const SearchBar = ({ handleChange, searchQuery, setSearchQuery}) => {
    return (
        <form onSubmit={handleChange} className='searchBar'>
            <div className='logoWrap'>
                <img className='logoMeli' src={LogoMeli} alt='logoMercadoLibre'/>
            </div>
            <div className='input-searchIcon-container'>
                <input className='input' placeholder='Nunca dejes de buscar' value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
                <button type='onSubmit' className='searchButton'><AiOutlineSearch className='searchIcon'/></button>
            </div>
        </form>
    )
}

export default SearchBar;