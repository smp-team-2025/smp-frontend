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


export async function forgotPassword(email: string) {
  const response = await fetch(`${URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Passwort konnte nicht zurückgesetzt werden.");
  }

  return data;
}

export async function getMe(headers: HeadersInit) {
  const res = await fetch("/api/users/me", { headers });
  if (!res.ok) throw new Error("Failed to load user");
  return res.json() as Promise<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
}