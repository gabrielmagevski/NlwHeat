import axios from "axios";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type AuthResponse = {
  token: string;
  user: { 
    id: string;
    name: string;
    avatar_url: string;
    login: string;
  }
}

type User = { 
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthContextData = { 
  user: User | null;
  signInUrl: string;
  sigInOut: () => void;
}

type AuthProviderType = { 
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider(props: AuthProviderType) {
  const [user, setUser] = useState<User | null>(null)

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=d8398933a9a22423953d`;
  
  async function sigIn(githubCode: string) { 
    const response = await api.post<AuthResponse>('authenticate', {
      code: githubCode
    })

    const { token, user } = response.data;

    localStorage.setItem('@dowhile:token', token);
    
    api.defaults.headers.common.authorization = `Bearer ${token}`;


    setUser(user);
  }

  function sigInOut() {
    setUser(null)
    localStorage.removeItem('@dowhile:token');
  }

  useEffect(() => { 
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if(hasGithubCode) { 
      const [urlWithoutCode, githubCode] = url.split('?code=');

      window.history.pushState({}, '', urlWithoutCode);
     
      sigIn(githubCode)
    }
  }, [])

  useEffect(() => { 
    const token = localStorage.getItem('@dowhile:token');

    if(token) { 
      api.defaults.headers.common.authorization = `Bearer ${token}`;
    
      api.get("profile").then(response => {
        console.log(response.data)
      })
    }
  }, [])

  return( 
    <AuthContext.Provider value={{signInUrl, user, sigInOut}}>
      {props.children}
    </AuthContext.Provider>
  )
}