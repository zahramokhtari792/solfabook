import { createContext, useContext, useState, useRef, useEffect } from 'react';
const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [loginModal, setLoginModal] = useState(false);
    const hideModal = ()=>{
        setLoginModal(false)
    }
    const showModal = ()=>{
        setLoginModal(true)
    }
    return (
        <LoginContext.Provider value={{ loginModal, hideModal, showModal }}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLoginModal = () => useContext(LoginContext);
