const URL = `/api/auth`;

export async function login(email: string,password: string){
    const response = await fetch(`${URL}/login`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({email,password}),
    });

    if(!response.ok){
        const error = await response.text();
        throw new Error(error || "Login fehlgeschlagen.");
    }
    return response.json();
}


export async function forgotPassword(email: string){
    const response = await fetch(`${URL}/forgot-password`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({email}),
    });

    if(!response.ok){
        const error = await response.text();
        throw new Error(error || "Gegebene E-Mail konnte nicht gefunden werden.");
    }
    return response.json();

        
}

export async function resetPassword(token: string, newPassword: string, confirmPassword: string){
    const response = await fetch(`${URL}/reset-password`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({token,newPassword,confirmPassword}),
    });

    if(!response.ok){
        const error = await response.text();
        throw new Error(error || "Passwort konnte nicht zurückgesetzt werden.");
    }
    return response.json();
}