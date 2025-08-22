import { createContext, useContext, useState, useRef, useEffect } from 'react';
const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [searchModal, setSearchModal] = useState(false);
    const hideSearchModal = ()=>{
        setSearchModal(false)
    }
    const showSearchModal = ()=>{
        setSearchModal(true)
    }
    return (
        <SearchContext.Provider value={{ searchModal, hideSearchModal, showSearchModal }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearchModal = () => useContext(SearchContext);
