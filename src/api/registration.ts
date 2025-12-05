const URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/register`;

export interface RegistrationData {
    salutation:string;
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;
    street: string;
    addressExtra: string;
    zipCode: string;
    city: string;
    school: string;
    grade: string;
    motivation: string;
    comments: string;
}

export async function userRegister(data:RegistrationData) {
    const response = await fetch(URL,{
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify(data),
    });

    if(!response.ok) {
        let error;
        try {
            error = await response.json();
        } catch (e) {
            error = { message: await response.text() };
        }
        throw new Error(error.message || 'Registration failed due to an unknown error.');
    }

    return response.json();
}