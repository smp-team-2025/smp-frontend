const URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth`;

export async function login(email: string,password: string){
    const response = await fetch(`${URL}/login`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({email,password}),
    });

    if(!response.ok){
        const error = await response.text();
        throw new Error(error);
    }
    return response.json();
}

// TODO: Add forgot password function when backend implements it.
