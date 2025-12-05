const URL = "http://localhost:3000/api/registration";

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
        const error = await response.text();
        throw new Error(error);
    }

    return response.json();
}